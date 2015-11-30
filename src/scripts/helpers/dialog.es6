/******************************************************************************
 * Messages the user
 *****************************************************************************/
define([
  'marionette',
  'JST',
  'app'
], function (marionette, JST, app) {
  "use strict";

  $('#app').append('<div id="dialog-container"><div id="dialog"></div></div>');

  let MainView = marionette.LayoutView.extend({
    template: JST['helpers/dialog'],

    el: '#dialog',

    regions: {
      main: '#main'
    }
  });

  let mainView = new MainView();

  let dialog = {
    show: function (view, options = {}) {
      $('#dialog-container').show();

      if (typeof view === 'string') {
//        dialog = new marionette.ItemView({
//          template: _.template(view)
//        })
      }

     // mainView.regions.main.show(dialog);
      $('#dialog').html(view);

      //hide dialog
      if (options.time !== 0) {
        setTimeout(function () {
          dialog.hide();
        }, options.time || 3000);
      }
    },

    error: function (err) {
      dialog.show(err.message);
    },

    showLogin: function () {
      dialog.show('Loading...', {time: 0});
    },

    hide: function () {
      $('#dialog-container').hide();
    }
  };

  return dialog;
});


