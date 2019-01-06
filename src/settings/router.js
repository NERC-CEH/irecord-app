/** ****************************************************************************
 * Settings router.
 **************************************************************************** */
import React from 'react';
import Marionette from 'backbone.marionette';
import App from 'app';
import radio from 'radio';
import appModel from 'app_model';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import Log from 'helpers/log';
import Locations from './Locations';
import Survey from './Survey';
import Menu from './Menu';
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
    'settings(/)': () => {
      Log('Settings:Survey: visited.');
      radio.trigger('app:header', <Header>Settings</Header>);
      radio.trigger(
        'app:main',
        <Menu
          appModel={appModel}
          userModel={userModel}
          savedSamples={savedSamples}
        />
      );
      radio.trigger('app:footer:hide');
    },
    'settings/locations(/)': showLocations,
    'settings/survey(/)': () => {
      Log('Settings:Survey: visited.');
      radio.trigger('app:header', <Header>Grid Unit</Header>);
      radio.trigger('app:main', <Survey appModel={appModel}/>);
      radio.trigger('app:footer:hide');
    },
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
