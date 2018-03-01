import defaultSurvey from './default';
import dragonfliesSurvey from './dragonflies';
import bryophytesSurvey from './bryophytes';

/**
 * All attributes that can be transferred from one general survey to another.
 */
export const coreAttributes = [
  'smp:location',
  'smp:locationName',
  'smp:location_type',
  'smp:date',
  'occ:comment',
];

export default {
  [defaultSurvey.name]: defaultSurvey,
  [dragonfliesSurvey.name]: dragonfliesSurvey,
  [bryophytesSurvey.name]: bryophytesSurvey,
};
