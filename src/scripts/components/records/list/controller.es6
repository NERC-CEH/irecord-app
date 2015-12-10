define([
  'morel',
  'app',
  './main_view',
  './header_view',
  'common/record_manager'
], function (morel, app, MainView, HeaderView, recordManager) {
  let API = {
    show: function (){
      recordManager.getAll(function (err, records) {
        let mainView = new MainView({
          collection: records
        });

        mainView.on('childview:record:edit:attr', function (childView, attr) {
          app.trigger('records:edit:attr', childView.model.id || childView.model.cid, attr);
        });

        mainView.on('childview:record:delete', function (childView) {
          recordManager.remove(childView.model);
        });
        app.regions.main.show(mainView);
      });

      let headerView = new HeaderView();
      app.regions.header.show(headerView);
    }
  };

  //create new record with a photo
  app.on('records:list:upload', function (e) {
    let occurrence = new morel.Occurrence();

    //show loader

    //create and add new record
    var callback = function (err, data, fileType) {
      morel.Image.resize(data, fileType, 800, 800, function (err, image, data) {
        occurrence.images.set(new morel.Image({
          data: data,
          type: fileType
        }));

        let sample = new morel.Sample(null, {
          occurrences: [occurrence]
        });

        recordManager.set(sample, function () {
          //hide loader
        });
      });
    };

    morel.Image.toString(e.target.files[0], callback);
  });

  return API;
});