/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */
import {
  Sample as SampleOriginal,
  SampleAttrs,
  SampleOptions,
  SampleMetadata,
  getDeepErrorMessage,
  device,
  useAlert,
  locationToGrid,
} from '@flumens';
import userModel from 'models/user';
import appModel from 'models/app';
import config from 'common/config';
import defaultSurvey, {
  taxonGroupSurveys,
  getTaxaGroupSurvey,
} from 'Survey/Default/config';
import listSurvey from 'Survey/List/config';
import plantSurvey from 'Survey/Plant/config';
import mothSurvey from 'Survey/Moth/config';
import { IObservableArray } from 'mobx';
import { coreAttributes, Survey } from 'Survey/common/config';
import { useTranslation } from 'react-i18next';
import GPSExtension from './sampleGPSExt';
import { modelStore } from './store';
import Occurrence, { Taxon } from './occurrence';
import Media from './media';

const ATTRS_TO_LEAVE = [
  ...coreAttributes,

  // TODO: make this better so that below are not hardcoded
  'smp:surveyId',
  'smp:deleted',
  'occ:deleted',
  'smp:training',
  'occ:training',
];

const surveyConfigs = {
  default: defaultSurvey,
  list: listSurvey,
  plant: plantSurvey,
  moth: mothSurvey,
};

type Location = {
  latitude?: string;
  longitude?: string;
  source?: string;
  accuracy?: number;
  gridref?: string;
};

type Attrs = SampleAttrs & {
  location?: any;
  activity?: any;
};

type Metadata = SampleMetadata & {
  /**
   * Survey name.
   */
  survey: keyof typeof surveyConfigs;
  /**
   * Taxa group name e.g. 'birds'.
   */
  taxa: keyof typeof taxonGroupSurveys;
  /**
   * @deprecated
   */
  complex_survey?: string;
  gridSquareUnit?: 'monad' | 'tetrad';
  saved?: boolean;
};

export default class Sample extends SampleOriginal<Attrs, Metadata> {
  static fromJSON(json: any) {
    return super.fromJSON(json, Occurrence, Sample, Media);
  }

  declare occurrences: IObservableArray<Occurrence>;

  declare samples: IObservableArray<Sample>;

  declare media: IObservableArray<Media>;

  declare parent?: Sample;

  declare survey: Survey;

  startGPS: any; // from extension

  isGPSRunning: any; // from extension

  stopGPS: any; // from extension

  constructor({
    isSubSample,
    ...options
  }: SampleOptions & { isSubSample?: boolean }) {
    // only top samples should have the store, otherwise sync() will save sub-samples on attr change.
    const store = isSubSample ? undefined : modelStore; // eventually remove this once using a SubSample class.

    super({ ...options, store });

    this.remote.url = `${config.backend.indicia.url}/index.php/services/rest`;
    // eslint-disable-next-line
    this.remote.headers = async () => ({
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    });

    this.attrs.training = appModel.attrs.useTraining;

    this.survey = surveyConfigs[this.metadata.survey];

    Object.assign(this, GPSExtension());
  }

  cleanUp() {
    this.stopGPS();

    const stopGPS = (smp: Sample) => {
      smp.stopGPS();
    };
    this.samples.forEach(stopGPS);
  }

  async upload() {
    if (this.remote.synchronising || this.isUploaded()) return true;

    const invalids = this.validateRemote();
    if (invalids) return false;

    if (!device.isOnline) return false;

    const isActivated = await userModel.checkActivation();
    if (!isActivated) return false;

    this.cleanUp();

    return this.saveRemote();
  }

  checkExpiredActivity() {
    const { activity } = this.attrs;
    if (activity) {
      const expired = userModel.hasActivityExpired(activity);
      if (expired) {
        const newActivity = userModel.getActivity(activity.id);
        if (!newActivity) {
          // the old activity is expired and removed
          console.log('Sample:Activity: removing exipired activity.');
          this.attrs.activity = null;
          this.save();
        } else {
          // old activity has been updated
          console.log('Sample:Activity: updating exipired activity.');
          this.attrs.activity = newActivity;
          this.save();
        }
      }
    }
  }

  private surveyMigrated = false;

  getSurvey(): Survey {
    if (!this.survey) {
      this._migrateLegacySurvey();
      this._migrateTaxaGroups();
      this.surveyMigrated = true;

      return this.getSurvey();
    }

    const existingV6Users =
      parseInt(config?.version?.split('.')?.join(''), 10) < 602; // TODO: remove once the v6.0.2  is live
    if (existingV6Users && !this.surveyMigrated) {
      this._migrateTaxaGroups();
      this.surveyMigrated = true;
      return this.getSurvey();
    }

    if (this.survey.get) return this.survey.get(this);

    const isSubSample = this.parent;
    if (isSubSample) return (this.survey.smp || {}) as Survey;

    return this.survey as Survey;
  }

  setTaxon(newTaxon: Taxon) {
    if (this.samples.length)
      throw new Error('setTaxon must be used with subSamples only');

    const [occ] = this.occurrences;

    if (this.survey.name === 'default') {
      if (occ.attrs.taxon) this.removeOldTaxonAttributes(occ, newTaxon);

      const survey = getTaxaGroupSurvey(newTaxon.group);
      this.metadata.taxa = survey?.taxa as any;
    }

    occ.attrs.taxon = newTaxon;
  }

  removeOldTaxonAttributes(occ: Occurrence, newTaxon: any) {
    const survey = this.getSurvey();
    const newSurvey = getTaxaGroupSurvey(newTaxon.group) || defaultSurvey;

    if (survey.taxa === newSurvey.taxa) return;

    console.log(`Removing old ${survey.taxa} taxa attributes`);

    // remove non-core attributes for survey switch
    const removeSmpNonCoreAttr = (key: any) => {
      if (!ATTRS_TO_LEAVE.includes(`smp:${key}`)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete this.attrs[key];
      }
    };

    Object.keys(this.attrs).forEach(removeSmpNonCoreAttr);

    const removeOccNonCoreAttr = (key: any) => {
      if (!ATTRS_TO_LEAVE.includes(`occ:${key}`)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        delete occ.attrs[key];
      }
    };
    Object.keys(occ.attrs).forEach(removeOccNonCoreAttr);
  }

  private _migrateTaxaGroups() {
    if (this.metadata.survey !== 'default' && this.metadata.survey !== 'list')
      return;

    const migrateTaxaGroup = (smp: Sample) => {
      if (!smp.metadata.taxa) {
        const speciesSurvey = getTaxaGroupSurvey(
          smp.occurrences[0]?.attrs.taxon?.group as number
        );

        if (
          speciesSurvey?.taxa &&
          !['moths', 'arthropods'].includes(speciesSurvey.taxa)
        ) {
          console.log(
            `Found missing species group. Setting ${smp.cid} to ${speciesSurvey.taxa}.`
          );
          smp.metadata.taxa = speciesSurvey.taxa as any;
        }
      }
    };

    if (this.samples.length) {
      this.samples.forEach(migrateTaxaGroup);
    } else {
      migrateTaxaGroup(this);
    }
  }

  private _migrateLegacySurvey() {
    if (
      this.metadata.complex_survey === 'plant' ||
      this.metadata.gridSquareUnit
    ) {
      console.log(`Found legacy survey. Setting ${this.cid} to plant.`);
      this.metadata.survey = 'plant';
      this.survey = plantSurvey;
      this.save();
      return;
    }

    if (this.metadata.complex_survey === 'moth') {
      console.log(`Found legacy survey. Setting ${this.cid} to moth.`);
      this.metadata.survey = 'moth';
      this.survey = mothSurvey;
      this.save();
      return;
    }

    if (this.metadata.complex_survey === 'default') {
      console.log(`Found legacy survey. Setting ${this.cid} to list.`);
      this.metadata.survey = 'list';
      this.survey = listSurvey;

      this.save();
      return;
    }

    console.log(`Found legacy survey. Setting ${this.cid} to default.`);
    this.metadata.survey = 'default';
    this.survey = defaultSurvey;

    this.save();
  }

  /**
   * Print pretty location.
   * @returns {string}
   */
  printLocation() {
    const location = this.attrs.location || {};
    return appModel.printLocation(location);
  }

  setGPSLocation = (location: Location) => {
    const isNotPlantSurvey = this.metadata.survey !== 'plant';
    const isChild = this.parent;
    if (isNotPlantSurvey || isChild) {
      this.attrs.location = location;
      return this.save();
    }

    const { gridSquareUnit } = this.metadata;

    const gridCoords = locationToGrid(location);
    if (!gridCoords) return null;

    location.source = 'gridref'; // eslint-disable-line
    location.accuracy = gridSquareUnit !== 'monad' ? 500 : 1000; // tetrad otherwise

    this.attrs.location = location;
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
          this.isUploaded() && !!subSample.occurrences.some(hasBeenVerified);
        return status;
      };

      this.samples.some(getSamples);
      return this.isUploaded() && !!status;
    }

    return this.isUploaded() && !!this.occurrences.some(hasBeenVerified);
  }
}

export const useValidateCheck = (sample: Sample) => {
  const alert = useAlert();
  const { t } = useTranslation();

  const showValidateCheck = () => {
    const invalids = sample.validateRemote();
    if (invalids) {
      alert({
        header: t('Survey incomplete'),
        skipTranslation: true,
        message: getDeepErrorMessage(invalids),
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
