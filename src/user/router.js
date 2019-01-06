/** ****************************************************************************
 * User router.
 **************************************************************************** */
import React from 'react';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import App from 'app';
import radio from 'radio';
import userModel from 'user_model';
import Header from '../common/Components/Header';
import Login from './Login';
import Register from './Register';
import Reset from './Reset';
import ActivitiesController from '../common/pages/activities/controller';
import Statistics from './Statistics';
import StatisticsHeader from './Statistics/StatisticsHeader';

App.user = {};

function loginController(onSuccess) {
  // don't show if logged in
  if (userModel.hasLogIn()) {
    window.history.back();
  }

  Log('User:Login: visited.');
  radio.trigger('app:header', <Header>Login</Header>);
  radio.trigger('app:main', <Login onSuccess={onSuccess} />);
  radio.trigger('app:footer:hide');
}

const Router = Marionette.AppRouter.extend({
  routes: {
    'user/login(/)': loginController,
    'user/activities(/)': ActivitiesController.show,
    'user/statistics(/)': () => {
      Log('User:Statistics: visited.');
      radio.trigger('app:header', <StatisticsHeader userModel={userModel} />);
      radio.trigger('app:main', <Statistics userModel={userModel} />);
      radio.trigger('app:footer:hide');
    },
    'user/register(/)': () => {
      // don't show if logged in
      if (userModel.hasLogIn()) {
        window.history.back();
      }

      Log('User:Register: visited.');
      radio.trigger('app:header', <Header>Register</Header>);
      radio.trigger('app:main', <Register userModel={userModel}/>);
      radio.trigger('app:footer:hide');
    },
    'user/reset(/)': () => {
      Log('User:Reset: visited.');
      radio.trigger('app:header', <Header>Reset</Header>);
      radio.trigger('app:main', <Reset />);
      radio.trigger('app:footer:hide');
    },
    'user/*path': () => {
      radio.trigger('app:404:show');
    }
  }
});

radio.on('user:login', (options = {}) => {
  App.navigate('user/login', options);
  loginController(options.onSuccess);
});

App.on('before:start', () => {
  Log('User:router: initializing.');
  App.user.router = new Router();
});
