/** ****************************************************************************
 * Record Show main view.
 *****************************************************************************/
import Morel from 'morel';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import CONFIG from 'config';
import { DateHelp, StringHelp } from 'helpers';
import Gallery from '../../common/gallery';
import './styles.scss';

export default Marionette.View.extend({
  template: JST['records/show/main'],

  events: {
    'click img': 'photoView',
  },

  photoView(e) {
    e.preventDefault();

    const items = [];
    const recordModel = this.model.get('recordModel');
    recordModel.getOccurrence().media.each((image) => {
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
    const recordModel = this.model.get('recordModel');
    const occ = recordModel.getOccurrence();
    const specie = occ.get('taxon');

    // taxon
    const scientificName = specie.scientific_name;
    const commonName = specie.common_name;

    const syncStatus = recordModel.getSyncStatus();

    const locationPrint = recordModel.printLocation();
    const location = recordModel.get('location') || {};

    let number = occ.get('number') && StringHelp.limit(occ.get('number'));
    if (!number) {
      number = occ.get('number-ranges') && StringHelp.limit(occ.get('number-ranges'));
    }


    // show activity title.
    const group = recordModel.get('group');

    return {
      id: occ.id,
      cid: occ.cid,
      irecord_url: CONFIG.irecord_url,
      isSynchronising: syncStatus === Morel.SYNCHRONISING,
      onDatabase: syncStatus === Morel.SYNCED,
      scientific_name: scientificName,
      commonName,
      location: locationPrint,
      location_name: location.name,
      date: DateHelp.print(recordModel.get('date')),
      number,
      stage: occ.get('stage') && StringHelp.limit(occ.get('stage')),
      identifiers: occ.get('identifiers'),
      comment: occ.get('comment'),
      group_title: group ? group.title : null,
      media: occ.media,
    };
  },
});

