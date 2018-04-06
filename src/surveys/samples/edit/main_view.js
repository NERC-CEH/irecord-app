/** ****************************************************************************
 * Surveys Sample Edit main view.
 **************************************************************************** */
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
    'click a#location-button': 'location:update',
  },

  events: {
    'toggle #sensitive-btn': 'onSettingToggled',
    'click #sensitive-btn': 'onSettingToggled',
  },

  initialize() {
    const sample = this.model.get('sample');
    this.listenTo(
      sample,
      'request:remote error:remote geolocation',
      this.render
    );
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

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    let number = StringHelp.limit(occ.get('number'));
    if (!number) {
      number = StringHelp.limit(occ.get('number-ranges'));
    }

    // show activity title.
    const activity = sample.get('activity');

    return {
      surveySampleID: sample.parent.cid,
      id: sample.cid,
      scientificName,
      commonName,
      sensitive: occ.metadata.sensitivity_precision,
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      location: locationPrint,
      locationName: location.name,
      locationEditAllowed: this.options.locationEditAllowed,
      date: DateHelp.print(sample.get('date'), true),
      number,
      abundance: StringHelp.limit(occ.get('abundance')),
      status: StringHelp.limit(occ.get('status')),
      stage: StringHelp.limit(occ.get('stage')),
      identifiers: StringHelp.limit(occ.get('identifiers')),
      comment: StringHelp.limit(occ.get('comment')),
      activity_title: activity ? activity.title : null,
      activity,
    };
  },

  getValues() {
    return this.$el.find('');
  },
});
