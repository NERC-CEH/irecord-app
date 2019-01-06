/** ****************************************************************************
 * App Model statistics functions.
 **************************************************************************** */
import Indicia from 'indicia';
import Log from 'helpers/log';
import CONFIG from 'config';
import { observable } from 'mobx';
import SpeciesSearchEngine from '../pages/taxon/search/taxon_search_engine';

export default {
  statisticsExtensionInit() {
    this.statistics = observable({ synchronizing: null });
    this.syncStats();
  },

  syncStats(force) {
    Log('UserModel:Statistics: synchronising.');

    if (this.statistics.synchronizing) {
      return this.statistics.synchronizing;
    }

    if ((this.hasLogIn() && this._lastStatsSyncExpired()) || force) {
      // init or refresh
      const statistics = this.get('statistics');

      this.statistics.synchronizing = this._fetchStatsSpecies()
        .then(stats =>
          this._processStatistics(stats).then(species => {
            const updatedStatistics = Object.assign({}, statistics, {
              synced_on: new Date().toString(),
              species,
              speciesRaw: stats,
            });
            this.set('statistics', updatedStatistics);
            this.save();

            this.statistics.synchronizing = false;
          })
        )
        .catch(err => {
          this.statistics.synchronizing = false;
          return Promise.reject(err);
        });
    }

    return this.statistics.synchronizing;
  },

  /**
   * Loads the list of available stats from the warehouse then updates the
   * collection in the main view.
   */
  _fetchStatsSpecies() {
    Log('UserModel:Statistics: fetching.');

    const report = new Indicia.Report({
      report: '/library/taxa/filterable_explore_list.xml',

      api_key: CONFIG.indicia.api_key,
      host_url: CONFIG.indicia.host,
      user: this.getUser.bind(this),
      password: this.getPassword.bind(this),
      params: {
        path: CONFIG.indicia.input_form,
        my_records: 1,
        limit: 10,
        orderby: 'count',
        sortdir: 'DESC',
      },
    });

    return report.run().then(receivedData => {
      const stats = receivedData.data;

      if (stats instanceof Array) {
        return stats;
      }

      if (!stats || !(stats.records instanceof Array)) {
        throw new Error('Error while retrieving stats response.');
      }

      return stats.records;
    });
  },

  _processStatistics(stats) {
    const species = [];
    const toWait = [];

    // try to find all species in the internal taxa database
    stats.forEach(stat => {
      const parsePromise = new Promise(fulfill => {
        const options = {
          maxResults: 1,
          scientificOnly: true,
        };

        // turn it to a full species descriptor from species data set
        SpeciesSearchEngine.search(stat.taxon, options).then(results => {
          const foundedSpecies = results[0];
          if (results.length && foundedSpecies.scientific_name === stat.taxon) {
            if (foundedSpecies.common_name) {
              foundedSpecies.found_in_name = 'common_name';
            }
            species.push(foundedSpecies);
          }
          fulfill();
        });
      });

      toWait.push(parsePromise);
    });

    // save the user and exit
    return Promise.all(toWait).then(() => species);
  },

  /**
   * Checks if the last sync was done too long ago.
   * @returns {boolean}
   * @private
   */
  _lastStatsSyncExpired() {
    const statistics = this.get('statistics');

    if (!statistics.synced_on) {
      return true;
    }

    const lastSync = new Date(statistics.synced_on);

    function daydiff(first, second) {
      return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    return daydiff(lastSync, new Date()) >= 1;
  },
};
