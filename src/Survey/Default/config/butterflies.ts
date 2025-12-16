import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'models/app';
import { Survey } from 'Survey/common/config';

const sex = [
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: 'Male', id: 1947 },
  { value: 'Female', id: 1948 },
  { value: 'Mixed', id: 3482 },
];

const stage = [
  { value: 'Adult', id: 3929 },
  { value: 'Egg', id: 3932 },
  { value: 'Larva', id: 3931 },
  { value: 'Larval web', id: 14079 },
  { value: 'Pupa', id: 3930 },
];

const numberOptions = [
  { isPlaceholder: true, label: 'Ranges' },
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: '1', id: 2402 },
  { value: '2-9', id: 2404 },
  { value: '10-29', id: 2406 },
  { value: '30-99', id: 2408 },
  { value: '100+', id: 2410 },
];

const butterflySexAttr = {
  id: 'sex',
  menuProps: { icon: genderIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please indicate the sex of the organism.',
      inputProps: { options: sex },
    },
  },
  remote: { id: 105, values: sex },
} as const;

const butterflyStageAttr = {
  id: 'stage',
  menuProps: { icon: progressIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please pick the life stage.',
      inputProps: { options: stage },
    },
  },
  remote: {
    id: 293,
    values: [
      ...stage,
      // for backwards compatibility - remove later:
      { value: 'Adults', id: 3929 },
      { value: 'Larvae', id: 3931 },
      { value: 'Eggs', id: 3932 },
      { value: 'Pupae', id: 3930 },
      { value: 'Larval webs', id: 14079 },
    ],
  },
};

const butterflyNumberAttr = {
  id: 'number',
  menuProps: {
    label: 'Abundance',
    icon: numberIcon,
    parse: (_: any, model: any) =>
      model.data['number-ranges'] || model.data.number,
    isLocked: (model: any) => {
      const value = butterflyNumberAttr.menuProps?.getLock?.(model);
      return (
        value &&
        (value === appModel.getAttrLock(model, 'number') ||
          value === appModel.getAttrLock(model, 'number-ranges'))
      );
    },
    getLock: (model: any) => model.data['number-ranges'] || model.data.number,
    unsetLock: (model: any) => {
      appModel.unsetAttrLock(model, 'number', true);
      appModel.unsetAttrLock(model, 'number-ranges', true);
    },
    setLock: (model: any, _: any, value: any) => {
      const numberRegex = /^\d+$/; // https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
      if (numberRegex.test(`${value}`)) {
        appModel.setAttrLock(model, 'number', value, true);
      } else {
        appModel.setAttrLock(model, 'number-ranges', value, true);
      }
    },
  },
  pageProps: {
    headerProps: { title: 'Abundance' },
    attrProps: [
      {
        set: (value: any, model: any) =>
          Object.assign(model.data, {
            number: value,
            'number-ranges': undefined,
          }),
        get: (model: any) => model.data.number,
        input: 'slider',
        info: 'How many individuals of this species did you see?',
        inputProps: { max: 10000 },
      },
      {
        set: (value: any, model: any) =>
          Object.assign(model.data, {
            number: undefined,
            'number-ranges': value,
          }),
        get: (model: any) => model.data['number-ranges'],
        onChange: () => window.history.back(),
        input: 'radio',
        inputProps: { options: numberOptions },
      },
    ],
  },
  remote: { id: 16 },
};

const butterflyNumberRangesAttr = {
  id: 'number-ranges',
  remote: { id: 203, values: numberOptions },
} as const;

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'butterflies',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.butterfly],

  occ: {
    attrs: {
      [butterflySexAttr.id]: butterflySexAttr,
      [butterflyStageAttr.id]: butterflyStageAttr,
      [butterflyNumberAttr.id]: butterflyNumberAttr,
      [butterflyNumberRangesAttr.id]: butterflyNumberRangesAttr,
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { required_error: 'Species is missing.' }).nullable(),
        stage: string({ required_error: 'Stage is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
