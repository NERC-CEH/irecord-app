import Backbone from 'backbone';
import Morel from 'morel';
import dateExtension from '../../../helpers/date_extension';
import stringExtension from '../../../helpers/string_extension';
import App from '../../../app';
import appModel from '../../common/app_model';
import userModel from '../../common/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from './header_view';
import FooterView from './footer_view';

let id;
let record;
let API = {
  show: function (recordID){
    id = recordID;
    recordManager.get(recordID, function (err, recordModel) {
      //Not found
      if (!recordModel) {
        App.trigger('404:show', {replace: true});
        return;
      }

      //can't edit a saved one - to be removed when record update
      //is possible on the server
      if (recordModel.getSyncStatus() == Morel.SYNCED) {
        App.trigger('records:show', recordID, {replace: true});
        return;
      }


      //MAIN
      let mainView = new MainView({
        model: new Backbone.Model({recordModel: recordModel, appModel: appModel})
      });
      App.regions.main.show(mainView);

      //on finish sync move to show
      let checkIfSynced = function () {
        if (recordModel.getSyncStatus() == Morel.SYNCED) {
          App.trigger('records:show', recordID, {replace: true});
          return;
        }
      };
      recordModel.on('sync:request sync:done sync:error', checkIfSynced);
      mainView.on('destroy', function () {
        //unbind when page destroyed
        recordModel.off('sync:request sync:done sync:error', checkIfSynced);
      });


      //HEADER
      let headerView = new HeaderView({
        model: recordModel
      });

      headerView.on('save', function (e) {
        recordModel.setToSend(function (err) {
          if (err) {
            let invalids = err;
            let missing = '';
            _.each(invalids, function(invalid) {
              missing += '<b>' + invalid.name + '</b> - ' + invalid.message + '</br>';
            });

            App.regions.dialog.show({
              title: 'Sorry',
              body: missing,
              timeout: 2000
            });

            return;
          }

          if (window.navigator.onLine && !userModel.hasLogIn()) {
            App.trigger('user:login', {replace: true});
            return;
          } else {
            recordManager.syncAll();
            App.trigger('record:saved');
          }
        });
      });

      App.regions.header.show(headerView);

      //FOOTER
      let footerView = new FooterView({
        model: recordModel
      });

      footerView.on('photo:upload', function (e) {
        let occurrence = recordModel.occurrences.at(0);
        //show loader
        API.photoUpload(occurrence, e.target.files[0], function () {
          //hide loader
        });
      });

      footerView.on('childview:photo:delete', function (view, e) {
        //show loader
        view.model.destroy(function () {
          //hide loader
        });
      });


      //android gallery/camera selection
      footerView.on('photo:selection', function (e) {
        let occurrence = recordModel.occurrences.at(0);

        App.regions.dialog.show({
          title: 'Choose a method to upload a photo',
          buttons: [
            {
              title: 'Camera',
              onClick: function () {
                let options = {
                  sourceType: Camera.PictureSourceType.CAMERA,
                  destinationType: Camera.DestinationType.DATA_URL
                };

                let onSuccess = function (imageData) {
                  imageData = "data:image/jpeg;base64," + imageData;
                  API.photoUpload(occurrence, imageData, function () {});
                };
                let onError = function () {};

                navigator.camera.getPicture(onSuccess, onError, options);
                App.regions.dialog.hide();
              }
            },
            {
              title: 'Gallery',
              onClick: function () {
                let options = {
                  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                  destinationType: Camera.DestinationType.DATA_URL
                };

                let onSuccess = function (imageData) {
                  imageData = "data:image/jpeg;base64," + imageData;
                  API.photoUpload(occurrence, imageData, function () {});
                };
                let onError = function () {};

                navigator.camera.getPicture(onSuccess, onError, options);
                App.regions.dialog.hide();
              }
            }
          ]
        })
      });

      App.regions.footer.show(footerView);
    });
  },

  /**
   * Add a photo to occurrence
   */
  photoUpload: function (occurrence, file, callback) {
    var stringified = function (err, data, fileType) {
      Morel.Image.resize(data, fileType, 800, 800, function (err, image, data) {
        if (err) {
          App.regions.dialog.error(err);
          return;
        }

        occurrence.images.add(new Morel.Image({
          data: data,
          type: fileType
        }));

        occurrence.save(function () {
          callback && callback();
        })
      });
    };

    if (file instanceof File) {
      Morel.Image.toString(file, stringified);
    } else {
      stringified (null, file, 'image/jpg');
    }
  }
};

export { API as default };
