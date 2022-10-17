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
import appModel, { SurveyDraftKeys } from 'models/app';
import config from 'common/config';
import defaultSurvey from 'Survey/Default/config';
import listSurvey from 'Survey/List/config';
import plantSurvey from 'Survey/Plant/config';
import mothSurvey from 'Survey/Moth/config';
import { IObservableArray } from 'mobx';
import mergeWith from 'lodash.mergewith';
import {
  coreAttributes,
  taxonGroupSurveys,
  Survey,
} from 'Survey/common/config';
import { useTranslation } from 'react-i18next';
import GPSExtension from './sampleGPSExt';
import { modelStore } from './store';
import Occurrence from './occurrence';
import Media from './media';

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
  survey: keyof typeof surveyConfigs;
  /**
   * @deprecated
   */
  complex_survey?: string;
  gridSquareUnit?: string;
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

  _store = modelStore;

  startGPS: any; // from extension

  isGPSRunning: any; // from extension

  stopGPS: any; // from extension

  constructor(options: SampleOptions) {
    super(options);

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

  getSurvey(): Survey {
    const getTaxaSpecifigConfig = () => {
      if (!this.occurrences.length) return this.survey;

      const [occ] = this.occurrences;
      const taxon = occ.attrs.taxon || {};

      return Sample.getSurvey(taxon.group);
    };

    const isDefaultSurvey = this.metadata.survey === 'default';
    if (isDefaultSurvey) {
      const isListSurveySubSample = !!this.parent;
      if (isListSurveySubSample) {
        const taxaSurvey = {
          ...getTaxaSpecifigConfig(),
          ...this.parent?.getSurvey()?.smp, // survey subsample config takes precedence
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete taxaSurvey.verify;
        return taxaSurvey;
      }

      return getTaxaSpecifigConfig();
    }

    const { survey } = this;
    if (!survey) {
      // legacy surveys
      if (
        this.metadata.complex_survey === 'plant' ||
        this.metadata.gridSquareUnit
      ) {
        console.log(`Found legacy survey. Setting ${this.cid} to plant.`);
        this.metadata.survey = 'plant';
        this.survey = plantSurvey;
        this.save();
        return this.getSurvey();
      }

      if (this.metadata.complex_survey === 'moth') {
        console.log(`Found legacy survey. Setting ${this.cid} to moth.`);
        this.metadata.survey = 'moth';
        this.survey = mothSurvey;
        this.save();
        return this.getSurvey();
      }

      if (this.metadata.complex_survey === 'default') {
        console.log(`Found legacy survey. Setting ${this.cid} to list.`);
        this.metadata.survey = 'list';
        this.survey = listSurvey;
        this.save();
        return this.getSurvey();
      }

      console.log(`Found legacy survey. Setting ${this.cid} to default.`);
      this.metadata.survey = 'default';
      this.survey = defaultSurvey;
      this.save();
      return this.getSurvey();
    }

    const returnSubSampleSurvey = this.parent;
    if (returnSubSampleSurvey) return (survey.smp || {}) as Survey;

    return survey as Survey;
  }

  static getSurvey(taxonGroup: any): any {
    if (!taxonGroup) return { ...defaultSurvey };

    const matchesGroup = (survey: any) =>
      survey.taxonGroups.includes(taxonGroup);
    const matchedSurvey = Object.values(taxonGroupSurveys).find(matchesGroup);
    if (!matchedSurvey) return defaultSurvey;

    function skipAttributes(__: any, srcValue: any) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isObject = typeof srcValue === 'object' && srcValue !== null;
      if (isObject && srcValue.remote) {
        return srcValue;
      }
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { render, taxonGroups, ...defaultSurveyCopy } = defaultSurvey;
    const mergedDefaultSurvey = mergeWith(
      {},
      defaultSurveyCopy,
      matchedSurvey,
      skipAttributes
    );

    return mergedDefaultSurvey;
  }

  removeOldTaxonAttributes(occ: Occurrence, taxon: any) {
    const survey = this.getSurvey();
    const newSurvey = Sample.getSurvey(taxon.group);

    if (survey.group !== newSurvey.group) {
      // remove non-core attributes for survey switch
      const removeSmpNonCoreAttr = (key: any) => {
        if (!coreAttributes.includes(`smp:${key}`)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delete this.attrs[key];
        }
      };
      Object.keys(this.attrs).forEach(removeSmpNonCoreAttr);

      const removeOccNonCoreAttr = (key: any) => {
        if (!coreAttributes.includes(`occ:${key}`)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line no-param-reassign
          delete occ.attrs[key];
        }
      };
      Object.keys(occ.attrs).forEach(removeOccNonCoreAttr);
    }
  }

  removeDraftKey() {
    const surveyName = this.getSurvey().name;

    const draftIdKey = `draftId:${surveyName}` as keyof SurveyDraftKeys;
    appModel.attrs[draftIdKey] = null;
    appModel.save();
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
