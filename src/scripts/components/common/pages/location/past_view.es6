define([
  'marionette',
  'location',
  'JST'
], function (Marionette, LocHelp, JST) {
  let EmptyListView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell empty',
    template: _.template('No previous locations')
  });

  let PastLocationView = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'table-view-cell',

    template: JST['common/location/past_location'],

    events: {
      'click': 'onClick'
    },

    //let the controller know
    onClick: function () {
      this.trigger('location:select:past', {
        latitude: this.model.get('latitude'),
        longitude: this.model.get('longitude'),
        accuracy: this.model.get('accuracy'),
        name: this.model.get('name')
      });
    },

    serializeData: function () {
      let latitude = this.model.get('latitude');
      let longitude = this.model.get('longitude');
      let accuracy = this.model.get('accuracy');

      let location = '';

      if (this.options.useGridRef) {
        location = LocHelp.coord2grid({
          longitude: longitude,
          latitude: latitude
        }, accuracy)
      } else {
        location = longitude + ', ' + latitude;
      }

      return {
        name: this.model.get('name'),
        location: location
      }
    }
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
      this.childViewOptions = {
        useGridRef: appModel.get('useGridRef')
      }
    }
  });

  return PastView;
});