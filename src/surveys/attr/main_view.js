/** ****************************************************************************
 * Surveys List main view.
 **************************************************************************** */
import _ from 'lodash';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import InputView from 'common/views/inputView';
import TextareaView from 'common/views/textareaInputView';
import viceCounties from 'vice_counties.data';
import RecordersAttrView from './recordersAttrView';

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
      case 'recorders':
        attrView = new RecordersAttrView({
          config: surveyAttrs.smp.recorders,
          default: sample.get('recorders') || [],
        });
        break;

      case 'vice-county':
        const codes = [];
        const names = viceCounties.map(a => {
          codes.push(a.code);
          return a.name;
        });
        const typeahead = names.concat(codes);

        const value = sample.get('vice-county') || {};

        attrView = new InputView({
          config: surveyAttrs.smp['vice-county'],
          typeahead,
          default: value.name,
        });
        break;

      case 'comment':
        attrView = new TextareaView({
          config: surveyAttrs.smp.comment,
          default: sample.get('comment'),
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
