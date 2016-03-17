import $ from 'jquery';
import Morel from 'morel';
import CONFIG from 'config'; // Replaced with alias

$.extend(true, Morel.Occurrence.keys, CONFIG.morel.occurrence);

export default Morel.Occurrence.extend({
  validate: function() {
    let invalids = [];

    //species
    let taxon = this.get('taxon');
    if (!taxon || (!taxon.warehouse_id)) {
      invalids.push({
        sample: true,
        name: 'species',
        message: 'missing'
      });
    }

    return invalids.length ? invalids : null;
  }
});
