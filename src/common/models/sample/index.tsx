/* eslint-disable no-param-reassign */
import { IObservableArray } from 'mobx';
import { useTranslation } from 'react-i18next';
import {
  Sample as SampleOriginal,
  SampleData,
  SampleOptions,
  SampleMetadata,
  ModelValidationMessage,
  device,
  useAlert,
  locationToGrid,
  type Location,
} from '@flumens';
import config from 'common/config';
import gridAlertService from 'common/helpers/gridAlertService';
import { getGridRefSystem, printLocation } from 'common/helpers/location';
import appModel from 'models/app';
import userModel from 'models/user';
import { coreAttributes, Survey } from 'Survey/common/config';
import getSurveyConfigs from 'Survey/common/surveyConfigs';
import Media from '../media';
import Occurrence, { Taxon } from '../occurrence';
import { samplesStore } from '../store';
import GPSExtension from './sampleGPSExt';

const ATTRS_TO_LEAVE = [
  ...coreAttributes,

  // TODO: make this better so that below are not hardcoded
  'smp:surveyId',
  'smp:deleted',
  'occ:deleted',
  'smp:training',
  'occ:training',
  'occ:classifier',
  'occ:machineInvolvement',
  'occ:taxon',
];

export type Data = SampleData & {
  location?: Partial<Location>;
  recorder?: string;
  childGeolocation?: boolean;
};

type GeocodedLocation = { center: [number, number] };

export type Metadata = SampleMetadata & {
  geocoded?: GeocodedLocation;
  gridSquareUnit?: 'monad' | 'tetrad';
  /**
   * If overwrite which survey to use.
   */
  forceSurveyId?: number;
  saved?: boolean;
};

export default class Sample<T extends Data = Data> extends SampleOriginal<
  T,
  Metadata
> {
  declare occurrences: IObservableArray<Occurrence>;

  declare samples: IObservableArray<Sample<T>>;

  declare media: IObservableArray<Media>;

  declare parent?: Sample<T>;

  declare startGPS: (accuracyLimit?: number) => Promise<void>;

  declare isGPSRunning: () => boolean;

  declare stopGPS: () => void;

  declare gps: { locating: string | null };

  constructor(options: SampleOptions<Data, Metadata>) {
    super({
      ...options,
      Occurrence,
      Media,
      store: samplesStore,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
    } as SampleOptions<T, Metadata>);

    this.data.training = appModel.data.useTraining;

    Object.assign(this, GPSExtension());
  }

  cleanUp() {
    this.stopGPS();

    gridAlertService.stop(this.cid);

    const stopGPS = (smp: Sample) => {
      smp.stopGPS();
    };
    this.samples.forEach(stopGPS);
  }

  async upload() {
    if (this.isSynchronising || this.isUploaded) return true;

    const invalids = this.validateRemote();
    if (invalids) return false;

    if (!device.isOnline) return false;

    const isActivated = await userModel.checkActivation();
    if (!isActivated) return false;

    this.cleanUp();

    return this.saveRemote();
  }

  getSurvey(): Survey {
    let surveyId = this.metadata.forceSurveyId || this.data.surveyId;

    // backwards compatible, remove once everyone uploads their surveys
    const legacyMetadata = this.metadata as Metadata & {
      survey?: 'default' | 'list' | 'moth' | 'plant';
      survey_id?: number;
    };
    if (legacyMetadata.survey) {
      if (legacyMetadata.survey === 'default') surveyId = 374;
      if (legacyMetadata.survey === 'list') surveyId = 576;
      if (legacyMetadata.survey === 'moth') surveyId = 90;
      if (legacyMetadata.survey === 'plant') surveyId = 325;
    } else if (legacyMetadata.survey_id) {
      surveyId = legacyMetadata.survey_id;
      this.data.surveyId = surveyId;
    }

    // backwards compatible, remove once everyone uploads their surveys
    if (!this.data.surveyId && !this.parent) {
      this.data.surveyId = surveyId;
    }

    const survey = getSurveyConfigs()[surveyId!];

    if (survey?.get) return survey.get(this);

    const isSubSample = this.parent;
    if (isSubSample) return (survey.smp || {}) as Survey;

    if (!survey) {
      console.log(JSON.stringify(this.metadata));
      console.log(JSON.stringify(this.data));
      console.error('Survey config was missing');
      return {} as Survey;
    }

    return survey;
  }

  setTaxon(
    newTaxon: Taxon,
    occurrenceId?: string,
    skipOldTaxonRemoval?: boolean
  ) {
    if (this.samples.length)
      throw new Error('setTaxon must be used with subSamples only');

    if (this.occurrences.length > 1 && !occurrenceId)
      throw new Error(
        'setTaxon cannot be used with samples with multiple occurrences without specifying the occurrence'
      );

    const byId = (o: Occurrence) => o.cid === occurrenceId;
    const occ: Occurrence = occurrenceId
      ? this.occurrences.find(byId)!
      : this.occurrences[0];

    const oldSurvey = this.getSurvey();
    const hadTaxon = !!occ.data.taxon;

    occ.data.taxon = structuredClone(newTaxon);

    const newSurvey = this.getSurvey();
    if (hadTaxon && !skipOldTaxonRemoval && oldSurvey.taxa !== newSurvey.taxa) {
      this.removeOldTaxonAttributes(occ, oldSurvey);

      const surveyName = this.parent?.getSurvey().name || newSurvey.name;
      const locks = appModel.locks.getAll(surveyName, newSurvey.taxa);
      Object.assign(this.data, locks.smp);
      Object.assign(occ.data, locks.occ);
    }

    occ.updateMachineInvolvement(newTaxon);
  }

  private removeOldTaxonAttributes(occ: Occurrence, oldSurvey: Survey) {
    process.env.NODE_ENV !== 'test' &&
      console.log(`Removing old ${oldSurvey.taxa} taxa attributes`);

    // remove non-core attributes for survey switch
    const removeSmpNonCoreAttr = (key: string) => {
      if (!ATTRS_TO_LEAVE.includes(`smp:${key}`)) delete this.data[key];
    };

    Object.keys(this.data).forEach(removeSmpNonCoreAttr);

    const removeOccNonCoreAttr = (key: string) => {
      if (!ATTRS_TO_LEAVE.includes(`occ:${key}`)) delete occ.data[key];
    };
    Object.keys(occ.data).forEach(removeOccNonCoreAttr);
  }

  /**
   * Print pretty location.
   * @returns {string}
   */
  printLocation() {
    const location = this.data.location || {};
    return printLocation(location);
  }

  setGPSLocation = (location: Location) => {
    const isPlantSurvey = this.getSurvey().name === 'plant';
    const isChild = this.parent;

    if (isPlantSurvey && !isChild) {
      const { gridSquareUnit } = this.metadata;

      const accuracy = gridSquareUnit === 'monad' ? 500 : 1000; // tetrad otherwise
      const gridref = locationToGrid({ ...location, accuracy });
      if (!gridref) return null;

      location.source = 'gridref';
      location.gridref = gridref;
      location.accuracy = accuracy;
    }

    const usesGridRefSystem =
      this.data.enteredSrefSystem === 'OSGB' ||
      this.data.enteredSrefSystem === 'OSIE';

    if (usesGridRefSystem) {
      this.data.enteredSrefSystem = getGridRefSystem(location.gridref);
    }

    if (!this.data.location) this.data.location = {};
    Object.assign(this.data.location, location);
    return this.save();
  };

  hasOccurrencesBeenVerified() {
    const hasBeenVerified = (occ: Occurrence) => {
      const isRecordInReview =
        occ.metadata?.verification?.verification_status === 'C' &&
        occ.metadata?.verification?.verification_substatus !== '3';

      return occ.metadata?.verification && !isRecordInReview;
    };

    const hasSubSample = this.samples.length;
    if (hasSubSample) {
      let status;

      const getSamples = (subSample: Sample) => {
        status =
          this.isUploaded && !!subSample.occurrences.some(hasBeenVerified);
        return status;
      };

      this.samples.some(getSamples);
      return this.isUploaded && !!status;
    }

    return this.isUploaded && !!this.occurrences.some(hasBeenVerified);
  }

  async destroy(silent?: boolean) {
    this.cleanUp();
    return super.destroy(silent);
  }
}

export const useValidateCheck = (sample?: Sample) => {
  const alert = useAlert();
  const { t } = useTranslation();

  const showValidateCheck = () => {
    const invalids = sample?.validateRemote();
    if (invalids) {
      console.log('Invalid sample', invalids);
      alert({
        header: t('Survey incomplete'),
        skipTranslation: true,
        message: <ModelValidationMessage {...invalids} />,
        buttons: [
          {
            text: t('Got it'),
            role: 'cancel',
          },
        ],
      });
      return false;
    }
    return true;
  };

  return showValidateCheck;
};

export const getEmptyLocation = (): Partial<Location> => ({
  latitude: undefined,
  longitude: undefined,
  gridref: '',
  accuracy: undefined,
  altitude: undefined,
  altitudeAccuracy: undefined,
  source: '',
});
