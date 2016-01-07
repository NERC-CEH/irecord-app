/**
 * Generates UK species master list search suggestions.
 */
define([
  'log',
  'data/master_list'
], function (log) {
  let API = {
    search: function (searchPhrase) {
      let timeStart = new Date(); //track search time
      let results = [];

      let MAX = 20;

      var species = window['species_list'];
      for (var i = 0; i < species.length && results.length < MAX; i++) {
        var s = species[i][2].toLowerCase().indexOf(searchPhrase);
        var c = species[i][3].toLowerCase().indexOf(searchPhrase);
        if (s >= 0 || c >= 0) {
          let specie = {
            id: species[i][0],
            name: species[i][2]
          };

          results.push(specie);
        }
      }

      log('Search time: ' + (new Date() - timeStart) + 'ms', 'd');
      return results;
    }
  };

  return API;
});