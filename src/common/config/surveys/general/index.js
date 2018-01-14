import defaultSurvey from './default';
import dragonfliesSurvey from './dragonflies';

export const coreAttributes = [
  'smp:location',
  'smp:locationName',
  'smp:date',
  'occ:comment',
];

export default {
  [defaultSurvey.name]: defaultSurvey,
  [dragonfliesSurvey.id]: dragonfliesSurvey,
};
