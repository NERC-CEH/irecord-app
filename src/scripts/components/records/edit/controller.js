/** ****************************************************************************
 * Record Edit controller.
 *****************************************************************************/
import Backbone from 'backbone';
import _ from 'lodash';
import Morel from 'morel';
import device from '../../../helpers/device';
import App from '../../../app';
import appModel from '../../common/app_model';
import userModel from '../../common/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from './header_view';
import FooterView from './footer_view';

let id;
let record;
const API = {
  show(recordID) {
    id = recordID;
    recordManager.get(recordID, (err, recordModel) => {
      // Not found
      if (!recordModel) {
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
      recordModel.on('sync:request sync:done sync:error', checkIfSynced);
      mainView.on('destroy', () => {
        // unbind when page destroyed
        recordModel.off('sync:request sync:done sync:error', checkIfSynced);
      });


      // HEADER
      const headerView = new HeaderView({
        model: recordModel,
      });

      headerView.on('save', () => {
        recordModel.setToSend((setError) => {
          if (setError) {
            const invalids = setError;
            let missing = '';
            _.each(invalids, (invalid) => {
              missing += '<b>' + invalid.name + '</b> - ' + invalid.message + '</br>';
            });

            App.regions.dialog.show({
              title: 'Sorry',
              body: missing,
              timeout: 2000,
            });

            return;
          }

          if (device.isOnline() && !userModel.hasLogIn()) {
            App.trigger('user:login', { replace: true });
            return;
          }

          recordManager.syncAll();
          App.trigger('record:saved');
        });
      });

      App.regions.header.show(headerView);

      // FOOTER
      const footerView = new FooterView({
        model: recordModel,
      });

      footerView.on('photo:upload', (e) => {
        const occurrence = recordModel.occurrences.at(0);
        // show loader
        API.photoUpload(occurrence, e.target.files[0], () => {
          // hide loader
        });
      });

      footerView.on('childview:photo:delete', (view) => {
        // show loader
        view.model.destroy(() => {
          // hide loader
        });
      });


      // android gallery/camera selection
      footerView.on('photo:selection', () => {
        const occurrence = recordModel.occurrences.at(0);

        App.regions.dialog.show({
          title: 'Choose a method to upload a photo',
          buttons: [
            {
              title: 'Camera',
              onClick() {
                const options = {
                  sourceType: window.Camera.PictureSourceType.CAMERA,
                  destinationType: window.Camera.DestinationType.DATA_URL,
                };

                const onSuccess = (imageData) => {
                  const fullImageData = `data:image/jpeg;base64,${imageData}`;
                  API.photoUpload(occurrence, fullImageData, () => {

                  });
                };
                const onError = () => {

                };

                navigator.camera.getPicture(onSuccess, onError, options);
                App.regions.dialog.hide();
              },
            },
            {
              title: 'Gallery',
              onClick() {
                const options = {
                  sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
                  destinationType: window.Camera.DestinationType.DATA_URL,
                };

                const onSuccess = (imageData) => {
                  const fullImageData = `data:image/jpeg;base64,${imageData}`;
                  API.photoUpload(occurrence, fullImageData, () => {

                  });
                };
                const onError = () => {

                };

                navigator.camera.getPicture(onSuccess, onError, options);
                App.regions.dialog.hide();
              },
            },
          ],
        });
      });

      App.regions.footer.show(footerView);
    });
  },

  /**
   * Add a photo to occurrence
   */
  photoUpload(occurrence, file, callback) {
    const stringified = (err, data, fileType) => {
      Morel.Image.resize(data, fileType, 800, 800, (imgErr, image, imgData) => {
        if (imgErr) {
          App.regions.dialog.error(imgErr);
          return;
        }

        occurrence.images.add(new Morel.Image({
          data: imgData,
          type: fileType,
        }));

        occurrence.save(() => {
          callback && callback();
        });
      });
    };

    if (file instanceof File) {
      Morel.Image.toString(file, stringified);
    } else {
      stringified(null, file, 'image/jpg');
    }
  },
};

export { API as default };
