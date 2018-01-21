import $ from 'jquery';
import _ from 'lodash';
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import StringHelp from 'helpers/string';
import Device from 'helpers/device';

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
      tpl += `<li class="table-view-cell">
          <a>
            ${label}
            <span class="media-object pull-left icon icon-${icon} toggle-icon"></span>
            <div id="${attrName}-toggle" data-setting="${element}"
                 class="toggle no-yes <%- obj["${element}"] ? 'active' : '' %>">
              <div class="toggle-handle"></div>
            </div>
          </a>
        </li>`;
      return;
    }

    tpl += `<li class="table-view-cell">
        <a href="#samples/${sample.cid}/edit/${element}" id="${element}-button"
           class="<%- obj.locks['${element}'] ? 'lock' : 'navigate-right' %>">
          <span class="media-object pull-left icon icon-${icon}"></span>
          <span class="media-object pull-right descript"><%- obj['${element}']%></span>
          ${label}
        </a>
      </li>`;
  });

  // add groups support
  if (survey.name === 'default') {
    tpl += `
      <% if (obj.group_title) { %>
      <li class="table-view-cell">
        <a href="#samples/<%- obj.id %>/edit/smp:activity" id="activity-button"
           class="<%- obj.locks['activity'] ? 'lock' : 'navigate-right' %>">
          <span class="media-object pull-left icon icon-users"></span>
          <span class="media-object pull-right descript"><%- obj['smp:group_title'] %></span>
          Activity
        </a>
      </li>
      <% } %>`;
  }

  return _.template(tpl);
}

export default Marionette.View.extend({
  constructor(...args) {
    Marionette.View.prototype.constructor.apply(this, args);
    this.template = template(this.model.get('sample'));
  },

  events: {
    'toggle .toggle': 'onSettingToggled',
    'click .toggle': 'onSettingToggled',
  },

  onSettingToggled(e) {
    const setting = $(e.currentTarget).data('setting');
    let active = $(e.currentTarget).hasClass('active');

    if (e.type !== 'toggle' && !Device.isMobile()) {
      // Device.isMobile() android generates both swipe and click

      active = !active; // invert because it takes time to get the class
      $(e.currentTarget).toggleClass('active', active);
    }

    this.trigger('attr:update', setting, active);
  },

  tagName: 'ul',
  id: 'attrs',
  className: 'table-view inputs no-top',

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

    // show activity title.
    const group = sample.get('group');

    const serialized = {
      id: sample.cid,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      group_title: group ? group.title : null,
      group,
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
  getValues() {

  }
});
