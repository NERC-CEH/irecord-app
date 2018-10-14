/** ****************************************************************************
 * Info Menu main view.
 **************************************************************************** */

import $ from 'jquery';
import 'jquery-touchswipe';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import Device from 'helpers/device';
import './styles.scss';
import './images/welcome_1.jpg';
import './images/welcome_2.jpg';
import './images/welcome_3.jpg';
import './images/welcome_4.jpg';
import './images/welcome_5.jpg';

export default Marionette.View.extend({
  id: 'welcome',
  template: JST['info/welcome/main'],

  triggers: {
    'click #exit': 'exit'
  },

  onAttach() {
    this.$swapsContainer = this.$el.find('#swaps-container');

    /**
     * iOS viewport toolbar problem fix:
     * http://nicolas-hoizey.com/2015/02/viewport-height-is-taller-than-the-visible-part-of-the-document-in-some-mobile-browsers.html
     */
    const diff = this.$swapsContainer.height() - window.innerHeight;
    if (Device.isIOS() && diff > 10) {
      this.$swapsContainer.css('margin-top', -diff);
    }

    this.$progressCircles = this.$el.find('.progress .circle');

    this.startSwipe();
  },

  startSwipe() {
    // eslint-disable-next-line
    const that = this;
    const WIDTH = $(document).width();
    let currentImg = 0;
    const maxImages = 5;
    const speed = 500;
    let imgs = null;

    /**
     * Manually update the position of the imgs on drag
     */
    function scrollImages(distance, duration) {
      imgs.css('transition-duration', `${(duration / 1000).toFixed(1)}s`);

      // inverse the number we set in the css
      const value = (distance < 0 ? '' : '-') + Math.abs(distance).toString();
      imgs.css('transform', `translate(${value}px,0)`);
    }

    function previousImage() {
      currentImg = Math.max(currentImg - 1, 0);
      scrollImages(WIDTH * currentImg, speed);
      that.updateCircleProgress(currentImg);
    }

    function nextImage() {
      currentImg = Math.min(currentImg + 1, maxImages - 1);
      scrollImages(WIDTH * currentImg, speed);
      that.updateCircleProgress(currentImg);
    }

    /**
     * Catch each phase of the swipe.
     * move : we drag the div
     * cancel : we animate back to where we were
     * end : we animate to the next image
     */
    function swipeStatus(event, phase, direction, distance) {
      // If we are moving before swipe, and we are going L or R in X mode,
      // or U or D in Y mode then drag.
      if (phase === 'move' && (direction === 'left' || direction === 'right')) {
        const duration = 0;

        if (direction === 'left') {
          scrollImages(WIDTH * currentImg + distance, duration);
        } else if (direction === 'right') {
          scrollImages(WIDTH * currentImg - distance, duration);
        }
      } else if (phase === 'cancel') {
        scrollImages(WIDTH * currentImg, speed);
      } else if (phase === 'end') {
        if (direction === 'right') {
          previousImage();
        } else if (direction === 'left') {
          nextImage();
        }
      }
    }

    const swipeOptions = {
      triggerOnTouchEnd: true,
      swipeStatus,
      allowPageScroll: 'vertical',
      threshold: 75
    };

    $(() => {
      imgs = this.$el.find('#swaps');
      imgs.swipe(swipeOptions);
    });
  },

  updateCircleProgress(number) {
    this.$progressCircles.each((id, circle) => {
      if ($(circle).data('id') !== number) {
        $(circle).removeClass('circle-full');
      } else {
        $(circle).addClass('circle-full');
      }
    });
  }
});
