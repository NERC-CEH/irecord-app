/** ****************************************************************************
 * Settings Menu controller.
 *****************************************************************************/
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('Settings:Menu:Controller: showing');

    const mainView = new MainView({
      model: appModel,
    });
    mainView.on('setting:toggled', (setting, on) => {
      Log('Settings:Menu:Controller: setting toggled');

      appModel.set(setting, on);
      appModel.save();
    });

    mainView.on('records:submit:all', API.sendAllRecords);
    mainView.on('records:delete:all', API.deleteAllRecords);
    mainView.on('app:reset', () => {
      radio.on('app:dialog', {
        title: 'Reset',
        class: 'error',
        body: 'Are you sure you want to reset the application to its initial state? ' +
        'This will wipe all the locally stored app data!',
        buttons: [
          {
            title: 'Cancel',
            onClick() {
              radio.on('app:dialog:hide', );
            },
          },
          {
            title: 'Reset',
            class: 'btn-negative',
            onClick() {
              // delete all
              API.resetApp(() => {
                radio.on('app:dialog', {
                  title: 'Done!',
                  timeout: 1000,
                });
              });
            },
          },
        ],
      });
    });

    radio.trigger('app:main', mainView);

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Settings',
      }),
    });
    radio.trigger('app:header', headerView);
  },

  deleteAllRecords() {
    let body = 'Are you sure you want to delete all successfully synchronised local records?';
    body += '</br><i><b>Note:</b> records on the server will not be touched.</i>';

    radio.on('app:dialog', {
      title: 'Delete All',
      body,
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            radio.on('app:dialog:hide', );
          },
        },
        {
          title: 'Delete',
          class: 'btn-negative',
          onClick() {
            Log('Settings:Menu:Controller: deleting all records');

            // delete all
            recordManager.removeAllSynced(() => {
              radio.on('app:dialog', {
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
    radio.on('app:dialog', {
      title: 'Submit All',
      body: 'Are you sure you want to set all valid records for submission?',
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            radio.on('app:dialog:hide', );
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
                radio.on('app:dialog:error', err);
                return;
              }
              radio.on('app:dialog', {
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

    recordManager.clearAll(true, callback);

    Analytics.trackEvent('Settings', 'reset app');
  },
};

export { API as default };
