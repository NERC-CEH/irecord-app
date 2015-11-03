/******************************************************************************
 * Main app router.
 *****************************************************************************/
define([
  'routers/router_extension',
  'views/_page',
  'views/main/page'
], function(ext, Page, MainPage) {
  'use strict';

  app.views = {};

  var Router = Backbone.Router.extend({
    /**
     * Initialize the router.
     */
    initialize: function () {
      _log('app.Router: initialize.', log.DEBUG);
    },

    /**
     * Routes to listen to.
     */
    routes: {
      "": function () {
        if (!app.views.mainPage) {
          app.views.mainPage = new MainPage();
        }
        this.changePage(app.views.mainPage);
      },


      "main": function () {
        if (!app.views.mainPage) {
          app.views.mainPage = new MainPage();
        }
        this.changePage(app.views.mainPage);
      }
    },

    /**
     * If the JQM page needs no controller and uses a rather static template
     * we can use this function to create the view and open it as a page.
     *
     * @param pageID the ID of a page that matches the template name
     */
    navigateToStandardPage: function (pageID) {
      if (!app.views[pageID + 'Page']) {
        app.views[pageID + 'Page'] = new Page(pageID);
      }
      this.changePage(app.views[pageID + 'Page']);
    },

    /**
     * Since the JQM page navigation is disabled with backbone this navigates to
     * a new page view.
     *
     * @param page backbone page view
     */
    changePage: function (page) {
      // We turned off $.mobile.autoInitializePage, but now that we've
      // added our first page to the DOM, we can now call initializePage.
      if (!this.initializedFirstPage) {
        _log('app.Router: loading first page.', log.DEBUG);

        $.mobile.initializePage();
        this.initializedFirstPage = true;
      }

      //update the URL hash
      $(":mobile-pagecontainer").pagecontainer("change", '#' + page.id,
        {changeHash: false});
    }
  });

  return Router;
});