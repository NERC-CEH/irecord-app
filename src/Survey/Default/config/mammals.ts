import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import progressIcon from 'common/images/progress-circles.svg';
import { Survey } from 'Survey/common/config';

const stage = [
  { value: 'Not Recorded', id: 17668 },
  { value: 'Adult', id: 17665 },
  { value: 'Immature', id: 17666 },
  { value: 'Dead - roadkill', id: 21693 },
  { value: 'Other', id: 17667 },
  { value: 'Dead - other', id: 21694 },
];

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'mammals',
  taxaGroups: [groups.mammal],

  occ: {
    attrs: {
      stage: {
        menuProps: { icon: progressIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please indicate the stage of the organism. If you are recording larvae, cases or leaf-mines please add the foodplant in to the comments field, as this is often needed to verify the records.',
            inputProps: { options: stage },
          },
        },
        remote: { id: 873, values: stage },
      },
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { required_error: 'Species is missing.' }).nullable(),
        stage: string({ required_error: 'Stage is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
