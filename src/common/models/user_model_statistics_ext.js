/** ****************************************************************************
 * App Model statistics functions.
 *****************************************************************************/
import Indicia from 'indicia';
import Log from 'helpers/log';
import SpeciesSearchEngine from '../pages/taxon/search/taxon_search_engine';
import CONFIG from 'config';

export default {
  syncStats(force) {
    const that = this;
    if (this.synchronizingStatistics) {
      return;
    }

    if (this.hasLogIn() && this._lastStatsSyncExpired() || force) {
      // init or refresh
      this.synchronizingStatistics = true;
      this.trigger('sync:statistics:species:start');

      this.fetchStatsSpecies()
        .then(() => {
          that.synchronizingStatistics = false;
          that.trigger('sync:statistics:species:end');
        })
        .catch(() => {
          // todo
          that.synchronizingStatistics = false;
          that.trigger('sync:statistics:species:end');
        });
    }
  },

  resetStats() {
    Log('UserModel: resetting statistics');
    this.set('statistics', this.defaults.statistics);
    this.save();
  },

  /**
   * Loads the list of available stats from the warehouse then updates the
   * collection in the main view.
   */
  fetchStatsSpecies() {
    // Log('UserModel: fetching statistics - species');
    const that = this;
    const statistics = this.get('statistics');

    const report = new Indicia.Report({
      report: 'library/taxa/filterable_explore_list.xml',

      api_key: CONFIG.indicia.api_key,
      remote_host: CONFIG.indicia.host,
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

    const promise = report.run()
      .then((receivedData) => {
        const species = [];
        const toWait = [];

        // try to find all species in the internal taxa database
        receivedData.data.forEach((stat) => {
          const parsePromise = new Promise((fulfill) => {
            // turn it to a full species descriptor from species data set
            SpeciesSearchEngine.search(stat.taxon, (results) => {
              const foundedSpecies = results[0];
              if (results.length && foundedSpecies.scientific_name === stat.taxon) {
                if (foundedSpecies.common_name) {
                  foundedSpecies.found_in_name = 'common_name';
                }
                species.push(foundedSpecies);
              }
              fulfill();
            }, 1, true);
          });

          toWait.push(parsePromise);
        });

        // save the user and exit
        return Promise.all(toWait).then(() => {
          statistics.synced_on = new Date().toString();
          statistics.species = species;
          statistics.speciesRaw = receivedData.data;
          that.set('statistics', statistics);
          that.save();
        });
      })
      .catch(() => {
        Log('Stats load failed', 'e');
      });

    return promise;
  },

  /**
   * Checks if the last sync was done too long ago.
   * @returns {boolean}
   * @private
   */
  _lastStatsSyncExpired() {
    const statistics = this.get('statistics');

    if (!statistics.synced_on) return true;

    const lastSync = new Date(statistics.synced_on);

    function daydiff(first, second) {
      return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    return daydiff(lastSync, new Date()) >= 1;
  },
};
