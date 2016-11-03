/** ****************************************************************************
 * Info Menu main view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from 'JST';

export default Marionette.ItemView.extend({
  tagName: 'ul',
  className: 'table-view buttons',

  template: JST['info/menu/main'],

  events: {
    'click #logout-button': 'logout',
  },

  modelEvents: {
    change: 'render',
  },

  serializeDate() {
    let surname;

    if (userModel.hasLogIn()) {
      surname = userModel.get('surname');
    }
    return {
      surname,
    };
  },

  logout() {
    this.trigger('user:logout');
  },
});
