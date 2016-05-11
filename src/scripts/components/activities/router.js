/******************************************************************************
 * Activities router.
 *****************************************************************************/

import Marionette from 'marionette';
import App from '../../app';
import Log from '../../helpers/log';
import userModel from '../common/models/user_model';
import appModel from '../common/models/app_model';

import ListController from './list/controller';

App.activities = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'activities(/)': ListController.show,
    'activities/*path'() {App.trigger('404:show');},
  },
});

App.on('activities', () => {
  App.navigate('activities');
  ListController.show();
});

App.on('before:start', () => {
  Log('Activities:router: initializing');
  App.activities.router = new Router();
});

// Login or out resets activity setup
userModel.on('login logout', function() {
  appModel.set(currentActivityId, null)
  appModel.set('activities', null);
});
