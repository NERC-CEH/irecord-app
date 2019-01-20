/** ****************************************************************************
 * Surveys List main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import CONFIG from 'config';
import DateHelp from 'helpers/date';
import template from './templates/main.tpl';

export default Marionette.View.extend({
  tagName: 'ul',
  className: 'table-view',
  template,

  events: {},

  triggers: {},

  serializeData() {
    const sample = this.model;
    const vc = sample.get('vice-county') || {};

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    return {
      site_url: CONFIG.site_url,
      id: sample.id,
      cid: sample.cid,
      isSynchronising: sample.remote.synchronising,
      onDatabase: sample.metadata.synced_on,
      location: locationPrint,
      locationName: location.name,
      date: DateHelp.print(sample.get('date'), true),
      'vice-county': vc.name,
      species: sample.samples.length,
      comment: sample.get('comment'),
      recorders: (sample.get('recorders') || []).length
    };
  }
});
