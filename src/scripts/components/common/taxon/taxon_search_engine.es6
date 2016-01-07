/**
 * Generates UK species master list search suggestions.
 */
define([
  'log',
  'data/master_list'
], function (log) {
  const WAREHOUSE_ID = 0,
        TAXON_GROUP_ID = 1,
        TAXON_ID = 2,
        COMMON_NAME_ID = 3;
  const MAX = 20;

  let API = {
    search: function (searchPhrase) {
      var species = window['species_list'];
      let result = []; //search results

      let timeStart = new Date(); //track search time

      let foundArray = []; // placeholder of non-beginning matching species ids

      //reverse loop quicker than for
      let i = species.length;
      while (i > 0 && result.length < MAX) {
        i--;
        let sp = species[i];

        let string = (sp[TAXON_ID] + ' ' + sp[COMMON_NAME_ID]).toLowerCase();
        let foundIndex = string.indexOf(searchPhrase);
        let foundWithSpaceIndex = string.indexOf(' ' + searchPhrase) > 0;

        if (foundIndex === 0 || foundWithSpaceIndex) {
          //found as word start
          let specie = {
            warehouse_id: sp[WAREHOUSE_ID],
            taxon: sp[TAXON_ID],
            common_name: sp[COMMON_NAME_ID]
          };

          //prepend
          result.unshift(specie);
        } else if (foundIndex > 0) {
          //found in other places
          foundArray.push(i);
        }
      }

      if (result.length < MAX && foundArray.length) {
        let diff = MAX - result.length;
        for (i = 0; i < foundArray.length && diff > 0; i++, diff--) {
          let sp = species[foundArray[i]];
          let specie = {
            warehouse_id: sp[WAREHOUSE_ID],
            taxon: sp[TAXON_ID],
            common_name: sp[COMMON_NAME_ID]
          };
          result.push(specie);
        }
      }

      log('Search time: ' + (new Date() - timeStart) + 'ms', 'd');
      return result;
    }
  };

  return API;
});