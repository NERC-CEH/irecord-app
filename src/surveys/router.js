/** ****************************************************************************
 * Settings router.
 **************************************************************************** */
import React from 'react';
import Marionette from 'backbone.marionette';
import $ from 'jquery';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import appModel from 'app_model';
import ListController from './list/controller';
import ShowController from './show/controller';
import EditAttrController from './attr/controller';
import EditController from './edit/controller';
import SamplesListController from './samples/list/controller';
import SamplesEditController from './samples/edit/controller';
import SamplesEditAttrController from './samples/attr/controller';
import LocationController from '../common/pages/location/controller';
import Taxon from '../common/pages/Taxon';
import TaxonHeader from '../common/pages/Taxon/Header';

App.settings = {};

let scroll = 0; // last scroll position
let scrollSamples = 0; // last scroll position
const $mainRegion = $('#main');

/**
 * Scroll to the last position
 */
radio.on('surveys:list:show', samples => {
  if (Device.isIOS()) {
    // iOS scroll glitch fix
    setTimeout(() => {
      if (samples) {
        $mainRegion.scrollTop(scrollSamples);
        return;
      }
      $mainRegion.scrollTop(scroll);
    }, 1);
  } else {
    if (samples) {
      $mainRegion.scrollTop(scrollSamples);
      return;
    }
    $mainRegion.scrollTop(scroll);
  }
});

const showTaxonSelect = options => {
  Log('Survey:Sample:new: visited.');

  const defaultProps = {
    showEditButton: false,
    informalGroups: null,
    onSuccess: null,
    favouriteSpecies: null,
  };
  const props = { ...defaultProps, ...options };

  radio.trigger(
    'app:header',
    <TaxonHeader appModel={appModel} disableFilters />
  );
  radio.trigger('app:main', <Taxon {...props} />);
  radio.trigger('app:footer:hide');
};

const Router = Marionette.AppRouter.extend({
  routes: {
    'surveys(/)': {
      route: surveySampleID => {
        ListController.show({
          surveySampleID,
          scroll, // inform about the last scroll
        });
      },
      leave() {
        scroll = $mainRegion.scrollTop();
      },
    },
    'surveys/:id': ShowController.show,
    'surveys/:id/edit(/)': EditController.show,
    'surveys/:id/edit/samples(/)': {
      route: surveySampleID => {
        SamplesListController.show({
          surveySampleID,
          scroll: scrollSamples, // inform about the last scroll
        });
      },
      leave() {
        scrollSamples = $mainRegion.scrollTop();
      },
    },
    'surveys/:id/edit/samples/new(/)': showTaxonSelect,
    'surveys/:id/edit/samples/:id/edit(/)': SamplesEditController.show,
    'surveys/:id/edit/samples/:id/edit/taxon(/)': showTaxonSelect,
    'surveys/:id/edit/samples/:id/edit/location(/)': LocationController.show,
    'surveys/:id/edit/samples/:id/edit/:attr(/)':
      SamplesEditAttrController.show,

    'surveys/:id/edit/location(/)': LocationController.show,
    'surveys/:id/edit/:attr(/)': EditAttrController.show,
    'surveys/*path': () => {
      radio.trigger('app:404:show');
    },
  },
});

radio.on('surveys:list', options => {
  App.navigate('surveys', options);
  ListController.show();
});

radio.on('surveys:edit', (sampleID, options) => {
  App.navigate(`surveys/${sampleID}/edit`, options);
  EditController.show(sampleID);
});

radio.on('surveys:show', (sampleID, options) => {
  App.navigate(`surveys/${sampleID}`, options);
  ShowController.show(sampleID);
});

radio.on('surveys:samples:edit', (surveySampleID, sampleID, options) => {
  App.navigate(
    `surveys/${surveySampleID}/edit/samples/${sampleID}/edit`,
    options
  );
  SamplesEditController.show(surveySampleID, sampleID);
});

radio.on(
  'surveys:samples:edit:taxon',
  (surveySampleID, sampleID, options = {}) => {
    App.navigate(
      `surveys/${surveySampleID}/edit/samples/${sampleID}/edit/taxon`,
      options
    );
    showTaxonSelect(options);
  }
);

radio.on('app:location:show', (surveySampleID, sampleID, options = {}) => {
  if (sampleID) {
    App.navigate(
      `surveys/${surveySampleID}/edit/samples/${sampleID}/edit/location`,
      options
    );
  } else {
    App.navigate(`surveys/${surveySampleID}/edit/location`, options);
  }

  LocationController.show(surveySampleID, sampleID, options);
});

App.on('before:start', () => {
  Log('Settings:router: initializing.');
  App.settings.router = new Router();
});
