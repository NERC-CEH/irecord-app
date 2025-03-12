import {
  calendarOutline,
  peopleOutline,
  clipboardOutline,
  eyeOffOutline,
  locationOutline,
} from 'ionicons/icons';
import { z } from 'zod';
import { dateFormat, device, PageProps, RemoteConfig } from '@flumens';
import config from 'common/config';
import progressIcon from 'common/images/progress-circles.svg';
import groups from 'common/models/collections/groups';
import Media from 'models/media';
import Occurrence, { Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import { Config as MenuProps } from 'Survey/common/Components/MenuAttr';

export const locationAttrValidator = (obj: any = {}) =>
  z
    .object(
      {
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
      },
      { required_error: 'Location is missing.' }
    )
    .extend(obj)
    .refine(
      (val: any) =>
        Number.isFinite(val.latitude) && Number.isFinite(val.longitude),
      'Location is missing.'
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
      groups.find((g: any) => g.id === groupId)?.data.title || groupId,
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
    get: (model: any) => !!model.data.sensitivityPrecision,
    set: (val: boolean, model: any) => {
      // eslint-disable-next-line no-param-reassign
      model.data.sensitivityPrecision = val ? defaultPrecision : '';
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

const plantStageOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'Flowering', id: 5331 },
  { value: 'Fruiting', id: 5330 },
  { value: 'Juvenile', id: 5328 },
  { value: 'Mature', id: 5332 },
  { value: 'Seedling', id: 5327 },
  { value: 'Vegetative', id: 5329 },
  { value: 'Sporophyte', id: 23874 },
  { value: 'Gametophyte', id: 23875 },
];

export const plantStageAttr = {
  menuProps: { icon: progressIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please pick the life stage.',
      inputProps: { options: plantStageOptions },
    },
  },
  remote: { id: 466, values: plantStageOptions },
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
   * Remote website survey view page path.
   */
  webViewForm?: string;
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
