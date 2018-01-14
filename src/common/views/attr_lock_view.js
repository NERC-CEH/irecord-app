import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import JST from 'JST';

export default Marionette.View.extend({
  template: JST['common/lock'],

  initialize() {
    Log('AttrLock:View: initializing.');
    this.onLockClick = this.options.onLockClick;
    const appModel = this.model.get('appModel');
    this.listenTo(appModel, 'change:attrLocks', this.render);
  },

  triggers: {
    'click #lock-btn': 'lock:click',
  },

  serializeData() {
    const appModel = this.model.get('appModel');
    const sample = this.model.get('sample');
    const attr = this.options.attr;
    const attrName = attr.split(':')[1];

    let locked = false;

    if (sample.metadata.complex_survey) {
      locked = appModel.isAttrLocked(sample, attrName);
      return null;
    }
    const occ = sample.getOccurrence();
    const model = attr.split(':')[0] === 'smp' ? sample : occ;
    locked = appModel.isAttrLocked(model, attrName);

    return {
      locked,
    };
  },
});
