import $ from 'jquery';
import Marionette from 'backbone.marionette';
import 'marionette.sliding-view';

const cellHeight = 65;

const $main = $('#main');
const viewportHeight = $main.height();
const viewport = $main[0];
const viewContainsNo = Math.floor(viewportHeight / cellHeight);

const Slider = Marionette.SlidingView.extend({
  id: 'list',
  tagName: 'ul',
  className: 'table-view no-top',

  registerUpdateEvent() {
    // Execute the throttled callback on scroll
    $main.on('scroll', () => {
      this.onUpdateEvent();
    });
  },

  onUpdateEvent() {
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
    scrollTop || (scrollTop  = viewport.scrollTop); // eslint-disable-line

    const scrolledNo = Math.floor(scrollTop / cellHeight);

    return lowerBound + viewContainsNo * 2 + scrolledNo;
  },

  pruneCollection(lowerBound, upperBound) {
    console.log(`Prune ${lowerBound} ${upperBound}`);
    return this.referenceCollection.slice(lowerBound, upperBound);
  },

  childViewOptions() {
    return {
      appModel: this.options.appModel,
    };
  },

  serializeData() {
    const activity = this.options.appModel.getAttrLock('activity') || {};
    return {
      useTraining: this.options.appModel.get('useTraining'),
      activity: activity.title,
    };
  },
});

export default Slider;
