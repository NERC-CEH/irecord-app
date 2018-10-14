/** ****************************************************************************
 * Sample router.
 **************************************************************************** */
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
import ShowRecord from './Show';
import Header from '../common/Components/Header';
import Loader from '../common/Components/Loader';
import EditController from './edit/controller';
import EditLocationController from '../common/pages/location/controller';
import EditAttrController from './attr/controller';
import ActivitiesController from '../common/pages/activities/controller';
import TaxonController from '../common/pages/taxon/controller';

App.samples = {};

let scroll = 0; // last scroll position
const $mainRegion = $('#main');

/**
 * Scroll to the last position
 */
radio.on('species:list:show', () => {
  if (Device.isIOS()) {
    // iOS scroll glitch fix
    setTimeout(() => {
      $mainRegion.scrollTop(scroll);
    }, 1);
  } else {
    $mainRegion.scrollTop(scroll);
  }
});

function getSample(callback, ...args) {
  if (savedSamples.fetching) {
    // wait till savedSamples is fully initialized
    radio.trigger('app:main', <Loader />);
    savedSamples.once('fetching:done', () => {
      callback.apply(this, args);
    });

    return null;
  }

  const [sampleID] = args;
  const sample = savedSamples.get(sampleID);

  // Not found
  if (!sample) {
    Log('No sample model found.', 'e');
    radio.trigger('app:404:show', { replace: true });
    return null;
  }

  // can't edit a saved one - to be removed when sample update
  // is possible on the server
  const isRecursive = callback === showRecord; //eslint-disable-line
  if (sample.getSyncStatus() === Indicia.SYNCED && !isRecursive) {
    radio.trigger('samples:show', sampleID, { replace: true });
    return null;
  }

  return sample;
}

function showRecord(sampleID) {
  Log('Samples:Show: visited.');

  const sample = getSample(showRecord, sampleID);
  if (!sample) {
    return;
  }

  radio.trigger('app:header', <Header>Record</Header>);
  radio.trigger('app:main', <ShowRecord sample={sample} />);
  radio.trigger('app:footer:hide');
}

const Router = Marionette.AppRouter.extend({
  routes: {
    'samples(/)': {
      route: () => {
        ListController.show({
          scroll, // inform about the last scroll
        });
      },
      leave() {
        scroll = $mainRegion.scrollTop();
      },
    },
    'samples/new(/)': TaxonController.show,
    'samples/:id': showRecord,
    'samples/:id/edit(/)': EditController.show,
    'samples/:id/edit/location(/)': EditLocationController.show,
    'samples/:id/edit/activity(/)': ActivitiesController.show,
    'samples/:id/edit/:attr(/)': EditAttrController.show,
    'samples/*path': () => {
      radio.trigger('app:404:show');
    },
  },
});

radio.on('samples:list', options => {
  App.navigate('samples', options);
  ListController.show();
});

radio.on('samples:show', (sampleID, options) => {
  App.navigate(`samples/${sampleID}`, options);
  showRecord(sampleID);
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
      TaxonController.show(options);
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
