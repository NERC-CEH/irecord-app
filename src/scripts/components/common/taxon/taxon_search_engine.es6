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
      let timeStart = new Date(); //track search time
      let resHead = []; //results from beginning of strings
      let resAny = []; //results from any other parts of strings

      var species = window['species_list'];

      //1. search beginning of strings
      let i = species.length;

      //reverse loop quicker than for
      while (i > 0 && resHead.length < MAX) {
        i--;

        let taxonArray = species[i][TAXON_ID].split(' ');
        let commonNameArray = species[i][COMMON_NAME_ID].split(' ');
        let taxon_pos = API._searchArray(taxonArray, searchPhrase);
        let common_name_pos = API._searchArray(commonNameArray, searchPhrase);

        if (taxon_pos || common_name_pos) {
          let specie = {
            warehouse_id: species[i][WAREHOUSE_ID],
            taxon: species[i][TAXON_ID],
            common_name: species[i][COMMON_NAME_ID]
          };

          //prepend
          resHead.unshift(specie);
        }
      }
      log('-------\n' + (new Date() - timeStart) + 'ms', 'd');


      //2. search any part of string
      i = species.length;
      while (i > 0 && (resHead.length + resAny.length) < MAX) {
        i--;

        let taxon_pos = species[i][TAXON_ID].toLowerCase().indexOf(searchPhrase);
        let common_name_pos = species[i][COMMON_NAME_ID].toLowerCase().indexOf(searchPhrase);

        if (taxon_pos >= 0 || common_name_pos >=0 ){
          let specie = {
            warehouse_id: species[i][WAREHOUSE_ID],
            taxon: species[i][TAXON_ID],
            common_name: species[i][COMMON_NAME_ID]
          };

          //check if it hasn't been added
          let exists = false;
          _.each(resHead, function (savedSpecie) {
            exists = savedSpecie.warehouse_id === specie.warehouse_id;
          });

          if (!exists) {
            //prepend
            resAny.unshift(specie);
          }
        }
      }

      log('Search time: ' + (new Date() - timeStart) + 'ms', 'd');
      return resHead.concat(resAny);
    },


    _searchArray: function (wordsArray, searchPhrase) {
      for (var i= 0; i < wordsArray.length; i++) {
        let index = wordsArray[i].toLowerCase().indexOf(searchPhrase);
        if (index === 0) {
          //found in the beginning of name
          return true;
        }
      }
    }
  };

  return API;
});