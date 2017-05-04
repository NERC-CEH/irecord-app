/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import CONFIG from 'config';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'ul',
  className: 'table-view',
  template: JST['surveys/show/main'],

  events: {},

  triggers: {},

  serializeData() {
    return {
      site_url: CONFIG.site_url,
      id: this.model.id,
    };
  },
});
