import _ from 'lodash';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import Indicia from 'indicia';
import StringHelp from 'helpers/string';

function template(sample) {
  const survey = sample.getSurvey();
  if (survey.name === 'default') {
    return JST['samples/edit/general_attrs'];
  }

  let tpl = '';
  survey.editForm.forEach(element => {
    const elParts = element.split(':');
    const elAttrType = elParts[0];
    const elName = elParts[1];
    const el = survey.attrs[elAttrType][elName];
    const label =
      el.label || elName.slice(0, 1).toUpperCase() + elName.slice(1);
    const icon = el.icon || 'dot';
    tpl += `<li class="table-view-cell">
        <a href="#samples/${sample.cid}/edit/${elName}" id="${elName}-button"
           class="<%- obj.locks['${element}'] ? 'lock' : 'navigate-right' %>">
          <span class="media-object pull-left icon icon-${icon}"></span>
          <span class="media-object pull-right descript"><%- obj-${elName}%></span>
          ${label}
        </a>
      </li>`;
  });
  return _.template(tpl);
}

export default Marionette.View.extend({
  constructor(...args) {
    Marionette.View.prototype.constructor.apply(this, args);
    this.template = template(this.model.get('sample'));
  },

  tagName: 'ul',
  id: 'attrs',
  className: 'table-view inputs no-top',

  serializeData() {
    const sample = this.model.get('sample');
    const occ = sample.getOccurrence();
    const appModel = this.model.get('appModel');

    let numberLock = appModel.isAttrLocked('number', occ.get('number'));
    if (!numberLock) {
      numberLock = appModel.isAttrLocked(
        'number-ranges',
        occ.get('number-ranges')
      );
    }
    const attrLocks = {
      number: numberLock,
      stage: appModel.isAttrLocked('stage', occ.get('stage')),
      identifiers: appModel.isAttrLocked('identifiers', occ.get('identifiers')),
      comment: appModel.isAttrLocked('comment', occ.get('comment')),
      activity: appModel.isAttrLocked('activity', sample.get('group')),
    };

    let number = occ.get('number') && StringHelp.limit(occ.get('number'));
    if (!number) {
      number =
        occ.get('number-ranges') && StringHelp.limit(occ.get('number-ranges'));
    }

    // show activity title.
    const group = sample.get('group');

    return {
      id: sample.cid,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      number,
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      identifiers:
        occ.get('identifiers') && StringHelp.limit(occ.get('identifiers')),
      comment: occ.get('comment') && StringHelp.limit(occ.get('comment')),
      group_title: group ? group.title : null,
      group,
      locks: attrLocks,
    };
  },
});
