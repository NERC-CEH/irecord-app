import Marionette from 'marionette';

export default Marionette.Region.extend({
  show() {
    this.$el.show();
    Marionette.Region.prototype.show.apply(this, arguments);
  },

  hide() {
    this.$el.hide();
    return this;
  },
});
