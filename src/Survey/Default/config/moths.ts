import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import { mothStageAttr, Survey } from 'Survey/common/config';

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'moths',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.moth],

  occ: {
    attrs: {
      [mothStageAttr.id]: mothStageAttr,
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { required_error: 'Species is missing.' }).nullable(),
        stage: string({ required_error: 'Stage is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
