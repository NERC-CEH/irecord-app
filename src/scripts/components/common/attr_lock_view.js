import Marionette from 'marionette';
import JST from '../../JST';

export default Marionette.ItemView.extend({
  template: JST['records/attr/lock'],

  initialize() {
    this.onLockClick = this.options.onLockClick;
    const appModel = this.model.get('appModel');
    this.listenTo(appModel, 'change:attrLocks', this.render);
  },

  triggers: {
    'click #lock-btn': 'lock:click',
  },

  serializeData() {
    const appModel = this.model.get('appModel');
    const recordModel = this.model.get('recordModel');
    const occ = recordModel.occurrences.at(0);

    let value;

    switch (this.options.attr) {
      case 'date':
      case 'location':
        // sample
        value = recordModel.get(this.options.attr);
        break;
      default:
        // occurrence
        value = occ.get(this.options.attr);
    }

    let locked = false;
    // check if the same value has been locked
    locked = appModel.isAttrLocked(this.options.attr, value);


    return {
      locked,
    };
  },
});
