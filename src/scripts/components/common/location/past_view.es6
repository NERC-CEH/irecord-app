define([
  'marionette',
  'JST'
], function (marionette, JST) {
  let EmptyListView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell empty',
    template: _.template('No previous locations')
  });

  let PastLocationView = marionette.ItemView.extend({
    template: JST['common/location/past_location']
  });

  let PastView = marionette.CompositeView.extend({
    template: JST['common/location/past'],

    childViewContainer: '#user-locations',

    childView: PastLocationView,
    emptyView: EmptyListView,

    initialize: function () {
      let userModel = this.model.get('user');
      var previousLocations = userModel.get('locations');
      this.collection = new Backbone.Collection(previousLocations);
    }
  });

  return PastView;
});