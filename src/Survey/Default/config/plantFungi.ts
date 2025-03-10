import { groupsReverse as groups } from 'common/data/informalGroups';
import numberIcon from 'common/images/number.svg';
import appModel from 'models/app';
import Sample from 'models/sample';
import { plantStageAttr, Survey } from 'Survey/common/config';
import defaultSurveyConf from '.';

const numberOptions = [
  { isPlaceholder: true, label: 'Ranges' },
  { value: '1', id: 665 },
  { value: 1, id: 665, className: 'hidden' }, // TODO: remove this in the future when users migrated
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

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'plants-fungi',
  taxaGroups: [
    groups['flower. plant'],
    groups.clubmoss,
    groups.fern,
    groups.horsetail,
    groups.conifer,
    groups.stonewort,
    groups.fungus,

    // disabled because there is a bryophytes config
    // groups.moss,
    // groups.liverwort
  ],

  render(model: Sample) {
    const group = ['occ:number', 'occ:number-ranges'];
    const getTopParent = (m: Sample): Sample =>
      m.parent ? getTopParent(m.parent) : m;
    const topParent = getTopParent(model);
    if (topParent.data.surveyId !== defaultSurveyConf.id) {
      group.splice(1, 0, 'occ:numberDAFOR');
    }

    return [
      {
        id: 'occ:number',
        label: 'Abundance',
        icon: 'number',
        info: 'How many individuals of this species did you see?',
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
      stage: plantStageAttr,
      number: {
        menuProps: {
          label: 'Abundance',
          icon: numberIcon,
          parse: (_, model: any) =>
            model.data['number-ranges'] ||
            model.data.numberDAFOR ||
            model.data.number,

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
            model.data['number-ranges'] ||
            model.data.numberDAFOR ||
            model.data.number,
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
                Object.assign(model.data, {
                  number: value,
                  numberDAFOR: undefined,
                  'number-ranges': undefined,
                }),
              get: model => model.data.number,
              input: 'slider',
              info: 'How many individuals of this species did you see?',
              inputProps: { max: 500 },
            },
            // DAFOR
            {
              set: (value, model) =>
                Object.assign(model.data, {
                  number: undefined,
                  numberDAFOR: value,
                  'number-ranges': undefined,
                }),
              get: model => model.data.numberDAFOR,
              onChange: () => window.history.back(),
              input: 'radio',
              inputProps: { options: numberDAFOROptions },
            },
            // RANGES
            {
              set: (value, model) =>
                Object.assign(model.data, {
                  number: undefined,
                  numberDAFOR: undefined,
                  'number-ranges': value,
                }),
              get: model => model.data['number-ranges'],
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
