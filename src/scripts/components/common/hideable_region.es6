define([
  'marionette'
], function (Marionette) {
  let Region = Marionette.Region.extend({
    show: function () {
      this.$el.show();
      Marionette.Region.prototype.show.apply(this, arguments);
    },

    hide: function () {
      this.$el.hide();
      return this;
    }
  });
  return Region;
});