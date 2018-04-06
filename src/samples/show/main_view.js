/** ****************************************************************************
 * Sample Show main view.
 **************************************************************************** */
import Indicia from 'indicia';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import CONFIG from 'config';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import Gallery from '../../common/gallery';
import './styles.scss';

export default Marionette.View.extend({
  template: JST['samples/show/main'],

  events: {
    'click img': 'photoView',
    'click #resend-btn': 'resend',
  },

  photoView(e) {
    e.preventDefault();

    const items = [];
    const sample = this.model.get('sample');
    sample.getOccurrence().media.each(image => {
      items.push({
        src: image.getURL(),
        w: image.get('width') || 800,
        h: image.get('height') || 800,
      });
    });

    // Initializes and opens PhotoSwipe
    const gallery = new Gallery(items);
    gallery.init();
  },

  serializeData() {
    const sample = this.model.get('sample');
    const appModel = this.model.get('appModel');
    const occ = sample.getOccurrence();
    const specie = occ.get('taxon');

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const syncStatus = sample.getSyncStatus();

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    let number = StringHelp.limit(occ.get('number'));
    if (!number) {
      number = StringHelp.limit(occ.get('number-ranges'));
    }

    // show activity title.
    const activity = sample.get('activity');

    return {
      id: occ.id,
      cid: occ.cid,
      useExperiments: appModel.get('useExperiments'),
      site_url: CONFIG.site_url,
      isSynchronising: syncStatus === Indicia.SYNCHRONISING,
      onDatabase: syncStatus === Indicia.SYNCED,
      scientific_name: scientificName,
      commonName,
      location: locationPrint,
      locationName: location.name,
      date: DateHelp.print(sample.get('date'), true),
      number,
      stage: StringHelp.limit(occ.get('stage')),
      identifiers: occ.get('identifiers'),
      comment: occ.get('comment'),
      activity_title: activity ? activity.title : null,
      media: occ.media,
    };
  },

  /**
   * Force resend the record.
   *
   * Wipes its server values and makes it local again. Resubmitting should
   * generate a server conflict and the record should update with the same values
   * if exists already. Otherwise, a new record will be created on the server.
   */
  resend() {
    // reset the values
    const sample = this.model.get('sample');
    sample.id = null;
    sample.metadata.server_on = null;
    sample.metadata.updated_on = null;
    sample.metadata.synced_on = null;

    sample.save(null, { remote: true });

    window.history.back();
  },
});
