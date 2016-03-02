define([
  'marionette',
  'JST',
  'common/past_locations_view'
], function (Marionette, JST, PastLocationsView) {
  let View = Marionette.LayoutView.extend({
    template: JST['settings/locations/main'],

    regions: {
      locations: '#locations'
    },

    onChildviewLocationDelete: function (view) {
      this.triggerMethod('location:delete', view.model);
    },

    onChildviewLocationEdit: function (view) {
      this.triggerMethod('location:edit', view.model);
    },

    onShow: function () {
      let that = this;
      let pastLocationsView = new PastLocationsView({
        model: this.model
      });

      this.locations.show(pastLocationsView);
    }
  });

  return View;
});