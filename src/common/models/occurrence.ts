import {
  Occurrence as OccurrenceOriginal,
  OccurrenceAttrs,
  OccurrenceMetadata,
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

type Metadata = OccurrenceMetadata & {
  verification?: {
    verification_status: any;
    verification_substatus: any;
    verified_on: any;
    verifier?: { name: string };
  };
};

export default class Occurrence extends OccurrenceOriginal<Attrs, Metadata> {
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

  getVerificationStatus() {
    const status = this.metadata?.verification?.verification_status;

    if (!status) return ''; // pending

    const substatus = this.metadata?.verification?.verification_substatus;

    if (status.match(/V/i)) return 'verified';
    if (status.match(/C/i) && substatus === '3') return 'plausible';
    if (status.match(/R/i)) return 'rejected';

    return ''; // pending
  }

  hasOccurrenceBeenVerified() {
    const isRecordInReview =
      this.metadata?.verification?.verification_status === 'C' &&
      this.metadata?.verification?.verification_substatus !== '3';

    return (
      this.isUploaded() && this.metadata?.verification && !isRecordInReview
    );
  }

  getVerificationStatusMessage() {
    const codes: { [keyof: string]: string } = {
      V: 'Accepted',
      V1: 'Accepted as correct',
      V2: 'Accepted as considered correct',

      C: 'Pending review',
      C3: 'Plausible',

      R: 'Not accepted',
      R4: 'Not accepted as unable to verify',
      R5: 'Not accepted as correct',

      // not supported
      D: 'Dubious',
      T: 'Test',
      I: 'Incomplete',
    };

    const statusWithSubstatus = `${this.metadata?.verification?.verification_status}${this.metadata?.verification?.verification_substatus}`;

    return codes[statusWithSubstatus];
  }
}
