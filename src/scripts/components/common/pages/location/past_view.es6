define([
  'marionette',
  'JST'
], function (Marionette, JST) {
  let EmptyListView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell empty',
    template: _.template('No previous locations')
  });

  let PastLocationView = Marionette.ItemView.extend({
    template: JST['common/location/past_location']
  });

  let PastView = Marionette.CompositeView.extend({
    template: JST['common/location/past'],

    childViewContainer: '#user-locations',

    childView: PastLocationView,
    emptyView: EmptyListView,

    initialize: function () {
      let appModel = this.model.get('appModel');
      var previousLocations = appModel.get('locations');
      this.collection = new Backbone.Collection(previousLocations);
    }
  });

  return PastView;
});