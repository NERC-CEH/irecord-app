import {
  calendarOutline,
  peopleOutline,
  eyeOffOutline,
  locationOutline,
} from 'ionicons/icons';
import { z, type ZodError } from 'zod';
import { useAlert, type Location, type SampleSubmission } from '@flumens';
import type { RemoteConfig } from '@flumens/models/dist/Indicia/Sample';
import type {
  BlockConf as BlockT,
  ChoiceInputConf,
  DateTimeInputConf,
  TextInputConf,
  YesNoInputConf,
} from '@flumens/tailwind/dist/Survey';
import device from '@flumens/utils/dist/device';
import { IonIcon } from '@ionic/react';
import config from 'common/config';
import progressIcon from 'common/images/progress-circles.svg';
import groups from 'common/models/collections/groups';
import type Media from 'models/media';
import type Occurrence from 'models/occurrence';
import type { Taxon } from 'models/occurrence';
import type Sample from 'models/sample';

export const locationAttrValidator = (shape: z.ZodRawShape = {}) =>
  z
    .object(
      {
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
      },
      { error: 'Location is missing.' }
    )
    .extend(shape)
    .refine(
      value =>
        Number.isFinite(value.latitude) && Number.isFinite(value.longitude),
      'Location is missing.'
    );

export const dateAttr = {
  id: 'date',
  title: 'Date',
  prefix: <IonIcon icon={calendarOutline} className="size-6" />,
  type: 'dateTimeInput',
  validation: { noFutureValues: true },
} as const satisfies DateTimeInputConf;

export const commentAttr = {
  id: 'comment',
  title: 'Comment',
  type: 'textInput',
  appearance: 'multiline',
} as const satisfies TextInputConf;

export const groupIdAttr = {
  id: 'groupId',
  title: 'Activity',
  prefix: <IonIcon src={peopleOutline} className="size-6" />,
  type: 'choiceInput',
  container: 'page',
  get choices() {
    return groups.map(group => ({
      dataName: group.id!,
      title: group.data.title,
    }));
  },
} as const satisfies ChoiceInputConf;

export const recorderAttr = {
  id: 'smpAttr:127',
  title: 'Recorder',
  prefix: <IonIcon icon={peopleOutline} className="size-6" />,
  type: 'textInput',
  container: 'page',
  placeholder: 'Recorder name',
  description:
    'If anyone helped with documenting the record please enter their name here.',
  validation: { required: true },
} as const satisfies TextInputConf;

/** @deprecated */
export const recorderAttrOld = {
  id: 'recorder',
  remote: { id: 127 },
} as const;

/** @deprecated */
export const identifiersAttrOld = {
  id: 'identifiers',
  remote: { id: 18 },
} as const;

export const identifiersAttr = {
  id: 'occAttr:18',
  title: 'Identified by',
  prefix: <IonIcon icon={peopleOutline} className="size-6" />,
  type: 'textInput',
  container: 'page',
  multiple: true,
  placeholder: 'Name',
  description:
    'If another person identified the species for you, please enter their name here.',
} as const satisfies TextInputConf;

export const sensitivityPrecisionAttr = (defaultPrecision = 2000) => ({
  menuProps: {
    label: 'Sensitive',
    icon: eyeOffOutline,
    type: 'toggle',
    get: (model: Sample | Occurrence) => !!model.data.sensitivityPrecision,
    set: (val: boolean, model: Sample | Occurrence) => {
      // eslint-disable-next-line no-param-reassign
      model.data.sensitivityPrecision = val ? defaultPrecision : '';
    },
  },
});

export const coreAttributes = [
  'smp:location',
  'smp:locationName',
  'smp:enteredSrefSystem',
  'smp:date',
  `smp:${recorderAttr.id}`,
  'occ:comment',
  'occ:sensitivityPrecision',
  'smp:groupId',
];

export const taxonAttr = {
  id: 'taxon',
  type: 'custom',
  component: () => null,
  remote: {
    id: 'taxa_taxon_list_id',
    values: (taxon: Taxon) => taxon.warehouseId,
  },
} as const;

export const systemAttrs = {
  device: {
    remote: {
      id: 273,
      values: {
        ios: 2398,
        android: 2399,
      },
    },
  },
  device_version: { remote: { id: 759 } },

  app_version: { remote: { id: 1139 } },
};

export const getSystemAttrs = () => {
  const platformName = device.info?.platform;
  const platform =
    platformName === 'ios' || platformName === 'android'
      ? systemAttrs.device.remote.values[platformName]
      : undefined;

  return {
    [`smpAttr:${systemAttrs.device.remote.id}`]: platform,
    [`smpAttr:${systemAttrs.device_version.remote.id}`]: device.info?.osVersion,
    [`smpAttr:${systemAttrs.app_version.remote.id}`]: config.version,
  };
};

export const locationAttr = {
  id: 'location',
  remote: {
    id: 'entered_sref',
    values(location: Location, submission: SampleSubmission) {
      // convert accuracy for map and gridref sources
      const { accuracy, source, gridref, altitude, altitudeAccuracy } =
        location;

      // add other location related attributes
      // eslint-disable-next-line
      submission.values = { ...submission.values };

      if (source) submission.values['smpAttr:760'] = source; // eslint-disable-line
      if (gridref) submission.values['smpAttr:335'] = gridref; // eslint-disable-line

      submission.values['smpAttr:282'] = accuracy; // eslint-disable-line
      submission.values['smpAttr:283'] = altitude; // eslint-disable-line
      submission.values['smpAttr:284'] = altitudeAccuracy; // eslint-disable-line

      const lat = Number(location.latitude);
      const lon = Number(location.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lat)) return null;

      return `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
    },
  },
} as const;

export const childGeolocationAttr = {
  id: 'childGeolocation',
  title: 'Geolocate list entries',
  prefix: <IonIcon icon={locationOutline} className="size-6" />,
  type: 'yesNoInput',
} as const satisfies YesNoInputConf;

/** @deprecated */
export const mothStageAttrOld = {
  id: 'stage',
  remote: {
    id: 130,
    values: [
      { value: 'Not recorded', id: 10647 },
      { value: 'Adult', id: 2189 },
      { value: 'Larva', id: 2190 },
      { value: 'Larval web', id: 2191 },
      { value: 'Larval case', id: 2192 },
      { value: 'Mine', id: 2193 },
      { value: 'Egg', id: 2194 },
      { value: 'Egg batch', id: 2195 },
      { value: 'Pupa', id: 17556 },
    ],
  },
} as const;

export const mothStageAttr = {
  id: 'occAttr:130',
  title: 'Stage',
  prefix: <IonIcon src={progressIcon} className="size-6" />,
  type: 'choiceInput',
  container: 'page',
  choices: [
    { title: 'Not recorded', dataName: '10647' },
    { title: 'Adult', dataName: '2189' },
    { title: 'Larva', dataName: '2190' },
    { title: 'Larval web', dataName: '2191' },
    { title: 'Larval case', dataName: '2192' },
    { title: 'Mine', dataName: '2193' },
    { title: 'Egg', dataName: '2194' },
    { title: 'Egg batch', dataName: '2195' },
    { title: 'Pupa', dataName: '17556' },
  ],
  validation: { required: true },
  description:
    'Please indicate the stage of the organism. If you are recording larvae, cases or leaf-mines please add the foodplant in to the comments field, as this is often needed to verify the records.',
} as const satisfies ChoiceInputConf;

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

/** @deprecated */
export const plantStageAttrOld = {
  id: 'stage',
  remote: { id: 466, values: plantStageOptions },
} as const;

export const plantStageAttr = {
  id: 'occAttr:466',
  title: 'Stage',
  prefix: <IonIcon src={progressIcon} className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '' },
    { title: 'Flowering', dataName: '5331' },
    { title: 'Fruiting', dataName: '5330' },
    { title: 'Juvenile', dataName: '5328' },
    { title: 'Mature', dataName: '5332' },
    { title: 'Seedling', dataName: '5327' },
    { title: 'Vegetative', dataName: '5329' },
    { title: 'Sporophyte', dataName: '23874' },
    { title: 'Gametophyte', dataName: '23875' },
  ],
} as const satisfies ChoiceInputConf;

export type AttrConfig = {
  id: string;
  remote?: RemoteConfig;
};

export type BlockAttrConfig = {
  block: BlockT;
  remote?: RemoteConfig;
  menuProps?: undefined;
  pageProps?: undefined;
};

export type Attrs = Record<string, AttrConfig | BlockAttrConfig>;

type OccurrenceConfig = {
  render?: BlockT[] | ((model: Occurrence) => BlockT[]);
  attrs: Attrs;
  create?: (props: {
    taxon?: Taxon;
    identifier?: string;
    images?: Media[];
    isListSurvey?: boolean;
    alert?: ReturnType<typeof useAlert>;
  }) => Occurrence | Promise<Occurrence>;
  verify?: (attrs: Record<string, unknown>) => ZodError | undefined;
  modifySubmission?: (
    submission: SampleSubmission,
    model: Occurrence
  ) => SampleSubmission;
  /**
   * Set to true if multi-species surveys shouldn't auto-increment it to 1 when adding to lists.
   */
  skipAutoIncrement?: boolean;
};

export type SampleConfig = {
  render?: BlockT[] | ((model: Sample) => BlockT[]);
  attrs?: Attrs;
  create?: (props: {
    taxon?: Taxon;
    images?: Media[];
    surveySample: Sample;
    alert?: ReturnType<typeof useAlert>;
  }) => Promise<Sample>;
  verify?: (
    attrs: Record<string, unknown>,
    model: Sample
  ) => ZodError | undefined;
  modifySubmission?: (
    submission: SampleSubmission,
    model: Sample
  ) => SampleSubmission;
  smp?: SampleConfig;
  occ?: OccurrenceConfig;
};

export type Survey = {
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
    taxon?: Taxon;
    images?: Media[] | null;
    skipLocation?: boolean;
    alert?: ReturnType<typeof useAlert>;
  }) => Promise<Sample>;
} & Omit<SampleConfig, 'create'>;
