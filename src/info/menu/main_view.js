/** ****************************************************************************
 * Info Menu main view.
 *****************************************************************************/

import Marionette from 'backbone.marionette';
import JST from 'JST';
import './styles.scss';

export default Marionette.View.extend({
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
