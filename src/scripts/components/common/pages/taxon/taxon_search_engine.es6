/**
 * Generates UK species master list search suggestions.
 */
define([
  'log',
  'data/master_list'
], function (Log) {
  const WAREHOUSE_ID = 0,
        TAXON_GROUP_ID = 1,
        TAXON_ID = 2,
        COMMON_NAME_ID = 3;
  const MAX = 20;

  let API = {
    search: function (searchPhrase) {
      var species = window['species_list'];
      //search results
      let commonNameRes = [];
      let commonNameFirstWordRes = [];
      let scientificRes = [];
      let scientificFirstWordRes = [];

      let timeStart = new Date(); //track search time

      let foundArray = []; // placeholder of non-beginning matching species ids

      //reverse loop quicker than for
      let i = species.length;
      let re = new RegExp('\\b' + API._escapeRegExp(searchPhrase), "i");

      while (i > 0 && ((commonNameFirstWordRes.length + scientificFirstWordRes.length) < MAX ||
      (commonNameFirstWordRes.length + commonNameRes.length +
      scientificFirstWordRes.length + scientificRes.length ) < MAX)) {
        i--;
        let sp = species[i];

        let common, scientific;
        //skips the second bit if found in first
        if ((common = sp[COMMON_NAME_ID].match(re)) || (scientific = sp[TAXON_ID].match(re))) {
          //found as a first word in name
          let index = common ? sp[COMMON_NAME_ID].toLowerCase().indexOf(searchPhrase) :
            sp[TAXON_ID].toLowerCase().indexOf(searchPhrase);

          let specie = {
            warehouse_id: sp[WAREHOUSE_ID],
            taxon: sp[TAXON_ID],
            common_name: sp[COMMON_NAME_ID]
          };

          //save results
          if (common) {
            if (index === 0) {
              commonNameFirstWordRes.unshift(specie);
            } else {
              commonNameRes.unshift(specie);
            }
          } else {
            //scientific
            if (index === 0) {
              scientificFirstWordRes.unshift(specie);
            } else {
              scientificRes.unshift(specie);
            }
          }
        }
      }

      Log('Search time: ' + (new Date() - timeStart) + 'ms', 'd');

      //return results in the order
      return commonNameFirstWordRes.concat(scientificFirstWordRes, commonNameRes, scientificRes);
    },

    _escapeRegExp: function (string){
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };

  return API;
});