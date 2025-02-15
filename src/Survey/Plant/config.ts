import { peopleOutline, businessOutline, pencilOutline } from 'ionicons/icons';
import * as Yup from 'yup';
import { groupsReverse as groups } from 'common/data/informalGroups';
import VCs from 'common/data/vice_counties.data.json';
import gridAlertService from 'common/helpers/gridAlertService';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'models/app';
import userModel from 'models/user';
import {
  dateAttr,
  commentAttr,
  verifyLocationSchema,
  Survey,
  locationAttr,
  getSystemAttrs,
  taxonAttr,
  makeSubmissionBackwardsCompatible,
  sensitivityPrecisionAttr,
  childGeolocationAttr,
} from 'Survey/common/config';

const stageOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'Flowering', id: 5331 },
  { value: 'Fruiting', id: 5330 },
  { value: 'Juvenile', id: 5328 },
  { value: 'Mature', id: 5332 },
  { value: 'Seedling', id: 5327 },
  { value: 'Vegetative', id: 5329 },
];

const statusOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'Native', id: 5709 },
  { value: 'Unknown', id: 5710 },
  { value: 'Introduced', id: 6775 },
  { value: 'Introduced - planted', id: 5711 },
  { value: 'Introduced - surviving', id: 10662 },
  { value: 'Introduced - casual', id: 10663 },
  { value: 'Introduced - established', id: 5712 },
  { value: 'Introduced - invasive', id: 5713 },
];

const survey: Survey = {
  name: 'plant',
  label: 'Plant',
  id: 325,
  webForm: 'enter-vascular-plants',

  taxaGroups: [
    groups['flower. plant'],
    groups.clubmoss,
    groups.fern,
    groups.horsetail,
    groups.conifer,
    groups.stonewort,
    groups.moss,
    groups.liverwort,
  ],

  render: [
    'smp:location',
    'smp:childGeolocation',
    'smp:vice-county',
    'smp:date',
    'smp:recorders',
    'smp:comment',
  ],

  attrs: {
    date: dateAttr,

    location: {
      ...locationAttr,
      menuProps: { label: 'Square' },
      remote: {
        id: 'entered_sref',
        values(location, submission) {
          // eslint-disable-next-line no-param-reassign
          submission.values.location_name = location.name; // this is a native indicia attr
          return location.gridref;
        },
      },
    },

    childGeolocation: childGeolocationAttr,

    recorders: {
      menuProps: { icon: peopleOutline, skipValueTranslation: true },
      pageProps: {
        attrProps: {
          input: 'inputList',
          info: 'If anyone helped with documenting the record please enter their name here.',
          inputProps: { placeholder: 'Recorder name' },
        },
      },

      remote: {
        id: 1018,
        values(val: any, submission: any) {
          // add recorder count
          let count;
          switch (true) {
            case val.length === 1:
              count = 7299;
              break;
            case val.length === 2:
              count = 7300;
              break;
            case val.length <= 5:
              count = 7301;
              break;
            case val.length <= 10:
              count = 7302;
              break;
            case val.length <= 20:
              count = 7303;
              break;
            case val.length >= 21:
              count = 7304;
              break;
            default:
              throw new Error('No such recorderCount case found!');
          }

          // eslint-disable-next-line no-param-reassign
          submission.values['smpAttr:992'] = count;

          return val;
        },
      },
    },

    'vice-county': {
      menuProps: {
        icon: businessOutline,
        label: 'Vice County',
        parse: (val: any) => val?.name,
      },
      pageProps: {
        headerProps: { title: 'Vice County' },
        attrProps: {
          input: 'radio',
          set: (val: any, model: any) => {
            const byName = ({ name }: any) => name === val;
            const VC = VCs.find(byName);
            // eslint-disable-next-line no-param-reassign
            model.attrs['vice-county'] = VC;
          },

          get: (model: any) => model.attrs['vice-county']?.name,
          inputProps: {
            options: VCs.map((vc: any) => ({ value: vc.name })),
          },
        },
      },
      remote: {
        id: 991,
        values(val: any, submission: any) {
          const id = survey.attrs?.['vice-county'].remote?.id;
          // eslint-disable-next-line no-param-reassign
          submission.values[`smpAttr:${id}:name`] = val.name;

          return parseInt(val.id, 10);
        },
      },
    },

    comment: commentAttr,
  },

  smp: {
    render: [
      'occ:status',
      'occ:stage',
      'occ:abundance',
      'occ:identifiers',
      'occ:comment',
      'occ:sensitivityPrecision',
    ],

    attrs: {
      date: dateAttr,

      location: {
        ...locationAttr,
        remote: {
          id: 'entered_sref',
          values(location, submission) {
            // eslint-disable-next-line no-param-reassign
            submission.values.location_name = location.name; // this is a native indicia attr
            return location.gridref;
          },
        },
      },
    },

    occ: {
      attrs: {
        taxon: taxonAttr,

        abundance: {
          menuProps: { icon: numberIcon, skipValueTranslation: true },
          pageProps: {
            attrProps: {
              input: 'input',
              info: 'Abundance (DAFOR, LA, LF or count).',
              set(value: any, model: any) {
                const re = /^(\d+|[DAFOR]|LA|LF)$/;
                if (!re.test(value)) return;
                // eslint-disable-next-line no-param-reassign
                model.attrs.abundance = value;
              },
              inputProps: { options: statusOptions },
            },
          },
          remote: {
            id: 610,
            values: (value: any) =>
              typeof value === 'string' ? value.toUpperCase() : value, // fixes lowercase values
          },
        },

        status: {
          menuProps: { icon: pencilOutline },
          pageProps: {
            attrProps: {
              input: 'radio',
              info: 'Please pick the status.',
              inputProps: { options: statusOptions },
            },
          },
          remote: { id: 507, values: statusOptions },
        },

        stage: {
          menuProps: { icon: progressIcon },
          pageProps: {
            attrProps: {
              input: 'radio',
              info: 'Please pick the life stage.',
              inputProps: { options: stageOptions },
            },
          },
          remote: { id: 466, values: stageOptions },
        },

        identifiers: {
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
          remote: { id: 125 },
        },

        comment: commentAttr,

        sensitivityPrecision: sensitivityPrecisionAttr(),
      },
    },

    async create({ Sample, Occurrence, taxon, images, surveySample }) {
      const { gridSquareUnit } = appModel.attrs;

      const sample = new Sample({
        isSubSample: true,

        metadata: {
          survey_id: survey.id,
          survey: survey.name,
          gridSquareUnit,
        },
        attrs: {
          enteredSrefSystem: 'OSGB',
          location: {},
        },
      });

      const occurrence = new Occurrence({ attrs: { taxon } });
      if (images) occurrence.media.push(...images);

      sample.occurrences.push(occurrence);

      const locks = appModel.attrs.attrLocks.complex.plant || {};
      appModel.appendAttrLocks(sample, locks);

      if (surveySample.attrs.childGeolocation) {
        const ignoreError = () => {};
        sample.startGPS().catch(ignoreError);
      }

      return sample;
    },

    modifySubmission(submission) {
      makeSubmissionBackwardsCompatible(submission, survey);

      return submission;
    },
  },

  verify(attrs) {
    try {
      Yup.object()
        .shape({
          location: verifyLocationSchema,
          recorders: Yup.array()
            .of(Yup.string())
            .min(1, 'Recorders field is missing.'),
        })
        .validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create({ Sample, alert }) {
    const { gridSquareUnit, useGridNotifications } = appModel.attrs;

    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.isLoggedIn()) {
      recorders.push(userModel.getPrettyName());
    }

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
        gridSquareUnit,
      },
      attrs: {
        date: new Date().toISOString(),
        location: {},
        enteredSrefSystem: 'OSGB',
        sampleMethodId: 7305,
        recorders,
      },
    });

    if (useGridNotifications) gridAlertService.start(sample.cid, alert);

    return Promise.resolve(sample);
  },

  modifySubmission(submission: any) {
    Object.assign(submission.values, getSystemAttrs());

    makeSubmissionBackwardsCompatible(submission, survey);

    return submission;
  },
};

export default survey;
