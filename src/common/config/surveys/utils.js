import _ from 'lodash';
import complexSurvey from './complex';
import defaultSurvey from './default';
import taxonGroupSurveys from './taxon-groups';

export default function getSurvey(taxonGroup, complex) {
  if (complex) {
    // backwards compatibility
    const complexSurveyConfig =
      complex === true ? complexSurvey.plant : complexSurvey[complex];

    return { ...complexSurveyConfig };
  }

  if (!taxonGroup) {
    return { ...defaultSurvey };
  }

  let matchedSurvey = {};
  Object.keys(taxonGroupSurveys).forEach(surveyKey => {
    const survey = taxonGroupSurveys[surveyKey];
    if (survey.taxonGroups.includes(taxonGroup)) {
      matchedSurvey = survey;
    }
  });

  function skipAttributes(__, srcValue) {
    if (_.isObject(srcValue) && srcValue.id) {
      return srcValue;
    }
    return undefined;
  }

  const mergedDefaultSurvey = _.mergeWith(
    {},
    defaultSurvey,
    matchedSurvey,
    skipAttributes
  );

  return mergedDefaultSurvey;
}
