import Indicia from 'indicia';
import ImageModel from './image';

export default Indicia.Occurrence.extend({
  Media: ImageModel,

  // warehouse attribute keys
  keys() {
    return this.parent.getSurvey().attrs.occ;
  },

  getSurvey() {
    if (!this.parent) {
      throw new Error('No parent exists to get survey');
    }

    return this.parent.getSurvey();
  },
});
