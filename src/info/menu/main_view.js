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

  serializeData() {
    return {
      login: this.model.hasLogIn(),
      firstname: this.model.get('firstname'),
      secondname: this.model.get('secondname'),
    };
  },

  logout() {
    this.trigger('user:logout');
  },
});
