/* eslint-disable max-classes-per-file */

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
  Location,
} from '@flumens';
import config from 'common/config';
import gridAlertService from 'common/helpers/gridAlertService';
import appModel from 'models/app';
import userModel from 'models/user';
import defaultSurvey, {
  taxonGroupSurveys,
  getTaxaGroupSurvey,
} from 'Survey/Default/config';
import { coreAttributes, Survey } from 'Survey/common/config';
import { getSurveyConfigs } from 'Survey/common/surveyConfigs';
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
];

type Data = SampleData & {
  surveyId: any;
  location?: any;
  groupId?: string;
  recorder?: any;
  recorders?: any;
  childGeolocation?: any;
};

type Metadata = SampleMetadata & {
  /**
   * Taxa group name e.g. 'birds'.
   */
  taxa: keyof typeof taxonGroupSurveys;
  gridSquareUnit?: 'monad' | 'tetrad';
  saved?: boolean;
};

export default class Sample extends SampleOriginal<Data, Metadata> {
  declare occurrences: IObservableArray<Occurrence>;

  declare samples: IObservableArray<Sample>;

  declare media: IObservableArray<Media>;

  declare parent?: Sample;

  startGPS: any; // from extension

  isGPSRunning: any; // from extension

  stopGPS: any; // from extension

  constructor(options: SampleOptions<Data>) {
    super({ ...options, Sample, Occurrence, Media, store: samplesStore });

    this.remote.url = config.backend.indicia.url;
    this.remote.getAccessToken = () => userModel.getAccessToken();

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
    if (this.remote.synchronising || this.isUploaded) return true;

    const invalids = this.validateRemote();
    if (invalids) return false;

    if (!device.isOnline) return false;

    const isActivated = await userModel.checkActivation();
    if (!isActivated) return false;

    this.cleanUp();

    return this.saveRemote();
  }

  async save() {
    super.save();
  }

  getSurvey(skipGet?: boolean): Survey {
    let survey = getSurveyConfigs()[this.data.surveyId];

    // backwards compatible, remove once everyone uploads their surveys
    if (!survey && (this.metadata as any).survey) {
      if ((this.metadata as any).survey === 'default') this.data.surveyId = 374;
      if ((this.metadata as any).survey === 'list') this.data.surveyId = 576;
      if ((this.metadata as any).survey === 'moth') this.data.surveyId = 90;
      if ((this.metadata as any).survey === 'plant') this.data.surveyId = 325;
      survey = getSurveyConfigs()[this.data.surveyId];
    } else if (!survey && (this.metadata as any).survey_id) {
      survey = getSurveyConfigs()[(this.metadata as any).survey_id];
    }

    if (survey?.get && !skipGet) return survey.get(this);

    const isSubSample = this.parent;
    if (isSubSample) return (survey.smp || {}) as Survey;

    return survey as Survey;
  }

  setTaxon(newTaxon: Taxon, occurrenceId?: string) {
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

    if (this.getSurvey().name === 'default') {
      if (occ.data.taxon) this.removeOldTaxonAttributes(occ, newTaxon);

      const survey = getTaxaGroupSurvey(newTaxon.group);
      this.metadata.taxa = survey?.taxa as any;
    }

    occ.data.taxon = JSON.parse(JSON.stringify(newTaxon));

    occ.updateMachineInvolvement(newTaxon);
  }

  removeOldTaxonAttributes(occ: Occurrence, newTaxon: any) {
    const survey = this.getSurvey();
    const newSurvey = getTaxaGroupSurvey(newTaxon.group) || defaultSurvey;

    if (survey.taxa === newSurvey.taxa) return;

    process.env.NODE_ENV !== 'test' &&
      console.log(`Removing old ${survey.taxa} taxa attributes`);

    // remove non-core attributes for survey switch
    const removeSmpNonCoreAttr = (key: any) => {
      if (!ATTRS_TO_LEAVE.includes(`smp:${key}`)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete this.data[key];
      }
    };

    Object.keys(this.data).forEach(removeSmpNonCoreAttr);

    const removeOccNonCoreAttr = (key: any) => {
      if (!ATTRS_TO_LEAVE.includes(`occ:${key}`)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        delete occ.data[key];
      }
    };
    Object.keys(occ.data).forEach(removeOccNonCoreAttr);
  }

  /**
   * Print pretty location.
   * @returns {string}
   */
  printLocation() {
    const location = this.data.location || {};
    return appModel.printLocation(location);
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
