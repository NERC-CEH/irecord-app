/** ****************************************************************************
 * Sample Attribute main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import _ from 'lodash';
import Log from 'helpers/log';
import CONFIG from 'config';
import InputView from 'common/views/inputView';
import RadioInputView from 'common/views/radioInputView';
import TextareaView from 'common/views/textareaInputView';
import NumberAttrView from './numberAttrView';

export default Marionette.View.extend({
  template: _.template('<div id="attribute"></div>'),
  regions: {
    attribute: {
      el: '#attribute',
      replaceElement: true,
    },
  },

  onRender() {
    const attrView = this._getAttrView();

    attrView.on('save', () => this.trigger('save'));

    const mainRegion = this.getRegion('attribute');
    mainRegion.show(attrView);
    this.attrView = attrView;
  },

  /**
   * Selects and initializes the attribute view.
   * @returns {*}
   * @private
   */
  _getAttrView() {
    const sample = this.model;
    const occ = sample.getOccurrence();

    const surveyAttrs = sample.getSurvey().attrs;

    let attrView;
    switch (this.options.attr) {
      case 'date':
        attrView = new InputView({
          default: sample.get('date'),
          type: 'date',
          max: new Date(),
        });
        break;
      case 'number':
        attrView = new NumberAttrView({
          config: surveyAttrs.occ['number-ranges'],
          defaultNumber: occ.get('number'),
          default: occ.get('number-ranges'),
        });
        break;

      case 'stage':
        attrView = new RadioInputView({
          config: surveyAttrs.occ.stage,
          default: occ.get('stage'),
        });
        break;

      case 'comment':
        attrView = new TextareaView({
          config: surveyAttrs.smp.comment,
          default: occ.get('comment'),
        });
        break;

      case 'identifiers':
        attrView = new InputView({
          config: surveyAttrs.occ.identifiers,
          default: occ.get('identifiers'),
        });
        break;

      case 'activity':
        attrView = new InputView({
          default: sample.get('date'),
          type: 'date',
          max: new Date(),
        });
        break;

      default:
        Log('Samples:AttrView: no such attribute to show!', 'e');
    }

    return attrView;
  },

  /**
   * Returns the attribute value extracted from the attribute view.
   * @returns {{}}
   */
  getValues() {
    const values = {};

    if (this.options.attr === 'number') {
      const [value, range] = this.attrView.getValues();
      values[this.options.attr] = value;
      values['number-ranges'] = range;
      return values;
    }

    values[this.options.attr] = this.attrView.getValues();

    return values;
  },
});
