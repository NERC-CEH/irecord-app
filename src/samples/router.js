/** ****************************************************************************
 * Sample router.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import Device from 'helpers/device';
import App from 'app';
import radio from 'radio';
import savedSamples from 'saved_samples';
import userModel from 'user_model';
import appModel from 'app_model';
import ListController from './list/controller';
import ShowController from './show/controller';
import EditController from './edit/controller';
import EditLocationController from '../common/pages/location/controller';
import EditAttrController from './attr/controller';
import ActivitiesController from '../common/pages/activities/controller';
import TaxonController from '../common/pages/taxon/controller';

App.samples = {};

let scroll = 0; // last scroll position
const $mainRegion = $('#main');

const Router = Marionette.AppRouter.extend({
  routes: {
    'samples(/)': {
      route: ListController.show,
      after() {
        if (Device.isIOS()) {
          // iOS scroll glitch fix
          setTimeout(() => {
            $mainRegion.scrollTop(scroll);
          }, 1);
        } else {
          $mainRegion.scrollTop(scroll);
        }
      },
      leave() {
        scroll = $mainRegion.scrollTop();
      },
    },
    'samples/new(/)': TaxonController.show,
    'samples/:id': ShowController.show,
    'samples/:id/edit(/)': EditController.show,
    'samples/:id/edit/location(/)': EditLocationController.show,
    'samples/:id/edit/activity(/)': ActivitiesController.show,
    'samples/:id/edit/taxon(/)': TaxonController.show,
    'samples/:id/edit/:attr(/)': EditAttrController.show,
    'samples/*path': () => { radio.trigger('app:404:show'); },
  },
});

radio.on('samples:list', (options) => {
  App.navigate('samples', options);
  ListController.show();
});

radio.on('samples:show', (sampleID, options) => {
  App.navigate(`samples/${sampleID}`, options);
  ShowController.show(sampleID);
});

radio.on('samples:edit', (sampleID, options) => {
  App.navigate(`samples/${sampleID}/edit`, options);
  EditController.show(sampleID);
});

radio.on('samples:edit:attr', (sampleID, attrID, options = {}) => {
  App.navigate(`samples/${sampleID}/edit/${attrID}`, options);
  switch (attrID) {
    case 'location':
      EditLocationController.show(sampleID);
      break;
    case 'taxon':
      TaxonController.show(options.onSuccess, options.showEditButton);
      break;
    case 'activity':
      ActivitiesController.show(sampleID);
      break;
    default:
      EditAttrController.show(sampleID, attrID);
  }
});

radio.on('sample:saved', () => {
  window.history.back();
});

function syncSamples() {
  if (Device.isOnline() && appModel.get('autosync') && userModel.hasLogIn()) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      savedSamples.once('fetching:done', () => {
        Log('Samples:router: syncing all samples.');
        savedSamples.save(null, { remote: true });
      });
      return;
    }
    Log('Samples:router: syncing all samples.');
    savedSamples.save(null, { remote: true });
  }
}

userModel.on('login', syncSamples);

App.on('before:start', () => {
  Log('Samples:router: initializing.');
  App.samples.router = new Router();

  if (userModel.hasLogIn()) {
    syncSamples();
  }
});
