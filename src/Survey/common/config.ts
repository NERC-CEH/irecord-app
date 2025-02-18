import {
  calendarOutline,
  peopleOutline,
  clipboardOutline,
  eyeOffOutline,
  locationOutline,
} from 'ionicons/icons';
import * as Yup from 'yup';
import { dateFormat, device, PageProps, RemoteConfig } from '@flumens';
import config from 'common/config';
import progressIcon from 'common/images/progress-circles.svg';
import groups from 'common/models/collections/groups';
import Media from 'models/media';
import Occurrence, { Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import { Config as MenuProps } from 'Survey/common/Components/MenuAttr';

const fixedLocationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  name: Yup.string().required(),
});

const validateLocation = (val: any) => {
  try {
    fixedLocationSchema.validateSync(val);
    return true;
  } catch (e) {
    return false;
  }
};

export const verifyLocationSchema = Yup.mixed().test(
  'location',
  'Please enter location and its name.',
  validateLocation
);

// eslint-disable-next-line import/prefer-default-export
export const dateAttr = {
  menuProps: {
    icon: calendarOutline,
    attrProps: {
      input: 'date',
      inputProps: {
        max: () => new Date(),
        label: 'Date',
        icon: calendarOutline,
        autoFocus: false,
        usePrettyDates: true,
        presentation: 'date',
      },
    },
  },

  values: (date: any) => dateFormat.format(new Date(date)),
};

export const commentAttr = {
  menuProps: { icon: clipboardOutline, skipValueTranslation: true },
  pageProps: {
    attrProps: {
      input: 'textarea',
      info: 'Please add any extra info about this record.',
    },
  },
};

/**
 * @deprecated
 */
export const activityAttr = {
  menuProps: {
    icon: peopleOutline,
    parse: (value: any) => value?.title,
  },
  remote: { id: 'group_id', values: (activity: any) => activity.id },
};

export const groupIdAttr = {
  menuProps: {
    icon: peopleOutline,
    label: 'Activity',
    parse: (groupId: any) =>
      groups.find((g: any) => g.id === groupId)?.attrs.title || groupId,
  },
};

export const recorderAttr = {
  menuProps: { icon: peopleOutline, skipValueTranslation: true },
  pageProps: {
    attrProps: {
      input: 'input',
      info: 'If anyone helped with documenting the record please enter their name here.',
      inputProps: { placeholder: 'Recorder name' },
    },
  },

  required: true,
  remote: { id: 127 },
};

export const identifiersAttr = {
  menuProps: {
    icon: peopleOutline,
    label: 'Identified by',
    skipValueTranslation: true,
  },
  pageProps: {
    headerProps: { title: 'Identified by' },
    attrProps: {
      input: 'inputList',
      info: 'If another person identified the species for you, please enter their name here.',
      inputProps: {
        placeholder: 'Name',
      },
    },
  },
  remote: { id: 18 },
};

export const sensitivityPrecisionAttr = (defaultPrecision = 2000) => ({
  menuProps: {
    label: 'Sensitive',
    icon: eyeOffOutline,
    type: 'toggle',
    get: (model: any) => !!model.attrs.sensitivityPrecision,
    set: (val: boolean, model: any) => {
      // eslint-disable-next-line no-param-reassign
      model.attrs.sensitivityPrecision = val ? defaultPrecision : '';
    },
  },
});

export const coreAttributes = [
  'smp:location',
  'smp:locationName',
  'smp:enteredSrefSystem',
  'smp:location_type', // backwards compatible
  'smp:date',
  'smp:recorder',
  'occ:comment',
  'occ:sensitivityPrecision',
  'smp:groupId',
  'smp:activity', // backwards compatible
];

export const taxonAttr = {
  remote: {
    id: 'taxa_taxon_list_id',
    values(taxon: Taxon) {
      return (
        taxon.warehouseId ||
        // backwards compatible
        (taxon as any).warehouse_id
      );
    },
  },
};

export const systemAttrs = {
  device: {
    remote: {
      id: 273,
      values: {
        ios: 2398,
        android: 2399,
        // backwards compatible
        iOS: 2398,
        Android: 2399,
      },
    },
  },

  device_version: { remote: { id: 759 } },
  app_version: { remote: { id: 1139 } },
};

export const getSystemAttrs = () => {
  const platform = (systemAttrs.device.remote.values as any)[
    device.info?.platform as any
  ];

  return {
    [`smpAttr:${systemAttrs.device.remote.id}`]: platform,
    [`smpAttr:${systemAttrs.device_version.remote.id}`]: device.info?.osVersion,
    [`smpAttr:${systemAttrs.app_version.remote.id}`]: config.version,
  };
};

export const makeSubmissionBackwardsCompatible = (
  submission: any,
  surveyConfig: Survey
) => {
  if (!submission.values.survey_id) {
    submission.values.survey_id = surveyConfig.id; //eslint-disable-line
  }

  if (!submission.values.input_form) {
    submission.values.input_form = surveyConfig.webForm; //eslint-disable-line
  }
};

export const locationAttr = {
  remote: {
    id: 'entered_sref',
    values(location: any, submission: any) {
      // convert accuracy for map and gridref sources
      const { accuracy, source, gridref, altitude, name, altitudeAccuracy } =
        location;

      // add other location related attributes
      // eslint-disable-next-line
      submission.values = { ...submission.values };

      if (source) submission.values['smpAttr:760'] = source; // eslint-disable-line
      if (gridref) submission.values['smpAttr:335'] = gridref; // eslint-disable-line

      submission.values['smpAttr:282'] = accuracy; // eslint-disable-line
      submission.values['smpAttr:283'] = altitude; // eslint-disable-line
      submission.values['smpAttr:284'] = altitudeAccuracy; // eslint-disable-line
      submission.values['location_name'] = name; // eslint-disable-line

      const lat = parseFloat(location.latitude);
      const lon = parseFloat(location.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lat)) return null;

      return `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
    },
  },
};

export const childGeolocationAttr = {
  menuProps: {
    label: 'Geolocate list entries',
    icon: locationOutline,
    type: 'toggle',
  },
  pageProps: { attrProps: { input: 'toggle' } },
};

const mothStages = [
  { value: 'Not recorded', id: 10647 },
  { value: 'Adult', id: 2189 },
  { value: 'Larva', id: 2190 },
  { value: 'Larval web', id: 2191 },
  { value: 'Larval case', id: 2192 },
  { value: 'Mine', id: 2193 },
  { value: 'Egg', id: 2194 },
  { value: 'Egg batch', id: 2195 },
  { value: 'Pupa', id: 17556 },
];

export const mothStageAttr = {
  menuProps: { icon: progressIcon, required: true },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please indicate the stage of the organism. If you are recording larvae, cases or leaf-mines please add the foodplant in to the comments field, as this is often needed to verify the records.',
      inputProps: { options: mothStages },
    },
  },
  remote: { id: 130, values: mothStages },
};

export type AttrConfig = {
  menuProps?: MenuProps;
  pageProps?: Omit<PageProps, 'attr' | 'model'>;
  remote?: RemoteConfig;
};

interface Attrs {
  [key: string]: AttrConfig;
}

type OccurrenceConfig = {
  render?: any[] | ((model: Occurrence) => any[]);
  attrs: Attrs;
  create?: (props: {
    Occurrence: typeof Occurrence;
    taxon?: Taxon;
    identifier?: string;
    images?: Media[];
  }) => Occurrence;
  verify?: (attrs: any) => any;
  modifySubmission?: (submission: any, model: any) => any;
  /**
   * Set to true if multi-species surveys shouldn't auto-increment it to 1 when adding to lists.
   */
  skipAutoIncrement?: boolean;
};

export type SampleConfig = {
  render?: any[] | ((model: Sample) => any[]);
  attrs?: Attrs;
  create?: (props: {
    Sample: typeof Sample;
    Occurrence: typeof Occurrence;
    taxon?: Taxon;
    images?: Media[];
    surveySample: Sample;
  }) => Promise<Sample>;
  verify?: (attrs: any) => any;
  modifySubmission?: (submission: any, model: any) => any;
  smp?: SampleConfig;
  occ?: OccurrenceConfig;
};

export interface Survey extends SampleConfig {
  /**
   * Survey version.
   */
  version?: number;
  /**
   * Remote warehouse survey ID.
   */
  id: number;
  /**
   * In-App survey code name.
   */
  name: string;
  // name: 'plant' | 'list' | 'moth' | 'default';
  /**
   * Pretty survey name to show in the UI.
   */
  label?: string;
  /**
   * Remote website survey edit page path.
   */
  webForm?: string;
  /**
   * Which species group this config belongs to. Allows to link multiple taxon groups together under a common name.
   */
  taxa?: string;
  /**
   * Survey priority to take over other survey configs for the same species group.
   */
  taxaPriority?: number;
  /**
   * Informal taxon groups to use for the survey.
   */
  taxaGroups?: number[];
  /**
   * Custom survey getter. Processes the survey config.
   */
  get?: (sample: Sample) => Survey;

  create: (props: {
    Sample: typeof Sample;
    Occurrence: typeof Occurrence;
    taxon?: Taxon;
    images?: Media[] | null;
    skipLocation?: boolean;
    alert?: any;
  }) => Promise<Sample>;
}
