import defaultSurvey from './default';
import plantSurvey from './plant';
import mothSurvey from './moth';

export default {
  [defaultSurvey.name]: defaultSurvey,
  [plantSurvey.name]: plantSurvey,
  [mothSurvey.name]: mothSurvey,
};
