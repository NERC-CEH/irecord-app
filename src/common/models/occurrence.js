import Indicia from 'indicia';
import { observable } from 'mobx';
import ImageModel from './image';

export default Indicia.Occurrence.extend({
  Media: ImageModel,

  initialize() {
    this.attributes = observable(this.attributes);
    this.metadata = observable(this.metadata);
    this.media.models = observable(this.media.models);
  },

  // warehouse attribute keys
  keys() {
    return this.parent.getSurvey().attrs.occ;
  },

  /**
   * Disable sort for mobx to keep the same refs.
   * @param mediaObj
   */
  addMedia(mediaObj) {
    if (!mediaObj) return;
    mediaObj.setParent(this);
    this.media.add(mediaObj, { sort: false });
  },

  getSurvey() {
    if (!this.parent) {
      throw new Error('No parent exists to get survey');
    }

    return this.parent.getSurvey();
  },
});
