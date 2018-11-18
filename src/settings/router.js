/** ****************************************************************************
 * Settings router.
 **************************************************************************** */
import React from 'react';
import Marionette from 'backbone.marionette';
import App from 'app';
import radio from 'radio';
import appModel from 'app_model';
import Log from 'helpers/log';
import Locations from './Locations';
import SurveyController from './survey/controller';
import MenuController from './menu/controller';
import Header from '../common/Components/Header';

App.settings = {};

function showLocations(options) {
  options || (options = {});

  Log('Settings:Locations: visited.');
  const locations = appModel.get('locations');
  radio.trigger('app:header', <Header>Past Locations</Header>);
  radio.trigger(
    'app:main',
    <Locations locations={locations} onSelect={options.onSelect} />
  );
}

const Router = Marionette.AppRouter.extend({
  routes: {
    'settings(/)': MenuController.show,
    'settings/locations(/)': showLocations,
    'settings/survey(/)': SurveyController.show,
    'settings/*path': () => {
      radio.trigger('app:404:show');
    },
  },
});

radio.on('settings:locations', (options = {}) => {
  App.navigate('settings/locations', options);
  showLocations(options);
});

App.on('before:start', () => {
  Log('Settings:router: initializing.');
  App.settings.router = new Router();
});
