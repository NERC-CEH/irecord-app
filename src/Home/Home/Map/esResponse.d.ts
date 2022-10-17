/* eslint camelcase: 0 */

interface Website {
  title: string;
  id: string;
}

interface Survey {
  title: string;
  id: string;
}

interface Metadata {
  website: Website;
  trial: string;
  sensitive: string;
  survey: Survey;
  tracking: string;
  confidential: string;
  input_form: string;
  created_by_id: string;
  created_on: string;
  updated_on: string;
  release_status: string;
}

interface HigherGeography {
  type: string;
  id: string;
  code: string;
  name: string;
}

interface GridSquare {
  '10km': {
    centre: string;
  };
  srid: string;
  '1km': {
    centre: string;
  };
  '2km': {
    centre: string;
  };
}

interface Location {
  point: string;
  higher_geography: HigherGeography[];
  output_sref: string;
  output_sref_system: string;
  geom: string;
  verbatim_locality: string;
  coordinate_uncertainty_in_meters: string;
  grid_square: GridSquare;
}

interface TaxonList {
  id: string;
  title: string;
}

interface Taxon {
  species: string;
  accepted_name: string;
  terrestrial: string;
  taxon_rank: string;
  order: string;
  taxa_taxon_list_id: string;
  accepted_taxon_id: string;
  phylum: string;
  marine: string;
  kingdom: string;
  vernacular_name: string;
  higher_taxon_ids: string[];
  taxon_id: string;
  taxon_name: string;
  species_taxon_id: string;
  taxon_meaning_id: string;
  taxon_name_authorship: string;
  family: string;
  accepted_name_authorship: string;
  freshwater: string;
  group: string;
  genus: string;
  class: string;
  taxon_rank_sort_order: string;
  non_native: string;
  group_id: string;
  taxon_list: TaxonList;
  input_group: string;
  input_group_id: string;
  species_authorship: string;
  species_vernacular: string;
}

interface Attribute {
  value: string;
  id: string;
}

interface Event {
  date_start: string;
  attributes: Attribute[];
  recorded_by: string;
  date_end: string;
  ukbms_week: string;
  day_of_year: string;
  year: string;
  date_type: string;
  week: string;
  event_id: string;
  month: string;
}

interface AutoChecks {
  output: any[];
  enabled: string;
  result: string;
}

interface Identification {
  auto_checks: AutoChecks;
  verification_status: 'C' | 'V' | 'R';
  verification_substatus: string;
}

export interface Media {
  type: string;
  path: string;
}

interface Occurrence {
  zero_abundance: string;
  source_system_key: string;
  life_stage: string;
  attributes: Attribute[];
  media?: Media[];
  individual_count: string;
  organism_quantity: string;
}

export interface Hit {
  metadata: Metadata;
  id: string;
  '@timestamp': Date;
  tracking: string;
  location: Location;
  taxon: Taxon;
  event: Event;
  warehouse: string;
  '@version': string;
  identification: Identification;
  occurrence: Occurrence;
}

export interface Bucket {
  key: string;
  doc_count: number;
}

export interface Square extends Bucket {
  size: number; // in meters
}

export interface Record extends Hit {}
