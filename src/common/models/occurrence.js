import Indicia from 'indicia';
import CONFIG from 'config';
import ImageModel from './image';

export default Indicia.Occurrence.extend({
  Image: ImageModel,

  // warehouse attribute keys
  keys() {
    if (this.parent.metadata.survey === 'plant') {
      return _.extend(
        {},
        CONFIG.indicia.occurrence, // general keys
        CONFIG.indicia.surveys.plant.occurrence // plant specific keys
      );
    }
    return CONFIG.indicia.occurrence;
  },

});
