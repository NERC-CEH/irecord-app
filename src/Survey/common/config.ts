import {
  calendarOutline,
  peopleOutline,
  clipboardOutline,
} from 'ionicons/icons';
import * as Yup from 'yup';
import { date as DateHelp, device, PageProps, RemoteConfig } from '@flumens';
import config from 'common/config';
import progressIcon from 'common/images/progress-circles.svg';
import radarIcon from 'common/images/radar.svg';
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

const typeSchema = Yup.string().defined();

const validateType = (val: any) => {
  try {
    typeSchema.validateSync(val);
    return true;
  } catch (e) {
    return false;
  }
};

export const verifyTypeSchema = Yup.mixed().test(
  'type',
  'Please enter the type of observation.',
  validateType
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

  values: (date: any) => DateHelp.print(date, false),
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

export const activityAttr = {
  menuProps: {
    icon: peopleOutline,
    parse: (value: any) => value?.title,
  },
  remote: { id: 'group_id', values: (activity: any) => activity.id },
};

const methodOptions = [
  { label: 'Not recorded', value: null, isDefault: true },
  { value:'Auditory record', id: 21965 },  
  { value:'Bat detector', id: 21947 },   
  { value:'Camera trap', id: 21948 },   
  { value:'Kick sample', id: 21967 },   
  { value:'Light trap', id: 21949 },   
  { value:'Net trap', id: 21950 },   
  { value:'Trap', id: 21951 },   
  { value:'Visual observation', id: 21952 },  
];

export const methodAttr = {
  menuProps: {
    icon: radarIcon,
    
  },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please select the method used to collect the record.',
      inputProps: { options: methodOptions },
    },
  },
  remote: { id: 1811, values: methodOptions },
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
    label: 'Identifiers',
    skipValueTranslation: true,
  },
  pageProps: {
    headerProps: { title: 'Identifiers' },
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

export const coreAttributes = [
  'smp:location',
  'smp:locationName',
  'smp:location_type',
  'smp:date',
  'smp:recorder',
  'occ:comment',
  'smp:activity',
  'smp:method',
];

export const taxonAttr = {
  remote: {
    id: 'taxa_taxon_list_id',
    values(taxon: any) {
      return taxon.warehouse_id;
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

export const assignParentLocationIfMissing = (
  submission: any,
  sample: Sample
) => {
  if (!sample.parent) return;

  const keys: any = (sample.parent.keys as any)();
  const parentAttrs = sample.parent.attrs;
  const location = submission.values[keys.location.id];
  if (!location) {
    const parentLocation = keys.location.values(
      parentAttrs.location,
      submission
    );
    // eslint-disable-next-line no-param-reassign
    submission.values[keys.location.id] = parentLocation;

    const locationType = keys.location_type.values[parentAttrs.location_type];

    // eslint-disable-next-line no-param-reassign
    submission.values[keys.location_type.id] = locationType;
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
    taxon: Taxon;
    identifier?: string;
    photo?: any;
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
    taxon: Taxon;
    surveySample: Sample;
    skipGPS?: boolean;
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
    image?: Media | null;
    skipLocation?: boolean;
    skipGPS?: boolean;
    alert?: any;
  }) => Promise<Sample>;
}
