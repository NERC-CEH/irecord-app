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
import RegisterController from './register/controller';
import ResetController from './reset/controller';
import ActivitiesController from '../common/pages/activities/controller';
import StatisticsController from './statistics/controller';

App.user = {};

function loginController(onSuccess) {
  // don't show if logged in
  if (userModel.hasLogIn()) {
    window.history.back();
  }

  Log('User:Login:Controller: showing.');
  radio.trigger('app:header', <Header>Login</Header>);
  radio.trigger('app:main', <Login onSuccess={onSuccess}/>);
}

const Router = Marionette.AppRouter.extend({
  routes: {
    'user/login(/)': loginController,
    'user/activities(/)': ActivitiesController.show,
    'user/statistics(/)': StatisticsController.show,
    'user/register(/)': RegisterController.show,
    'user/reset(/)': ResetController.show,
    'user/*path': () => {
      radio.trigger('app:404:show');
    },
  },
});

radio.on('user:login', (options = {}) => {
  App.navigate('user/login', options);
  loginController(options.onSuccess)
});

App.on('before:start', () => {
  Log('User:router: initializing.');
  App.user.router = new Router();
});
