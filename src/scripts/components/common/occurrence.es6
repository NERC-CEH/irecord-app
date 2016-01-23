define([
  'morel',
  'app-config'
], function (Morel, CONFIG) {
  $.extend(true, Morel.Occurrence.keys, CONFIG.morel.occurrence);

  let Occurrence = Morel.Occurrence.extend({
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

  return Occurrence;
});