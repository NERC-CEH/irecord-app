/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'ul',
  className: 'table-view',
  template: JST['surveys/edit/main'],

  events: {},

  triggers: {},

  serializeData() {},
});
