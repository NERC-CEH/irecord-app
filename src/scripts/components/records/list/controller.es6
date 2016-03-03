define([
  'morel',
  'app',
  'common/app_model',
  './main_view',
  './header_view',
  'common/record_manager',
  'common/sample',
  'common/occurrence'
], function (Morel, App, appModel, MainView, HeaderView, recordManager, Sample, Occurrence) {
  let API = {
    show: function (){
      recordManager.getAll(function (err, recordsCollection) {
        //MAIN
        let mainView = new MainView({
          collection: recordsCollection,
          appModel: appModel
        });

        mainView.on('childview:record:edit:attr', function (childView, attr) {
          App.trigger('records:edit:attr', childView.model.id || childView.model.cid, attr);
        });

        mainView.on('childview:record:delete', function (childView) {
          let recordModel = childView.model;
          let syncStatus = recordModel.getSyncStatus();
          let body = 'Are you sure you want to remove this record from your device?';

          if (syncStatus === Morel.SYNCED) {
            body += '</br><i><b>Note:</b> it will remain on the server.</i>';
          }
          App.regions.dialog.show({
            title: 'Delete',
            body: body,
            buttons: [
              {
                title: 'Cancel',
                onClick: function () {
                  App.regions.dialog.hide();
                }
              },
              {
                title: 'Delete',
                class: 'btn-negative',
                onClick: function () {
                  childView.model.destroy();
                  App.regions.dialog.hide();
                }
              }
            ]
          });
        });
        App.regions.main.show(mainView);
      });

      //HEADER
      let headerView = new HeaderView();

      headerView.on('photo:upload', function (e) {
        //show loader
        API.photoUpload(e.target.files[0], function () {
          //hide loader
        });
      });

      //android gallery/camera selection
      headerView.on('photo:selection', function (e) {
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
                  API.photoUpload(imageData, function () {});
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
                  API.photoUpload(imageData, function () {});
                };
                let onError = function () {};

                navigator.camera.getPicture(onSuccess, onError, options);
                App.regions.dialog.hide();
              }
            }
          ]
        })
      });

      App.regions.header.show(headerView);

      //FOOTER
      App.regions.footer.hide().empty();
    },

    /**
     * Create new record with a photo
     */
    photoUpload: function (file, callback) {
      let occurrence = new Occurrence();

      //create and add new record
      var stringified = function (err, data, fileType) {
        Morel.Image.resize(data, fileType, 800, 800, function (err, image, data) {
          if (err) {
            App.regions.dialog.error(err);
            return;
          }

          occurrence.images.set(new Morel.Image({
            data: data,
            type: fileType
          }));

          let sample = new Sample(null, {
            occurrences: [occurrence]
          });

          //append locked attributes
          appModel.appendAttrLocks(sample);

          recordManager.set(sample, function () {
            //check if location attr is not locked
            let locks = appModel.get('attrLocks');

            if (!locks.location) {
              //no previous location
              sample.startGPS();
            } else if (!locks.location.latitude || !locks.location.longitude) {
              //previously locked location was through GPS
              //so try again
              sample.startGPS();
            }
            callback()
          });
        });
      };

      if (file instanceof File) {
        Morel.Image.toString(file, stringified);
      } else {
        stringified (null, file, 'image/jpg');
      }
    }
  };

  return API;
});