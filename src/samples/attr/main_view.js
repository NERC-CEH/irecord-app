/** ****************************************************************************
 * Sample Attribute main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import _ from 'lodash';
import Log from 'helpers/log';
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

    const attrParts = this.options.attr.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];
    const attrConfig = surveyAttrs[attrType][attrName];

    const currentVal =
      attrType === 'smp' ? sample.get(attrName) : occ.get(attrName);

    let attrView;
    switch (this.options.attr) {
      case 'occ:number':
        attrView = new NumberAttrView({
          config: surveyAttrs.occ['number-ranges'],
          defaultNumber: currentVal,
          default: occ.get('number-ranges'),
        });
        break;

      default:
        attrView = this.attrViewFactory(attrConfig, currentVal);
        if (!attrView) {
          Log('Samples:AttrView: no such attribute to show!', 'e');
        }
    }

    return attrView;
  },

  attrViewFactory(attrConfig, currentVal) {
    let attrView;
    switch (attrConfig.type) {
      case 'date':
      case 'input':
        attrView = new InputView({
          config: attrConfig,
          default: currentVal,
        });
        break;

      case 'radio':
        attrView = new RadioInputView({
          config: attrConfig,
          default: currentVal,
        });
        break;

      case 'text':
        attrView = new TextareaView({
          config: attrConfig,
          default: currentVal,
        });
        break;

      default:
        Log('Samples:AttrView: no such attribute type was found!', 'e');
    }
    return attrView;
  },

  /**
   * Returns the attribute value extracted from the attribute view.
   * @returns {{}}
   */
  getValues() {
    const values = {};

    switch (this.options.attr) {
      case 'number':
        const [value, range] = this.attrView.getValues();
        values[this.options.attr] = value;
        values['number-ranges'] = range;
        break;
      default:
        values[this.options.attr] = this.attrView.getValues();
    }

    return values;
  },
});
