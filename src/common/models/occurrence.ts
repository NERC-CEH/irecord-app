import {
  Occurrence as OccurrenceOriginal,
  OccurrenceAttrs,
  OccurrenceMetadata,
  validateRemoteModel,
} from '@flumens';
import { IObservableArray } from 'mobx';
import { Survey } from 'Survey/common/config';
import Media, { ClassifierResult, ClassifierSuggestion } from './media';
import Sample from './sample';

export enum MachineInvolvement {
  /**
   * No involvement.
   */
  NONE = 0,
  /**
   * Human determined, machine suggestions were ignored.
   */
  HUMAN = 1,
  /**
   * Human chose a machine suggestion given a very low probability.
   */
  HUMAN_ACCEPTED_LESS_PREFERRED_LOW = 2,
  /**
   * Human chose a machine suggestion that was less-preferred.
   */
  HUMAN_ACCEPTED_LESS_PREFERRED = 3,
  /**
   * Human chose a machine suggestion that was the preferred choice.
   */
  HUMAN_ACCEPTED_PREFERRED = 4,
  /**
   * Machine determined with no human involvement.
   */
  MACHINE = 5,
}

export type Taxon = {
  warehouse_id: number;
  group: number;
  scientific_name: string;
  common_names: string[];
  array_id?: number;
  species_id?: number;
  found_in_name?: number; // which common_names array index to use if any

  probability?: number;
  machineInvolvement?: MachineInvolvement;
} & Partial<ClassifierResult>;

type Attrs = Omit<OccurrenceAttrs, 'taxon'> & {
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
    const { taxon } = this.attrs;
    if (!taxon) return '';

    if (Number.isFinite(taxon.found_in_name))
      return taxon.common_names[taxon.found_in_name as number];

    return taxon.scientific_name;
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

  isIdentifying = () => this.media.some(m => m.isIdentifying());

  getSuggestions() {
    const getSuggestions = (m: Media) => m.getSuggestions();

    const byProbability = (
      suggestion1: ClassifierSuggestion,
      suggestion2: ClassifierSuggestion
    ) => suggestion2.probability - suggestion1.probability;

    const uniqueSpecies = new Set();
    const removeDuplicates = (sp: Taxon) => {
      const isDuplicate = uniqueSpecies.has(sp?.scientific_name);

      uniqueSpecies.add(sp?.scientific_name);

      return !isDuplicate;
    };

    return this.media
      .flatMap(getSuggestions)
      .sort(byProbability)
      .filter(removeDuplicates);
  }

  setTaxon(newTaxon: Taxon) {
    this.parent?.setTaxon(newTaxon, this.cid);
  }
}
