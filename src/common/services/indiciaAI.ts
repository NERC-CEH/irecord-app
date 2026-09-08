import axios, { type AxiosRequestConfig } from 'axios';
import camelCase from 'lodash.camelcase';
import mapKeys from 'lodash.mapkeys';
import { z, object, string, array, number } from 'zod';
import { HandledError, isAxiosNetworkError } from '@flumens';
import config from 'common/config';
import commonNamesByWarehouseId from 'common/data/species_ids.data.json';
import type Media from 'common/models/media';
import userModel from 'models/user';

const UKSI_LIST_ID = '15';

const suggestionSchema = object({
  probability: number(),
  taxon: string(),
  taxaTaxonListId: string(),
  taxonGroupId: string(),
});

type RemoteSuggestion = z.infer<typeof suggestionSchema>;

const resultSchema = object({
  classifierId: string(),
  classifierVersion: string(),
  suggestions: array(z.unknown()), // validated individually below
});

type RemoteResult = z.infer<typeof resultSchema>;

export type Suggestion = {
  warehouseId: number;
  group: number;
  scientificName: string;
  commonNames: string[];

  foundInName?: number;
  probability: number;
};

export type Result = RemoteResult & {
  suggestions: Suggestion[];
};

async function getCommonNames(sp: RemoteSuggestion) {
  const commonNames = (commonNamesByWarehouseId as Record<string, string[]>)[
    sp.taxaTaxonListId
  ];
  if (!commonNames?.length) return { commonNames: [] };

  return { commonNames, foundInName: 0 };
}

const transformToTaxon = async (sp: RemoteSuggestion): Promise<Suggestion> => ({
  probability: sp.probability,
  warehouseId: parseInt(sp.taxaTaxonListId, 10),
  scientificName: sp.taxon,
  group: parseInt(sp.taxonGroupId, 10),

  ...(await getCommonNames(sp)),
});

export default async function identify(
  images: Media[],
  classifier: '/' | 'plantnet' = '/'
): Promise<Result> {
  const token = await userModel.getAccessToken();

  const upload = (img: Media) => img.uploadFile();
  await Promise.all(images.map(upload));

  const data = new URLSearchParams({ list: UKSI_LIST_ID });
  images.forEach((img: Media) => data.append('image[]', img.getRemoteURL()));

  const options: AxiosRequestConfig = {
    method: 'post',
    url: `${config.backend.url}/api-proxy/indicia?_api_proxy_uri=${classifier}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
    timeout: 80000,
  };

  let response: RemoteResult;
  try {
    const { data: rawResponse } = await axios<unknown>(options);
    const getValues = (doc: unknown): Record<string, unknown> =>
      doc && typeof doc === 'object'
        ? mapKeys(doc, (_, key) => camelCase(key))
        : {};
    const values = getValues(rawResponse);
    const suggestions = Array.isArray(values.suggestions)
      ? values.suggestions.map(getValues)
      : [];
    response = resultSchema.parse({ ...values, suggestions });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }

  const hasValues = (value: unknown): value is RemoteSuggestion =>
    suggestionSchema.safeParse(value).success;
  const suggestions = await Promise.all(
    response.suggestions.filter(hasValues).map(transformToTaxon)
  );

  return {
    classifierId: response.classifierId,
    classifierVersion: response.classifierVersion,
    suggestions,
  };
}
