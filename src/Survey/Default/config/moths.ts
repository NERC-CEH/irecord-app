import { groupsReverse as groups } from 'common/data/informalGroups';
import { mothStageAttr, Survey } from 'Survey/common/config';

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'moths',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.moth],

  occ: {
    attrs: {
      stage: {
        ...mothStageAttr,
        menuProps: { ...mothStageAttr.menuProps, required: false },
      },
    },
  },
};

export default survey;
