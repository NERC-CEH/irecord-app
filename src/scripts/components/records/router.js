/** ****************************************************************************
 * Record rounter.
 *****************************************************************************/
import Marionette from 'marionette';
import log from '../../helpers/log';
import device from '../../helpers/device';
import App from '../../app';
import recordManager from '../common/record_manager';
import userModel from '../common/user_model';
import appModel from '../common/app_model';

import ListController from './list/controller';
import ShowController from './show/controller';
import EditController from './edit/controller';
import EditAttrController from './attr/controller';
import TaxonController from '../common/pages/taxon/controller';
import LocationController from '../common/pages/location/controller';

App.records = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'records(/)': ListController.show,
    'records/new(/)': TaxonController.show,
    'records/:id': ShowController.show,
    'records/:id/edit(/)': EditController.show,
    'records/:id/edit/location(/)': LocationController.show,
    'records/:id/edit/taxon(/)': TaxonController.show,
    'records/:id/edit/:attr(/)': EditAttrController.show,
    'records/*path'() {App.trigger('404:show');},
  },
});

App.on('records:list', (options) => {
  App.navigate('records', options);
  ListController.show();
});

App.on('records:show', (recordID, options) => {
  App.navigate(`records/${recordID}`, options);
  ShowController.show(recordID);
});

App.on('records:edit', (recordID, options) => {
  App.navigate(`records/${recordID}/edit`, options);
  EditController.show(recordID);
});

App.on('records:edit:attr', (recordID, attrID, options) => {
  App.navigate(`records/${recordID}/edit/${attrID}`, options);
  switch (attrID) {
    case 'location':
      LocationController.show(recordID);
      break;
    case 'taxon':
      TaxonController.show(recordID);
      break;
    default:
      EditAttrController.show(recordID, attrID);
  }
});

App.on('records:new', (options) => {
  App.navigate('records/new', options);
  EditController.show();
});

App.on('records:new:attr', (attrID, options) => {
  App.navigate(`records/new/${attrID}`, options);
  switch (attrID) {
    case 'location':
      LocationController.show();
      break;
    case 'taxon':
      TaxonController.show();
      break;
    default:
      EditAttrController.show(null, attrID);
  }
});

App.on('record:saved', () => {
  window.history.back();
});

function syncRecords() {
  if (device.isOnline() && appModel.get('autosync')) {
    recordManager.syncAll();
  }
}

userModel.on('login', syncRecords);

App.on('before:start', () => {
  log('Initializing records', 'd');

  App.records.router = new Router();

  if (userModel.hasLogIn()) {
    syncRecords();
  }
});

