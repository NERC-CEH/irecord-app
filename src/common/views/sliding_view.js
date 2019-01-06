import $ from 'jquery';
import Marionette from 'backbone.marionette';
import 'marionette.sliding-view';

const cellHeight = 65;

const $main = $('#main');
let viewportHeight;
const viewport = $main[0];
let viewContainsNo;

const Slider = Marionette.SlidingView.extend({
  id: 'list',
  tagName: 'ion-list',

  initialize() {
    viewportHeight = $main.height();
    viewContainsNo = Math.floor(viewportHeight / cellHeight);

    this.listenTo(this.referenceCollection, 'update', () => {
      this._updateCollection();
    });
  },

  registerUpdateEvent() {
    // Execute the throttled callback on scroll
    $main.on('scroll', () => {
      this.onUpdateEvent();
    });
  },

  onUpdateEvent() {
    // Execute the throttled callback on scroll
    requestAnimationFrame(() => {
      this.throttledUpdateHandler();
    });
  },

  initialLowerBound: 0,
  initialUpperBound() {
    return this.getUpperBound(this.initialLowerBound, this.options.scroll);
  },

  getLowerBound: () => 0,

  /**
   *
   * @param lowerBound
   * @param scrollTop  initial scroll if coming back to the list
   * @returns {*}
   */
  getUpperBound(lowerBound, scrollTop) {
    scrollTop || (scrollTop = viewport.scrollTop); // eslint-disable-line

    const scrolledNo = Math.floor(scrollTop / cellHeight);

    return lowerBound + viewContainsNo * 2 + scrolledNo;
  },

  pruneCollection(lowerBound, upperBound) {
    // console.log(`Prune ${lowerBound} ${upperBound}`);
    return this.referenceCollection.slice(lowerBound, upperBound);
  },

  childViewOptions() {
    return {
      appModel: this.options.appModel
    };
  }
});

export default Slider;
