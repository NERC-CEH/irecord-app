/** ****************************************************************************
 * Surveys List header view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  id: 'surveys-header',
  tagName: 'nav',
  template: JST['surveys/list/header'],

  triggers: {
    'click #surveys-btn': 'surveys',
    'click #add-survey-btn': 'surveys:add',
  },
});

