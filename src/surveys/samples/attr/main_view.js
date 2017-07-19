/** ****************************************************************************
 * Surveys Sample Attr main view.
 *****************************************************************************/
import _ from 'lodash';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import RadioInputView from 'common/views/radioInputView';
import InputView from 'common/views/inputView';
import TextareaView from 'common/views/textareaInputView';
import CONFIG from 'config';

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
    const surveyConfig = CONFIG.indicia.surveys.plant;
    let attrView;
    switch (this.options.attr) {
      case 'abundance':
        attrView = new InputView({
          label: 'Abundance (DAFOR, LA, LF or count).',
          default: occ.get(this.options.attr),
          validate(value) {
            const re = /^(\d+|[DAFOR]|LA|LF)$/;
            return re.test(value);
          },
        });
        break;
      case 'identifiers':
        attrView = new InputView({
          config: surveyConfig.occurrence.identifiers,
          default: occ.get('identifiers'),
        });
        break;

      case 'status':
        attrView = new RadioInputView({
          config: surveyConfig.occurrence.status,
          default: occ.get('status'),
        });
        break;

      case 'stage':
        attrView = new RadioInputView({
          config: surveyConfig.occurrence.stage,
          default: occ.get('stage'),
        });
        break;

      case 'comment':
        attrView = new TextareaView({
          config: surveyConfig.occurrence.comment,
          default: occ.get('comment'),
        });
        break;

      default:
        Log('Surveys:Attr:MainView: no such attribute to show!', 'e');
    }

    return attrView;
  },

  /**
   * Returns the attribute value extracted from the attribute view.
   * @returns {{}}
   */
  getValues() {
    const values = {};
    values[this.options.attr] = this.attrView.getValues();

    return values;
  },
});
