import userModel from 'models/user';
import axios, { AxiosResponse } from 'axios';
import speciesSearch from 'Survey/common/Components/TaxonSearch/utils';
import config from 'common/config';
import { Taxon } from 'models/occurrence';

const UKSIListID = '15';

type AISuggestion = {
  probability: number;
  taxon: string;
  taxa_taxon_list_id: string;
  taxon_group_id: string;
};

type AIResult = {
  classifier_id: string;
  classifier_version: string;
  suggestions: AISuggestion[];
};

export type Suggestion = Omit<
  Taxon,
  'classifier_id' | 'classifier_version' | 'suggestions'
> & { probability: number };

export type Result = Omit<AIResult, 'suggestions'> & {
  suggestions: Suggestion[];
};

async function getCommonNames(sp: AISuggestion) {
  const taxa: Taxon[] = await speciesSearch(sp.taxon, {
    namesFilter: 'scientific',
    maxResults: 1,
  });

  const commonNames = taxa?.[0]?.common_names;
  if (!commonNames?.length) return { common_names: [] };

  return { common_names: commonNames, found_in_name: 0 };
}

export default async function identify(url: string): Promise<Result> {
  const data = new URLSearchParams({ image: url, list: UKSIListID });

  const options: any = {
    method: 'post',
    url: `${config.backend.url}/api-proxy/indicia?_api_proxy_uri=/`,
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
    timeout: 80000,
  };

  const response: AxiosResponse<AIResult> = await axios(options);

  const withValidData = (sp: Partial<AISuggestion>) =>
    sp.taxa_taxon_list_id && sp.taxon && sp.taxon_group_id && sp.probability;

  const transformToTaxon = async (sp: AISuggestion): Promise<Suggestion> => ({
    probability: sp.probability,
    warehouse_id: parseInt(sp.taxa_taxon_list_id, 10),
    scientific_name: sp.taxon,
    group: parseInt(sp.taxon_group_id, 10),

    ...(await getCommonNames(sp)),
  });

  const suggestions = await Promise.all(
    (response.data.suggestions.filter(withValidData) as AISuggestion[]).map(
      transformToTaxon
    )
  );

  return {
    classifier_id: response.data.classifier_id,
    classifier_version: response.data.classifier_version,
    suggestions,
  };
}
