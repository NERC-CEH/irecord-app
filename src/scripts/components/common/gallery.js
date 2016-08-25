import $ from 'jquery';
import PhotoSwipe from 'photoswipe-lib';
import PhotoSwipeUI_Default from 'photoswipe-ui-default';
import JST from 'JST';

const defaultOptions = {
  mainClass: 'pswp--minimal--dark',
  barsSize: {
    top: 0,
    bottom: 0,
  },
  index: 0,
  captionEl: false,
  fullscreenEl: false,
  zoomEl: false,
  shareEl: false,
  bgOpacity: 0.85,
  tapToClose: true,
  tapToToggleControls: false,
  preloaderEl: true,
  showAnimationDuration: 300,
};

// initialize PhotoSwipe
const photoSwipeContainer = JST['common/gallery']();
$('body').append(photoSwipeContainer);

function Gallery(items, options = {}) {
  const fullOptions = _.extend(defaultOptions, options);
  const pswpElement = document.querySelectorAll('.pswp')[0];
  return new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
}

export { Gallery as default };
