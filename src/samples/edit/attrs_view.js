import Marionette from 'backbone.marionette';
import JST from 'JST';
import Indicia from 'indicia';
import StringHelp from 'helpers/string';

export default Marionette.View.extend({
  template: JST['samples/edit/general_attrs'],
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
