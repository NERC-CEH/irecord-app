import numberIcon from 'common/images/number.svg';
import Sample from 'models/sample';
import appModel from 'models/app';
import { Survey } from './';

const numberOptions = [
  { isPlaceholder: true, label: 'Ranges' },
  { value: 1, id: 665 },
  { value: '2-5', id: 666 },
  { value: '6-20', id: 667 },
  { value: '21-100', id: 668 },
  { value: '101-500', id: 669 },
  { value: '500+', id: 670 },
];

const numberDAFOROptions = [
  { isPlaceholder: true, label: 'DAFOR' },
  { value: 'Dominant', id: 1 },
  { value: 'Abundant', id: 2 },
  { value: 'Frequent', id: 3 },
  { value: 'Occasional', id: 4 },
  { value: 'Rare', id: 5 },
];

const survey: Partial<Survey> & { group: string } = {
  group: 'plants-fungi',
  taxonGroups: [
    89,
    78,
    87,
    99,
    81,
    148,
    // 133,
    // 129,

    92, // fungi
  ],

  render(model: Sample) {
    const group = ['occ:number', 'occ:number-ranges'];
    const getTopParent = (m: Sample): Sample =>
      m.parent ? getTopParent(m.parent) : m;
    const topParent = getTopParent(model);
    if (topParent.metadata.survey !== 'default') {
      group.splice(1, 0, 'occ:numberDAFOR');
    }

    return [
      {
        id: 'occ:number',
        label: 'Abundance',
        icon: 'number',
        info: 'How many individuals of this type?',
        group,
      },

      'occ:stage',
      'occ:sex',
      'occ:identifiers',
    ];
  },

  attrs: {},
  occ: {
    skipAutoIncrement: true,

    attrs: {
      number: {
        menuProps: {
          label: 'Abundance',
          icon: numberIcon,
          parse: (_, model: any) =>
            model.attrs['number-ranges'] ||
            model.attrs.numberDAFOR ||
            model.attrs.number,

          isLocked: (model: any) => {
            const value =
              survey.occ?.attrs?.number?.menuProps?.getLock?.(model);
            return (
              value &&
              (value === appModel.getAttrLock(model, 'number') ||
                value === appModel.getAttrLock(model, 'numberDAFOR') ||
                value === appModel.getAttrLock(model, 'number-ranges'))
            );
          },
          getLock: (model: any) =>
            model.attrs['number-ranges'] ||
            model.attrs.numberDAFOR ||
            model.attrs.number,
          unsetLock: model => {
            appModel.unsetAttrLock(model, 'number', true);
            appModel.unsetAttrLock(model, 'numberDAFOR', true);
            appModel.unsetAttrLock(model, 'number-ranges', true);
          },
          setLock: (model, _, value) => {
            const numberRegex = /^\d+$/; // https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
            if (numberRegex.test(`${value}`)) {
              appModel.setAttrLock(model, 'number', value, true);
            } else if (
              numberDAFOROptions.map((o: any) => o.value).includes(value)
            ) {
              appModel.setAttrLock(model, 'numberDAFOR', value, true);
            } else {
              appModel.setAttrLock(model, 'number-ranges', value, true);
            }
          },
        },
        pageProps: {
          headerProps: { title: 'Abundance' },
          attrProps: [
            // SLIDER
            {
              set: (value, model) =>
                Object.assign(model.attrs, {
                  number: value,
                  numberDAFOR: null,
                  'number-ranges': null,
                }),
              get: model => model.attrs.number,
              input: 'slider',
              info: 'How many individuals of this type?',
              inputProps: { min: 1, max: 500 },
            },
            // DAFOR
            {
              set: (value, model) =>
                Object.assign(model.attrs, {
                  number: null,
                  numberDAFOR: value,
                  'number-ranges': null,
                }),
              get: model => model.attrs.numberDAFOR,
              onChange: () => window.history.back(),
              input: 'radio',
              inputProps: { options: numberDAFOROptions },
            },
            // RANGES
            {
              set: (value, model) =>
                Object.assign(model.attrs, {
                  number: null,
                  numberDAFOR: null,
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

      numberDAFOR: { remote: { id: 2, values: numberDAFOROptions } },
      'number-ranges': { remote: { id: 523, values: numberOptions } },
    },
  },
};

export default survey;
