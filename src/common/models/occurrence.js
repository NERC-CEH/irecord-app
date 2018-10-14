import Indicia from 'indicia';
import { observable } from 'mobx';
import ImageModel from './image';

export default Indicia.Occurrence.extend({
  Media: ImageModel,

  initialize() {
    this.attributes = observable(this.attributes);
    this.metadata = observable(this.metadata);
  },

  // warehouse attribute keys
  keys() {
    return this.parent.getSurvey().attrs.occ;
  },

  getSurvey() {
    if (!this.parent) {
      throw new Error('No parent exists to get survey');
    }

    return this.parent.getSurvey();
  }
});
