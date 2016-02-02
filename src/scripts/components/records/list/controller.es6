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
          recordManager.remove(childView.model);
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
      App.regions.header.show(headerView);
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
              sample.startGPS();
            }
            callback()
          });
        });
      };

      Morel.Image.toString(file, stringified);
    }
  };

  return API;
});