import axios from 'axios';
import camelCase from 'lodash.camelcase';
import mapKeys from 'lodash.mapkeys';
import { z, object, string, array, number } from 'zod';
import { HandledError, isAxiosNetworkError } from '@flumens';
import config from 'common/config';
import Media from 'common/models/media';
import { Taxon } from 'models/occurrence';
import userModel from 'models/user';
import speciesSearch from 'helpers/taxonSearch';

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
  suggestions: array(z.any()), // loose for initial pass
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
  const taxa: Taxon[] = await speciesSearch(sp.taxon, {
    namesFilter: 'scientific',
    maxResults: 1,
  });

  const commonNames = taxa?.[0]?.commonNames;
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

  const data = new URLSearchParams({
    list: `${UKSI_LIST_ID}`,
  });

  images.forEach((img: Media) => data.append('image[]', img.getRemoteURL()));

  const options: any = {
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
    const res = await axios(options);
    const getValues = (doc: any) => mapKeys(doc, (_, key) => camelCase(key));
    response = getValues(res.data) as any;
    response.suggestions = response.suggestions.map(getValues) as any;
    resultSchema.parse(response);
  } catch (error: any) {
    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }

  const hasValues = (val: any) => suggestionSchema.safeParse(val).success;
  const suggestions = await Promise.all(
    response.suggestions.filter(hasValues).map(transformToTaxon)
  );

  // const suggestions = [
  //   {
  //     probability: 0.999981,
  //     warehouseId: 170202,
  //     scientificName: 'Daucus carota',
  //     group: 89,
  //     commonNames: ['Wild Carrot', 'Carrot'],
  //     foundInName: 0,
  //   },
  //   {
  //     probability: 0.299981,
  //     warehouseId: 215642,
  //     scientificName: 'Berkheya pinnatifida',
  //     group: 89,
  //     commonNames: ['Lobed African Thistle'],
  //     foundInName: 0,
  //   },
  // ];

  return {
    classifierId: response.classifierId,
    classifierVersion: response.classifierVersion,
    suggestions,
  };
}
