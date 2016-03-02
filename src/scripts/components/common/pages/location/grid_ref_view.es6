define([
  'marionette',
  'location',
  'validate',
  'JST',
], function (Marionette, LocHelp, Validate, JST) {

  return Marionette.ItemView.extend({
    template: JST['common/location/grid_ref'],

    events: {
      'click #grid-ref-set-btn': 'setGridRef'
    },

    initialize: function (options) {
      this.listenTo(options.vent, 'gridref:form:data:invalid', this.onFormDataInvalid);
    },

    setGridRef: function () {
      var val = this.$el.find('#location-gridref').val().escape();
      var name = this.$el.find('#location-name').val().escape();

      let data = {
        gridref: val,
        name: name
      };
      //trigger won't work to bubble up
      this.triggerMethod('location:select:gridref', data);
    },

    onFormDataInvalid: function (errors) {
      var $view = this.$el;
      Validate.updateViewFormErrors($view, errors, "#location-");
    },

    serializeData: function () {
      let location = this.model.get('recordModel').get('location') || {};
      let gridref;

      if (location.latitude && location.longitude) {
        gridref =  LocHelp.coord2grid(location, location.accuracy);
      }

      return {
        gridref: gridref,
        name: location.name
      }
    }
  });
});