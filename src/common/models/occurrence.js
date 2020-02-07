import Indicia from '@indicia-js/core';
import _ from 'lodash';
import { observable, observe, toJS } from 'mobx';
import Media from './image';

export default class Occurrence extends Indicia.Occurrence {
  constructor(...args) {
    super(...args);

    this.attrs = observable(this.attrs);
    this.metadata = observable(this.metadata);
    this.media = observable(this.media);

    const onAddedSetParent = change => {
      if (change.addedCount) {
        const model = change.added[0];
        model.parent = this;
      }
    };

    observe(this.media, onAddedSetParent);
  }

  static fromJSON(json) {
    return super.fromJSON(json, Media);
  }

  async save() {
    if (!this.parent) {
      return Promise.reject(
        new Error('Trying to save locally without a parent')
      );
    }

    return this.parent.save();
  }

  async destroy(silent) {
    if (!this.parent) {
      return Promise.reject(
        new Error('Trying to destroy locally without a parent')
      );
    }

    this.parent.occurrences.remove(this);
    await Promise.all(this.media.map(media => media.destroy(true)));

    if (silent) {
      return null;
    }

    return this.parent.save();
  }

  toJSON() {
    return toJS(super.toJSON(), { recurseEverything: true });
  }

  // warehouse attribute keys
  keys = () => {
    if (!this.parent) {
      throw new Error('No parent exists to get keys');
    }

    return { ...Indicia.Occurrence.keys, ...this.parent.getSurvey().occ.attrs };
  };

  getSurvey() {
    if (!this.parent) {
      throw new Error('No parent exists to get survey');
    }

    const survey = this.parent.getSurvey();
    return survey.occ;
  }

  validateRemote() {
    const survey = this.getSurvey();
    const invalidAttributes = survey.verify && survey.verify(this.attrs);
    const attributes = { ...invalidAttributes };

    const validateSubModel = (agg, model) => {
      const invalids = model.validateRemote();
      if (invalids) {
        agg[model.cid] = invalids;
      }
      return agg;
    };

    const media = this.media.reduce(validateSubModel, {});

    if (!_.isEmpty(attributes) || !_.isEmpty(media)) {
      return { attributes, media };
    }

    return null;
  }
}
