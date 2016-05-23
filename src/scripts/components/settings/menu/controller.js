/** ****************************************************************************
 * Settings Menu controller.
 *****************************************************************************/
import Backbone from 'backbone';
import App from '../../../app';
import Log from '../../../helpers/log';
import Analytics from '../../../helpers/analytics';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('Settings:Menu:Controller: showing');

    const templateData = new Backbone.Model({
      useGridRef: appModel.get('useGridRef'),
      autosync: appModel.get('autosync'),
    });

    const mainView = new MainView({
      model: templateData,
    });
    mainView.on('setting:toggled', (setting, on) => {
      Log('Settings:Menu:Controller: setting toggled');

      appModel.set(setting, on);
      appModel.save();
    });

    mainView.on('records:submit:all', API.sendAllRecords);
    mainView.on('records:delete:all', API.deleteAllRecords);
    mainView.on('app:reset', () => {
      App.regions.dialog.show({
        title: 'Reset',
        class: 'error',
        body: 'Are you sure you want to reset the application to its initial state? ' +
        'This will wipe all the locally stored app data!',
        buttons: [
          {
            title: 'Cancel',
            onClick() {
              App.regions.dialog.hide();
            },
          },
          {
            title: 'Reset',
            class: 'btn-negative',
            onClick() {
              // delete all
              API.resetApp(() => {
                App.regions.dialog.show({
                  title: 'Done!',
                  timeout: 1000,
                });
              });
            },
          },
        ],
      });
    });

    App.regions.main.show(mainView);

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Settings',
      }),
    });
    App.regions.header.show(headerView);
  },

  deleteAllRecords() {
    let body = 'Are you sure you want to delete all submitted records?';
    body += '</br><i><b>Note:</b> submitted ones will remain on the server.</i>';

    App.regions.dialog.show({
      title: 'Delete All',
      body,
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            App.regions.dialog.hide();
          },
        },
        {
          title: 'Delete',
          class: 'btn-negative',
          onClick() {
            Log('Settings:Menu:Controller: deleting all records');

            // delete all
            recordManager.removeAllSynced(() => {
              App.regions.dialog.show({
                title: 'Done!',
                timeout: 1000,
              });
            });
            Analytics.trackEvent('Settings', 'delete all');
          },
        },
      ],
    });
  },

  sendAllRecords() {
    App.regions.dialog.show({
      title: 'Submit All',
      body: 'Are you sure you want to set all valid records for submission?',
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            App.regions.dialog.hide();
          },
        },
        {
          title: 'OK',
          class: 'btn-positive',
          onClick() {
            Log('Settings:Menu:Controller: sending all records');

            // delete all
            recordManager.setAllToSend((err) => {
              if (err) {
                App.regions.dialog.error(err);
                return;
              }
              App.regions.dialog.show({
                title: 'Done!',
                timeout: 1000,
              });
            });
            Analytics.trackEvent('Settings', 'send all');
          },
        },
      ],
    });
  },

  resetApp(callback) {
    Log('Settings:Menu:Controller: resetting the application!', 'w');

    appModel.clear().set(appModel.defaults);
    appModel.save();

    userModel.clear().set(userModel.defaults);
    userModel.save();

    recordManager.getAll((err, samples) => {
      if (window.cordova) {
        // we need to remove the images from file system
        samples.each((sample) => {
          sample.trigger('destroy');
        });
      }
      recordManager.clear(callback);
    });
    Analytics.trackEvent('Settings', 'reset app');
  },
};

export { API as default };
