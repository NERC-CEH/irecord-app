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

      let headerView = new HeaderView();

      //create new record with a photo
      headerView.on('photo:upload', function (e) {
        let occurrence = new Occurrence();

        //show loader

        //create and add new record
        var callback = function (err, data, fileType) {
          Morel.Image.resize(data, fileType, 800, 800, function (err, image, data) {
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
              sample.startGPS();
              //hide loader
            });
          });
        };

        Morel.Image.toString(e.target.files[0], callback);
      });
      App.regions.header.show(headerView);
    }
  };

  return API;
});