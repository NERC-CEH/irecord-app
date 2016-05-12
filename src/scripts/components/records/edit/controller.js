/** ****************************************************************************
 * Record Edit controller.
 *****************************************************************************/
import Backbone from 'backbone';
import _ from 'lodash';
import Morel from 'morel';
import Device from '../../../helpers/device';
import ImageHelp from '../../../helpers/image';
import Log from '../../../helpers/log';
import App from '../../../app';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from './header_view';
import FooterView from './footer_view';

let id;
let record;
const API = {
  show(recordID) {
    Log('Records:Edit:Controller: showing');
    id = recordID;
    recordManager.get(recordID, (err, recordModel) => {
      if (err) {
        Log(err, 'e');
      }

      // Not found
      if (!recordModel) {
        Log('No record model found', 'e');
        App.trigger('404:show', { replace: true });
        return;
      }

      // can't edit a saved one - to be removed when record update
      // is possible on the server
      if (recordModel.getSyncStatus() === Morel.SYNCED) {
        App.trigger('records:show', recordID, { replace: true });
        return;
      }


      // MAIN
      const mainView = new MainView({
        model: new Backbone.Model({ recordModel, appModel }),
      });
      App.regions.main.show(mainView);

      // on finish sync move to show
      function checkIfSynced() {
        if (recordModel.getSyncStatus() === Morel.SYNCED) {
          App.trigger('records:show', recordID, { replace: true });
          return;
        }
      }
      recordModel.on('request sync error', checkIfSynced);
      mainView.on('destroy', () => {
        // unbind when page destroyed
        recordModel.off('request sync error', checkIfSynced);
      });


      // HEADER
      const headerView = new HeaderView({
        model: recordModel,
      });

      headerView.on('save', () => {
        API.save(recordModel);
      });

      App.regions.header.show(headerView);

      // FOOTER
      const footerView = new FooterView({
        model: recordModel,
      });

      footerView.on('photo:upload', (e) => {
        const photo = e.target.files[0];
        API.photoUpload(recordModel, photo);
      });

      footerView.on('childview:photo:delete', (view) => {
        const photo = view.model;
        API.photoDelete(photo);
      });

      // android gallery/camera selection
      footerView.on('photo:selection', () => {
        API.photoSelect(recordModel);
      });

      App.regions.footer.show(footerView);
    });
  },

  save(recordModel) {
    const valid = API.saveRecord(recordModel, (saveErr) => {
      if (saveErr) {
        App.regions.dialog.error(saveErr);
      }
    });

    // invalid sample
    if (!valid) {
      const invalids = recordModel.validationError;
      API.showInvalidsMessage(invalids);
    }
  },

  saveRecord(recordModel, callback) {
    Log('Records:Edit:Controller: save clicked');

    const valid = recordModel.setToSend((setError) => {
      if (setError) {
        callback(setError);
        return;
      }

      if (Device.isOnline() && !userModel.hasLogIn()) {
        App.trigger('user:login', { replace: true });
        return;
      }

      // todo: call callback
      recordModel.save(null, { remote: true });
      App.trigger('record:saved');
    });

    return valid;
  },

  showInvalidsMessage(invalids) {
    delete invalids.sample.saved; // it wasn't saved so of course this error

    let missing = '';
    if (invalids.occurrences) {
      _.each(invalids.occurrences, (message, invalid) => {
        missing += `<b>${invalid}</b> - ${message}</br>`;
      });
    }
    if (invalids.sample) {
      _.each(invalids.sample, (message, invalid) => {
        missing += `<b>${invalid}</b> - ${message}</br>`;
      });
    }

    App.regions.dialog.show({
      title: 'Sorry',
      body: missing,
      timeout: 2000,
    });
  },

  photoUpload(recordModel, photo) {
    Log('Records:Edit:Controller: photo uploaded');

    const occurrence = recordModel.occurrences.at(0);
    // show loader
    API.addPhoto(occurrence, photo, (occErr) => {
      // hide loader
      if (occErr) {
        App.regions.dialog.error('Problem saving the occurrence.');
      }
    });
  },

  photoDelete(photo) {
    App.regions.dialog.show({
      title: 'Delete',
      body: 'Are you sure you want to remove this photo from the record?' +
      '</br><i><b>Note:</b> it will remain in the gallery.</i>',
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
            // show loader
            photo.destroy({
              success: () => {
                Log('Records:Edit:Controller: photo deleted');

                // hide loader
              },
            });
            App.regions.dialog.hide();
          },
        },
      ],
    });
  },

  photoSelect(recordModel) {
    Log('Records:Edit:Controller: photo selection');

    const occurrence = recordModel.occurrences.at(0);

    App.regions.dialog.show({
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage((entry) => {
              API.addPhoto(occurrence, entry.nativeURL, (occErr) => {
                if (occErr) {
                  App.regions.dialog.error('Problem saving the occurrence.');
                }
              });
            });
            App.regions.dialog.hide();
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage((entry) => {
              API.addPhoto(occurrence, entry.nativeURL, (occErr) => {
                if (occErr) {
                  App.regions.dialog.error('Problem saving the occurrence.');
                }
              });
            }, {
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false,
            });
            App.regions.dialog.hide();
          },
        },
      ],
    });
  },

  /**
   * Adds a new image to occurrence.
   */
  addPhoto(occurrence, photo, callback) {
    ImageHelp.getImageModel(photo, (err, image) => {
      if (err || !image) {
        const error = new Error('Missing image.');
        callback(error);
        return;
      }
      occurrence.addImage(image);

      occurrence.save(null, {
        success: () => {
          callback();
        },
        error: (error) => {
          Log(error, 'e');
          callback(error);
        },
      });
    });
  },
};

export { API as default };
