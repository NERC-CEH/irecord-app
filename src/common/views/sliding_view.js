import $ from 'jquery';
import Marionette from 'backbone.marionette';

var cellHeight = 65;

const $main = $('#main');
var viewportHeight = $main.height();
var viewport = $main[0];
const viewContainsNo = Math.floor(viewportHeight / cellHeight);

const excessNo = viewContainsNo;
const initialLowerBound = 0;
const initialUpperBound = viewContainsNo + excessNo;

const Slider = Marionette.SlidingView.extend({
  id: 'list',
  tagName: 'ul',
  className: 'table-view no-top',

  registerUpdateEvent() {
    var self = this;
    // Execute the throttled callback on scroll
    $main.on('scroll', () => {
      self.onUpdateEvent();
    });
  },

  onUpdateEvent: function() {
    var self = this;
    requestAnimationFrame(function() {
      self.throttledUpdateHandler();
    });
  },

  initialLowerBound,
  initialUpperBound,

  getLowerBound: function() {
    return 0;
  },

  getUpperBound: function(lowerBound) {
    const scrolledNo = Math.floor(viewport.scrollTop / cellHeight);

    return lowerBound + viewContainsNo + excessNo + scrolledNo;
  },

  pruneCollection: function(lowerBound, upperBound) {
    console.log(`Prune ${lowerBound} ${upperBound}`)
    return this.referenceCollection.slice(lowerBound, upperBound)
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
