/******************************************************************************
 * Jquery Mobile configuration to work alongside backbone framework.
 *
 * Important: this needs to be loaded before the JQM.
 *****************************************************************************/
define(['jquery'], function ($) {
  $(document).on("mobileinit", function() {
    //JQM configuration
    $.mobile.ns = "";
    $.mobile.autoInitializePage = true;
    $.mobile.subPageUrlKey = "ui-page";
    $.mobile.activePageClass = "ui-page-active";
    $.mobile.activeBtnClass = "ui-btn-active";
    $.mobile.defaultPageTransition = "";
    $.defaultDialogTransition = "";
    $.mobile.minScrollBack = "150";
    $.mobile.loadingMessage = "Loading";
    $.mobile.pageLoadErrorMessage = "Error Loading Page";
    $.mobile.touchOverflowEnabled = 0;

    //Disable jQM routing and component creation events
    //disable hash-routing
    $.mobile.hashListeningEnabled = false;
    //disable anchor-control
    $.mobile.linkBindingEnabled = false;
    //can cause calling object creation twice and back button issues are solved
    $.mobile.ajaxEnabled = false;
    //Otherwise after mobileinit, it tries to load a landing page
    $.mobile.autoInitializePage = false;
    //we want to handle caching and cleaning the DOM ourselves
    $.mobile.page.prototype.options.domCache = false;

    //consider due to compatibility issues
    //not supported by all browsers
    $.mobile.pushStateEnabled = false;
    //Solves phonegap issues with the back-button
    $.mobile.phonegapNavigationEnabled = true;
    //no native datepicker will conflict with the jQM component
    $.mobile.page.prototype.options.degradeInputs.date = true;
  });
});