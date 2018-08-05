import $ from 'jquery';
import _ from 'lodash';
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import StringHelp from 'helpers/string';

function template(sample) {
  const survey = sample.getSurvey();

  // generate template
  let tpl = '';
  survey.editForm.forEach(element => {
    const attrParts = element.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];
    const attr = survey.attrs[attrType][attrName];
    const label =
      attr.label || attrName.slice(0, 1).toUpperCase() + attrName.slice(1);
    const icon = attr.icon || 'dot';

    if (attr.type === 'toggle') {
      tpl += `
          <ion-item>
            <ion-label><%= t("${label}") %></ion-label>
            <ion-toggle id="${attrName}-toggle" value="${element}" slot="end" <%- obj["${element}"] ? 'checked' : '' %>></ion-toggle>
            <span slot="start" class="media-object pull-left icon icon-${icon} toggle-icon"></span>
          </ion-item>
       `;
      return;
    }

    tpl += `<ion-item 
              href="#samples/${sample.cid}/edit/${element}" 
              id="${element}-button" detail detail-icon="<%- obj.locks['${element}'] ? 'lock' : 'ios-arrow-forward' %>">
          <span slot="start" class="media-object pull-left icon icon-${icon}"></span>
          <span slot="end" class="media-object pull-right descript"><%- t(obj['${element}'])%></span>
          <%= t("${label}") %>
      </ion-item>`;
  });

  return _.template(tpl);
}

export default Marionette.View.extend({
  constructor(...args) {
    Marionette.View.prototype.constructor.apply(this, args);
    this.template = template(this.model.get('sample'));
  },

  events: {
    'ionChange ion-toggle': 'onSettingToggled',
  },

  onSettingToggled(e) {
    const setting = $(e.currentTarget).prop('value');
    const active = $(e.currentTarget).prop('checked');

    this.trigger('attr:update', setting, active);
  },

  tagName: 'ion-list',
  id: 'attrs',
  className() {
    return `table-view inputs no-top ${
      this.options.activityExists ? 'withActivity' : ''
    }`;
  },

  serializeData() {
    const sample = this.model.get('sample');
    const occ = sample.getOccurrence();
    const appModel = this.model.get('appModel');

    // get attr locks
    const attrLocks = {
      number: appModel.isAttrLocked(occ, 'number'),
    };
    const survey = sample.getSurvey();
    survey.editForm.forEach(attr => {
      const splitAttrName = attr.split(':');
      const model = splitAttrName[0] === 'smp' ? sample : occ;
      attrLocks[attr] = appModel.isAttrLocked(model, splitAttrName[1]);
    });

    const serialized = {
      id: sample.cid,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      locks: attrLocks,
    };

    survey.editForm.forEach(element => {
      const attrParts = element.split(':');
      const attrType = attrParts[0];
      const attrName = attrParts[1];

      const model = attrType === 'smp' ? sample : occ;

      let currentVal;
      switch (element) {
        case 'occ:number':
          currentVal = StringHelp.limit(occ.get('number'));
          if (!currentVal) {
            currentVal = StringHelp.limit(occ.get('number-ranges'));
          }
          break;
        default:
          currentVal = StringHelp.limit(model.get(attrName));
      }

      serialized[element] = currentVal;
    });

    return serialized;
  },

  /**
   * Returns the attribute value extracted from the view.
   * @returns {{}}
   */
  getValues() {},
});
