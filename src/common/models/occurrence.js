import _ from 'lodash';
import Indicia from 'indicia';
import CONFIG from 'config';
import ImageModel from './image';

export default Indicia.Occurrence.extend({
  Media: ImageModel,

  // warehouse attribute keys
  keys() {
    if (this.parent.metadata.complex_survey) {
      // todo refactor this
      return _.extend(
        {},
        CONFIG.indicia.surveys.general.occurrence, // general keys
        CONFIG.indicia.surveys.plant.occurrence // plant specific keys
      );
    }
    return this.parent.getSurvey().attrs.occ;
  },
});
