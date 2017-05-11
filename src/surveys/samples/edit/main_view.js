/** ****************************************************************************
 * Surveys Sample Edit main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import $ from 'jquery';
import Indicia from 'indicia';
import JST from 'JST';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import StringHelp from 'helpers/string';

import './styles.scss';

export default Marionette.View.extend({
  template: JST['surveys/samples/edit/main'],

  triggers: {
    'click a#species-button': 'taxon:update',
  },

  events: {
    'toggle #sensitive-btn': 'onSettingToggled',
    'click #sensitive-btn': 'onSettingToggled',
  },

  initialize() {
    const sample = this.model.get('sample');
    this.listenTo(sample, 'request error geolocation', this.render);
  },

  onSettingToggled(e) {
    const setting = $(e.currentTarget).data('setting');
    let active = $(e.currentTarget).hasClass('active');

    if (e.type !== 'toggle' && !Device.isMobile()) {
      // Device.isMobile() android generates both swipe and click

      active = !active; // invert because it takes time to get the class
      $(e.currentTarget).toggleClass('active', active);
    }

    this.trigger('setting:toggled', setting, active);
  },

  serializeData() {
    const sample = this.model.get('sample');
    const occ = sample.getOccurrence();
    const specie = occ.get('taxon') || {};
    const appModel = this.model.get('appModel');

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    let numberLock = appModel.isAttrLocked('number', occ.get('number'), 'general');
    if (!numberLock) {
      numberLock = appModel.isAttrLocked('number-ranges', occ.get('number-ranges'));
    }

    const attrLocks = {
      date: appModel.isAttrLocked('date', sample.get('date'), 'general'),
      location: appModel.isAttrLocked('location', sample.get('location'), 'general'),
      number: numberLock,
      sensitive: occ.metadata.sensitive,
      abundance: appModel.isAttrLocked('abundance', occ.get('abundance'), 'general'),
      stage: appModel.isAttrLocked('stage', occ.get('stage'), 'general'),
      status: appModel.isAttrLocked('status', occ.get('status'), 'general'),
      identifiers: appModel.isAttrLocked('identifiers', occ.get('identifiers'), 'general'),
      comment: appModel.isAttrLocked('comment', occ.get('comment'), 'general'),
      activity: appModel.isAttrLocked('activity', sample.get('group'), 'general'),
    };

    let number = occ.get('number') && StringHelp.limit(occ.get('number'));
    if (!number) {
      number = occ.get('number-ranges') && StringHelp.limit(occ.get('number-ranges'));
    }

    // show activity title.
    const group = sample.get('group');

    return {
      surveySampleID: sample.parent.cid,
      id: sample.cid,
      scientificName,
      commonName,
      training: occ.metadata.training,
      sensitive: occ.metadata.sensitive,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      location: locationPrint,
      location_name: location.name,
      locationEditAllowed: this.options.locationEditAllowed,
      date: DateHelp.print(sample.get('date'), true),
      number,
      abundance: occ.get('abundance') && StringHelp.limit(occ.get('abundance')),
      status: occ.get('status') && StringHelp.limit(occ.get('status')),
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      identifiers: occ.get('identifiers') && StringHelp.limit(occ.get('identifiers')),
      comment: occ.get('comment') && StringHelp.limit(occ.get('comment')),
      group_title: group ? group.title : null,
      group,
      locks: attrLocks,
    };
  },

  getValues() {
    return this.$el.find('');
  },
});
