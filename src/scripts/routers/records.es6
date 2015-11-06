define([
  'jquery.mobile',
  'marionette',
  'views/main/page'
], function(jqm, Marionette, MainPage) {
  let Records = {};

  Records.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "": "listRecords",
      "records": "listRecords",
      "records/:id": "showRecord",
      "records/:id/edit": "editRecord"
    }
  });

  let controller = {
    listRecords: function () {
      //create the page
      if (!Records.page){
        Records.page = new MainPage();
      }

      //jqm
      $(":mobile-pagecontainer").pagecontainer("change", '#' + Records.page.id,
        {changeHash: false});

      $.mobile.initializePage();
    },

    showRecord: function () {

    },

    editRecord: function () {

    }
  };

  //app.on("records:lists", function(criterion) {
  //  Records.list.controller.listRecords(criterion);
  //});

  (function () {
    new Records.Router({controller: controller});
  })();

  return controller;
});
