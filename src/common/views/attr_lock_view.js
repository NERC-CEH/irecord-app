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
    const occ = sample.getOccurrence();
    let attr = this.options.attr;

    let value;

    switch (this.options.attr) {
      case 'date':
      case 'location':
        // sample
        value = sample.get(this.options.attr);
        break;
      case 'number':
        value = occ.get(attr);
        if (!appModel.isAttrLocked(attr, value)) {
          attr = 'number-ranges';
          value = occ.get(attr);
        }
        break;
      default:
        // occurrence
        value = occ.get(this.options.attr);
    }

    let locked = false;
    // check if the same value has been locked
    locked = appModel.isAttrLocked(attr, value);

    return {
      locked,
    };
  },
});
