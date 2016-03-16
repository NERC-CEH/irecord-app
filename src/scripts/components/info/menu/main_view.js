import Marionette from '../../../../vendor/marionette/js/backbone.marionette';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  tagName: 'ul',
  className: 'table-view buttons',

  template: JST['info/menu/main'],

  events: {
    'click #logout-button': 'logout'
  },

  modelEvents: {
    'change': 'render'
  },

  serializeDate: function () {
    return {
      surname: this.model.get('surname')
    }
  },

  logout: function () {
    this.trigger('user:logout');
  }
});
