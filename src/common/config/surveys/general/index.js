import defaultSurvey from './default';
import dragonfliesSurvey from './dragonflies';
import bryophytesSurvey from './bryophytes';

export const coreAttributes = [
  'smp:location',
  'smp:locationName',
  'smp:date',
  'occ:comment',
];

export default {
  [defaultSurvey.name]: defaultSurvey,
  [dragonfliesSurvey.name]: dragonfliesSurvey,
  [bryophytesSurvey.name]: bryophytesSurvey,
};
