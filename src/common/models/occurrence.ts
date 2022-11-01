import {
  Occurrence as OccurrenceOriginal,
  OccurrenceAttrs,
  validateRemoteModel,
} from '@flumens';
import { IObservableArray } from 'mobx';
import { Survey } from 'Survey/common/config';
import Media from './media';
import Sample from './sample';

export type Taxon = any;

type Attrs = OccurrenceAttrs & {
  taxon?: Taxon;
  'number-ranges'?: string;
  number?: any;
  abundance?: any;
  comment?: string;
  stage?: string;
  sex?: any;
};

export default class Occurrence extends OccurrenceOriginal<Attrs> {
  static fromJSON(json: any) {
    return super.fromJSON(json, Media);
  }

  declare media: IObservableArray<Media>;

  declare parent?: Sample;

  declare getSurvey: () => Survey;

  validateRemote = validateRemoteModel;

  getPrettyName() {
    const specie = this.attrs.taxon || {};
    const scientificName = specie.scientific_name;
    const commonName =
      specie.found_in_name >= 0 && specie.common_names[specie.found_in_name];

    return commonName || scientificName;
  }
}
