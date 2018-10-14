import _ from 'lodash';
import complexSurvey from './complex';
import generalSurveys from './general/index';

export default class Survey {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.complex = config.complex;
    this.attrs = config.attrs;
    this.taxonGroups = config.taxonGroups;
    this.editForm = config.editForm;
    this.webForm = config.webForm;
    this.verify = config.verify;
  }

  static factory(taxonGroup, complex) {
    if (complex) {
      return new Survey(complexSurvey.default);
    }

    if (!taxonGroup) {
      return new Survey(generalSurveys.default);
    }

    let matchedSurvey = {};
    Object.keys(generalSurveys).forEach(surveyKey => {
      const survey = generalSurveys[surveyKey];
      if (survey.taxonGroups.includes(taxonGroup)) {
        matchedSurvey = survey;
      }
    });

    function skipAttributes(objValue, srcValue) {
      if (_.isObject(srcValue) && srcValue.id) {
        return srcValue;
      }
      return undefined;
    }

    const mergedGeneralSurvey = _.merge(
      {},
      generalSurveys.default,
      matchedSurvey,
      skipAttributes
    );
    return new Survey(mergedGeneralSurvey);
  }
}
