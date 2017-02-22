/** ****************************************************************************
 * App Model statistics functions.
 *****************************************************************************/
import $ from 'jquery';
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

    const data = {
      report: 'library/taxa/filterable_explore_list.xml',
      // user_id filled in by iform_mobile_auth proxy
      path: CONFIG.indicia.input_form,
      api_key: CONFIG.indicia.api_key,
      my_records: 1,
      limit: 10,
      orderby: 'count',
      sortdir: 'DESC',
    };

    const promise = new Promise((fulfull, reject) => {
      $.get({
        url: CONFIG.reports.url,
        data,
        timeout: CONFIG.reports.timeout,
        beforeSend(xhr) {
          const userAuth = btoa(`${that.get('name')}:${that.get('password')}`);
          xhr.setRequestHeader('Authorization', `Basic ${userAuth}`);
        },
        success(receivedData) {
          const species = [];
          const toWait = [];

          receivedData.data.forEach((stat) => {
            const promise = new $.Deferred();
            toWait.push(promise);
            // turn it to a full species descriptor from species data set
            SpeciesSearchEngine.search(stat.taxon, (results) => {
              const foundedSpecies = results[0];
              if (results.length && foundedSpecies.scientific_name === stat.taxon) {
                if (foundedSpecies.common_name) {
                  foundedSpecies.found_in_name = 'common_name';
                }
                species.push(foundedSpecies);
              }
              promise.resolve();
            }, 1, true);
          });

          const dfd = $.when.apply($, toWait);
          dfd.then(() => {
            // save and exit
            statistics.synced_on = new Date().toString();
            statistics.species = species;
            statistics.speciesRaw = receivedData.data;
            that.set('statistics', statistics);
            that.save();
            fulfull();
          });
        },
        error(err) {
          Log('Stats load failed', 'e');
          reject(err);
        },
      });
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
