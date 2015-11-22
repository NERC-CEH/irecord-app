define([
  'morel',
  'app',
  'log',
  'common/record_manager',
  './main_view',
  'common/header_view'
], function (morel, app, log, recordManager, MainView, HeaderView) {
  let id = null;
  let controller = function (recordID) {
    id = recordID;

    let mainView = new MainView();
    app.regions.main.show(mainView);

    let headerView = new HeaderView();
    app.regions.header.show(headerView);
  };

  app.on('common:taxon:selected', function (taxon) {
    if (!id) {
      //create new sighting
      let occurrence = new morel.Occurrence({
        attributes: {
          'taxon': taxon
        }
      })

      let sample = new morel.Sample({
        occurrences: [occurrence]
      });

      recordManager.set(sample, function () {
        //return to previous page
        window.history.back();
      });

    }
  });

  return controller;
});