import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'common/models/app';
import AppOccurrence from 'models/occurrence';

const stageOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'Adult', id: 1950 },
  { value: 'Pre-adult', id: 1951 },
  { value: 'Other', id: 1952 },
];

const sexOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'Male', id: 1947 },
  { value: 'Female', id: 1948 },
  { value: 'Mixed', id: 3482 },
];

const numberOptions = [
  { isPlaceholder: true, label: 'Ranges' },
  { value: null, isDefault: true, label: 'Present' },
  { value: '1', id: 665 },
  { value: '2-5', id: 666 },
  { value: '6-20', id: 667 },
  { value: '21-100', id: 668 },
  { value: '101-500', id: 669 },
  { value: '500+', id: 670 },
];

export const numberAttr = {
  id: 'number',
  menuProps: {
    label: 'Abundance',
    icon: numberIcon,
    parse: (_: any, model: any) =>
      model.data['number-ranges'] || model.data.number,
    isLocked: (model: any) => {
      const value = numberAttr.menuProps?.getLock?.(model);
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
        set: (value: number, model: AppOccurrence) =>
          Object.assign(model.data, {
            number: value,
            'number-ranges': undefined,
          }),
        get: (model: AppOccurrence) => model.data.number,
        input: 'slider',
        info: 'How many individuals of this species did you see?',
        inputProps: { max: 10000 },
      },
      {
        set: (value: string, model: AppOccurrence) =>
          Object.assign(model.data, {
            number: undefined,
            'number-ranges': value,
          }),
        get: (model: AppOccurrence) => model.data['number-ranges'],
        onChange: () => window.history.back(),
        input: 'radio',
        inputProps: { options: numberOptions },
      },
    ],
  },
  remote: { id: 16 },
};

export const numberRangesAttr = {
  id: 'number-ranges',
  remote: { id: 523, values: numberOptions },
} as const;

export const stageAttr = {
  id: 'stage',
  menuProps: { icon: progressIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please pick the life stage.',
      inputProps: { options: stageOptions },
    },
  },
  remote: { id: 106, values: stageOptions },
} as const;

export const sexAttr = {
  id: 'sex',
  menuProps: { icon: genderIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please indicate the sex of the organism.',
      inputProps: { options: sexOptions },
    },
  },
  remote: { id: 105, values: sexOptions },
} as const;
