/** ****************************************************************************
 * Settings Survey main view.
 **************************************************************************** */
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import LocHelp from 'helpers/location';
import JST from 'JST';

import './styles.scss';

export default Marionette.View.extend({
  id: 'survey-accuracy',

  template: JST['common/radio'],

  events: {
    'click input[type="radio"]': 'saveRadio',
  },

  saveRadio() {
    // unset slider val
    const $rangeOutput = this.$el.find('#rangeVal');
    $rangeOutput.val('');
    this.trigger('save');
  },

  getValues() {
    let value;

    const $inputs = this.$el.find('input');
    $inputs.each((int, elem) => {
      if ($(elem).prop('checked')) {
        const newVal = $(elem).val();
        // don't set default
        value = newVal;
      }
    });

    return value;
  },

  serializeData() {
    const templateData = {
      message: 'Please pick the life stage.',
      selection: Object.keys(LocHelp.gridref_accuracy).map(key => ({
        label: LocHelp.gridref_accuracy[key].label,
        value: key,
      })),
      selected: this.model.get('gridSquareUnit'),
    };

    return templateData;
  },
});
