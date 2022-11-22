import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'models/app';
import { groupsReverse as groups } from 'common/data/informalGroups';
import { Survey } from 'Survey/common/config';

const sex = [
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: 'Male', id: 1947 },
  { value: 'Female', id: 1948 },
  { value: 'Mixed', id: 3482 },
];

const stage = [
  { value: null, isDefault: true, label: 'Not Recorded' },
  { value: 'Adults', id: 3929 },
  { value: 'Larvae', id: 3931 },
  { value: 'Eggs', id: 3932 },
  { value: 'Pupae', id: 3930 },
  { value: 'Larval webs', id: 14079 },
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

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'butterflies',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.butterfly],

  occ: {
    attrs: {
      sex: {
        menuProps: { icon: genderIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please indicate the sex of the organism.',
            inputProps: { options: sex },
          },
        },
        remote: { id: 105, values: sex },
      },
      stage: {
        menuProps: { icon: progressIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please pick the life stage.',
            inputProps: { options: stage },
          },
        },
        remote: { id: 293, values: stage },
      },
      number: {
        menuProps: {
          label: 'Abundance',
          icon: numberIcon,
          parse: (_, model: any) =>
            model.attrs['number-ranges'] || model.attrs.number,
          isLocked: (model: any) => {
            const value =
              survey.occ?.attrs?.number?.menuProps?.getLock?.(model);
            return (
              value &&
              (value === appModel.getAttrLock(model, 'number') ||
                value === appModel.getAttrLock(model, 'number-ranges'))
            );
          },
          getLock: (model: any) =>
            model.attrs['number-ranges'] || model.attrs.number,
          unsetLock: model => {
            appModel.unsetAttrLock(model, 'number', true);
            appModel.unsetAttrLock(model, 'number-ranges', true);
          },
          setLock: (model, _, value) => {
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
              set: (value, model) =>
                Object.assign(model.attrs, {
                  number: value,
                  'number-ranges': undefined,
                }),
              get: model => model.attrs.number,
              input: 'slider',
              info: 'How many individuals of this species did you see?',
              inputProps: { max: 500 },
            },
            {
              set: (value, model) =>
                Object.assign(model.attrs, {
                  number: undefined,
                  'number-ranges': value,
                }),
              get: model => model.attrs['number-ranges'],
              onChange: () => window.history.back(),
              input: 'radio',
              inputProps: { options: numberOptions },
            },
          ],
        },
        remote: { id: 16 },
      },

      'number-ranges': { remote: { id: 203, values: numberOptions } },
    },
  },
};

export default survey;
