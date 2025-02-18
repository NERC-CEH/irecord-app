import { object } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import progressIcon from 'common/images/progress-circles.svg';
import { Survey } from 'Survey/common/config';

const stage = [
  { value: 'Not Recorded', id: 17674 },
  { value: 'Adult', id: 17669 },
  { value: 'Young', id: 17670 },
  { value: 'Tadpoles/larvae', id: 17671 },
  { value: 'Spawn/egg', id: 17672 },
  { value: 'Other', id: 17673 },
];

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'reptiles',
  taxaGroups: [groups.reptile, groups.amphibian],

  occ: {
    attrs: {
      stage: {
        menuProps: { icon: progressIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            inputProps: { options: stage },
          },
        },
        remote: { id: 874, values: stage },
      },
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { required_error: 'Species is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
