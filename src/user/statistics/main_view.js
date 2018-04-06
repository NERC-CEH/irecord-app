/** ****************************************************************************
 * Statistics main view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import JST from 'JST';
import LoaderView from '../../common/views/loader_view';
import './styles.scss';

export default Marionette.View.extend({
  tagName: 'div',
  template: JST['user/statistics/main'],

  initialize() {
    this.listenTo(
      this.model,
      'sync:statistics:species:start',
      this.showLoader,
      this
    );
    this.listenTo(
      this.model,
      'sync:statistics:species:end',
      this.hideLoader,
      this
    );
  },

  showLoader() {
    if (!this.loaderView) {
      this.loaderView = new LoaderView();
    }

    this.$el.html(this.loaderView.el);
  },

  hideLoader() {
    if (!this.loaderView) {
      return;
    }

    this.loaderView.destroy();
    delete this.loaderView;
    this.render();
  },

  serializeData() {
    const statistics = this.model.get('statistics');
    return {
      species: statistics.speciesRaw || [],
    };
  },
});
