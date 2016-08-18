/** ****************************************************************************
 * App Model statistics functions.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Log from '../../../helpers/log';
import SpeciesSearchEngine from '../pages/taxon/search/taxon_search_engine';
import CONFIG from 'config';

export default {
  syncStats(force) {
    const that = this;
    if (this.synchronizingStatistics) {
      return;
    }
    this.synchronizingStatistics = true;

    if (this.hasLogIn() && this._lastStatsSyncExpired() || force) {
      // init or refresh
      this.fetchStatsSpecies(() => {
        that.synchronizingStatistics = false;
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
  fetchStatsSpecies(callback) {
    Log('UserModel: fetching statistics - species');
    this.trigger('sync:statistics:species:start');
    const that = this;
    const statistics = this.get('statistics');

    const data = {
      report: 'library/taxa/filterable_explore_list.xml',
      // user_id filled in by iform_mobile_auth proxy
      path: CONFIG.morel.manager.input_form,
      email: this.get('email'),
      appname: CONFIG.morel.manager.appname,
      appsecret: CONFIG.morel.manager.appsecret,
      usersecret: this.get('secret'),

      my_records: 1,
      limit: 10,
      orderby: 'count',
      sortdir: 'DESC',
    };

    $.ajax({
      url: CONFIG.report.url,
      type: 'POST',
      data,
      dataType: 'JSON',
      timeout: CONFIG.report.timeout,
      success(receivedData) {
        const species = [];
        const toWait = [];

        receivedData.forEach((stat) => {
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
          statistics.species = species;
          statistics.speciesRaw = receivedData;
          that.set('statistics', statistics);
          that.save();
          callback();
          that.trigger('sync:statistics:species:end');
        });
      },
      error(err) {
        Log('Stats load failed');
        callback(err);
        that.trigger('sync:statistics:species:end');
      },
    });
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

    if (daydiff(lastSync, new Date()) >= 1) return true;

    return false;
  },
};
