import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import ImageHelp from 'helpers/image';
import radio from 'radio';
import showErrMsg from 'helpers/show_err_msg';
import { observer } from 'mobx-react';
import Gallery from '../../common/gallery';
import ImageModel from '../../common/models/image';

function photoDelete(photo) {
  radio.trigger('app:dialog', {
    title: 'Delete',
    body:
      t('Are you sure you want to remove this photo from the sample?') +
      t('</br><i><b>Note:</b> it will remain in the gallery.</i>'),
    buttons: [
      {
        title: 'Cancel',
        fill: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: 'Delete',
        color: 'danger',
        onClick() {
          // show loader
          photo.destroy({
            success: () => {
              Log('Samples:Edit:Controller: photo deleted.');

              // hide loader
            },
          });
          radio.trigger('app:dialog:hide');
          Analytics.trackEvent('Sample', 'photo remove');
        },
      },
    ],
  });
}

function showGallery(media, index) {
  Log('Samples:Edit:Footer: photo view.');

  const items = [];
  const options = { index };

  media.forEach(image => {
    items.push({
      src: image.getURL(),
      w: image.get('width') || 800,
      h: image.get('height') || 800,
    });
  });

  // Initializes and opens PhotoSwipe
  const gallery = new Gallery(items, options);
  gallery.init();
}

/**
 * Adds a new image to occurrence.
 */
function addPhoto(occurrence, photo) {
  return ImageHelp.getImageModel(ImageModel, photo).then(image => {
    occurrence.addMedia(image);
    return occurrence.save();
  });
}

@observer
class Footer extends Component {
  constructor(props) {
    super(props);
    this.photoSelect = this.photoSelect.bind(this);
    this.photoUpload = this.photoUpload.bind(this);
  }

  photoUpload(e) {
    Log('Samples:Edit:Footer: photo uploaded.');
    const photo = e.target.files[0];

    const occurrence = this.props.sample.getOccurrence();
    // TODO: show loader
    addPhoto(occurrence, photo).catch(err => {
      Log(err, 'e');
      radio.trigger('app:dialog:error', err);
    });
  }

  photoSelect() {
    Log('Samples:Edit:Controller: photo selection.');
    const occurrence = this.props.sample.getOccurrence();

    radio.trigger('app:dialog', {
      title: t('Choose a method to upload a photo'),
      buttons: [
        {
          title: t('Gallery'),
          fill: 'clear',
          onClick() {
            ImageHelp.getImage({
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false,
            })
              .then(entry => {
                entry &&
                  addPhoto(occurrence, entry.nativeURL, occErr => {
                    if (occErr) {
                      showErrMsg(occErr);
                    }
                  });
              })
              .catch(showErrMsg);
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: t('Camera'),
          onClick() {
            ImageHelp.getImage()
              .then(entry => {
                entry &&
                  addPhoto(occurrence, entry.nativeURL, occErr => {
                    if (occErr) {
                      showErrMsg(occErr);
                    }
                  });
              })
              .catch(showErrMsg);
            radio.trigger('app:dialog:hide');
          },
        },
      ],
    });
  }

  render() {
    const { sample } = this.props;
    function getMedia() {
      const { models } = sample.getOccurrence().media;
      if (!models || !models.length) {
        return (
          <span className="empty"> 
            {' '}
            {t('No photo has been added')}
          </span>
        );
      }

      return models.map((img, index) => {
        const thumbnail = img.get('thumbnail');
        const id = img.cid;
        return (
          <div key={id} className="img">
            <span
              className="delete icon icon-cancel"
              onClick={() => photoDelete(img)}
            />
            <img
              src={thumbnail}
              alt=""
              onClick={() => showGallery(models, index)}
            />
          </div>
        );
      });
    }

    const isSynchronising = sample.remote.synchronising;

    return (
      <div id="edit-footer">
        <div
          id="img-picker-array"
          className={isSynchronising ? 'disabled' : ''}
        >
          <div
            className="img-picker icon icon-camera"
            onClick={window.cordova && this.photoSelect}
          >
            {!window.cordova && (
              <input type="file" accept="image/*" onChange={this.photoUpload} />
            )}
          </div>
          <div id="img-array">{getMedia()}</div>
        </div>
      </div>
    );
  }
}

Footer.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default Footer;
