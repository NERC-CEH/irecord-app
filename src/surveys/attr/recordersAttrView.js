/** ****************************************************************************
 * Surveys List main view.
 *****************************************************************************/
import $ from 'jquery';
import StringHelp from 'helpers/string';
import JST from 'JST';
import InputView from 'common/views/inputView';

export default InputView.extend({
  template: JST['surveys/attr/recorders'],

  events: {
    'click button.add-new': 'addNew',
  },

  addNew() {
    $('<input type="text"/>').insertAfter(this.$el.find('button'));
  },

  getValues() {
    const values = [];
    const $inputs = this.$el.find('input');
    $inputs.each((index, input) => {
      const val = input.value;
      if (val) {
        values.unshift(StringHelp.escape(val));
      }
    });

    return values;
  },
});
