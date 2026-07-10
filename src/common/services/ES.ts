import { Survey } from 'Survey/common/config';
import getSurveyConfigs from 'Survey/common/surveyConfigs';

export const getSurveyQuery = ({ id }: Survey) => ({
  match: {
    'metadata.survey.id': id,
  },
});

export const matchAppSurveys = {
  bool: {
    should: Object.values(getSurveyConfigs()).map(getSurveyQuery),
  },
};
