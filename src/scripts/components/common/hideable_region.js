import Marionette from '../../../vendor/marionette/js/backbone.marionette';

export default Marionette.Region.extend({
  show: function () {
    this.$el.show();
    Marionette.Region.prototype.show.apply(this, arguments);
  },

  hide: function () {
    this.$el.hide();
    return this;
  }
});
