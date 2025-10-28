import { IObservableArray, observable } from 'mobx';
import {
  Occurrence as OccurrenceOriginal,
  OccurrenceData,
  OccurrenceMetadata,
  validateRemoteModel,
  ElasticOccurrence,
} from '@flumens';
import speciesWarehouseIdMap from 'common/data/species_ids.data.json';
import identify, { Suggestion, Result } from 'common/services/indiciaAI';
import { Taxon as SearchTaxon } from 'helpers/taxonSearch';
import { Survey } from 'Survey/common/config';
import Media from './media';
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

type Classifier = Partial<Result>;

export type Taxon = SearchTaxon;

export type ClassifierSuggestion = Suggestion;
const byWarehouseId =
  (warehouseId: number) => (suggestion: ClassifierSuggestion) =>
    suggestion.warehouseId === warehouseId;

type Attrs = Omit<OccurrenceData, 'taxon'> & {
  taxon?: Taxon;
  classifier?: Classifier;
  machineInvolvement?: MachineInvolvement;
  'number-ranges'?: string;
  number?: any;
  abundance?: any;
  comment?: string;
  stage?: string;
  sex?: any;
};

type Metadata = OccurrenceMetadata & {
  /**
   * If the occurrence hasn't got any new or changed media that requires re-classification.
   */
  isClassified?: boolean;

  verification?: {
    verification_status: any;
    verification_substatus: any;
    query?: string;
    verified_on: any;
    verifier?: { name: string };
  };
};

export default class Occurrence extends OccurrenceOriginal<Attrs, Metadata> {
  static fromElasticDTO(json: ElasticOccurrence, options: any, survey?: any) {
    // // fix missing common names
    const commonNames = (speciesWarehouseIdMap as any)[
      json.taxon.taxa_taxon_list_id
    ];

    if (commonNames) {
      // eslint-disable-next-line no-param-reassign
      json.taxon.taxon_name = commonNames?.[0] || '';
    }

    const parsed = super.fromElasticDTO(json, options, survey) as any;

    return parsed;
  }

  declare media: IObservableArray<Media>;

  declare parent?: Sample;

  declare getSurvey: () => Survey;

  validateRemote = validateRemoteModel;

  identification = observable({ identifying: false });

  constructor(options: any) {
    super({ ...options, Media });
  }

  getPrettyName() {
    const { taxon } = this.data;
    if (!taxon) return '';

    // when the common name is pulled from warehouse - we should drop the array format at some point
    if ((taxon as any).commonName) return (taxon as any).commonName;

    if (Number.isFinite(taxon.foundInName))
      return taxon.commonNames[taxon.foundInName as number];

    return (
      taxon?.scientificName ||
      // backwards compatible
      (taxon as any)?.scientific_name
    );
  }

  getVerificationStatus():
    | 'verified'
    | 'plausible'
    | 'rejected'
    | 'queried'
    | '' {
    const status = this.metadata?.verification?.verification_status;

    if (!status) return ''; // pending

    const substatus = this.metadata?.verification?.verification_substatus;

    if (this.metadata?.verification?.query === 'Q') return 'queried';

    if (status.match(/V/i)) return 'verified';
    if (status.match(/C/i) && substatus === '3') return 'plausible';
    if (status.match(/R/i)) return 'rejected';

    return ''; // pending
  }

  hasOccurrenceBeenVerified() {
    const isRecordInReview =
      this.metadata?.verification?.verification_status === 'C' &&
      this.metadata?.verification?.verification_substatus !== '3';

    return this.isUploaded && this.metadata?.verification && !isRecordInReview;
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

  get isIdentifying() {
    return this.identification.identifying;
  }

  async identify(classifier?: 'plant') {
    const isPlant =
      this.parent?.parent?.getSurvey().name === 'plant' ||
      classifier === 'plant';
    if (isPlant) return this.identifyPlant();

    return this.identifyOther();
  }

  private async identifyOther() {
    try {
      this.identification.identifying = true;

      const classifierResults = await identify(this.media);

      this.metadata.isClassified = true;
      this.data.classifier = classifierResults;

      this.identification.identifying = false;
    } catch (error) {
      this.identification.identifying = false;
      throw error;
    }

    this.save();
  }

  private async identifyPlant() {
    try {
      this.identification.identifying = true;

      const classifierResults = await identify(this.media, 'plantnet');

      this.metadata.isClassified = true;
      this.data.classifier = classifierResults;

      this.identification.identifying = false;
    } catch (error) {
      this.identification.identifying = false;
      throw error;
    }

    this.save();
  }

  getSelectedTaxonProbability() {
    if (!this.data.taxon || !this.data.classifier?.suggestions) return null;

    const suggestion = this.data.classifier.suggestions.find(
      byWarehouseId(this.data.taxon.warehouseId)
    );

    return suggestion?.probability || 0;
  }

  getTopSuggestionProbability() {
    return this.data.classifier?.suggestions?.[0]?.probability || null;
  }

  setTaxon(newTaxon: Taxon) {
    // has to go to sample because taxa-specific attributes can also be at the sample-level
    this.parent?.setTaxon(newTaxon, this.cid);
  }

  updateMachineInvolvement(newTaxon?: Taxon) {
    const suggestions = this.data.classifier?.suggestions;
    if (!newTaxon || !suggestions) {
      delete this.data.classifier;
      this.data.machineInvolvement = MachineInvolvement.NONE;
      return;
    }

    const suggestionIndex = suggestions.findIndex(
      byWarehouseId(newTaxon.warehouseId)
    );
    const userDidNotUseSuggestions = suggestionIndex < 0;
    if (userDidNotUseSuggestions) {
      this.data.machineInvolvement = MachineInvolvement.HUMAN;
      return;
    }

    const isTopSuggestion = suggestionIndex === 0;
    this.data.machineInvolvement = isTopSuggestion
      ? MachineInvolvement.HUMAN_ACCEPTED_PREFERRED
      : MachineInvolvement.HUMAN_ACCEPTED_LESS_PREFERRED;
  }

  getClassifierSubmission() {
    const { taxon, classifier, machineInvolvement } = this.data;

    const getMediaPath = (media: Media) => media.data.queued;
    const mediaPaths = this.media.map(getMediaPath);

    const getSuggestion = (
      { probability, scientificName, warehouseId }: Suggestion,
      index: number
    ) => {
      const topSpecies = index === 0;
      const classifierChosen = topSpecies ? 't' : 'f';
      const humanChosen = warehouseId === taxon?.warehouseId ? 't' : 'f';

      return {
        values: {
          taxon_name_given: scientificName,
          probability_given: probability,
          taxa_taxon_list_id: warehouseId,
          classifier_chosen: classifierChosen,
          human_chosen: humanChosen,
        },
      };
    };

    const classifierSuggestions =
      classifier?.suggestions?.map(getSuggestion) || [];

    const hasSuggestions = classifierSuggestions.length;
    const taxonChosenWithoutAI = machineInvolvement === MachineInvolvement.NONE;
    if (!hasSuggestions || !mediaPaths.length || taxonChosenWithoutAI)
      return {};

    const { classifierId, classifierVersion } = classifier || {};
    if (!classifierId || !classifierVersion) return {}; // backwards compatible

    return {
      classification_event: {
        values: { created_by_id: null },
        classification_results: [
          {
            values: {
              classifier_id: classifierId,
              classifier_version: classifierVersion,
            },
            classification_suggestions: classifierSuggestions,
            metaFields: { mediaPaths },
          },
        ],
      },
    };
  }
}
