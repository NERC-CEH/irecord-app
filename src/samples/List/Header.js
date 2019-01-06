import radio from 'radio';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import ImageHelp from 'helpers/image';
import showErrMsg from 'helpers/show_err_msg';
import savedSamples from 'saved_samples'; // TODO: should be moved out
import Factory from 'model_factory';

// TODO: should be moved up to common place for Header and Main coponent to share
function createNewSample() {
  radio.trigger('samples:edit:attr', null, 'taxon', {
    onSuccess(taxon, editButtonClicked) {
      Factory.createSample('general', null, taxon)
        .then(sample => sample.save())
        .then(sample => {
          // add to main collection
          savedSamples.add(sample);

          // navigate
          if (editButtonClicked) {
            radio.trigger('samples:edit', sample.cid, { replace: true });
          } else {
            // return back to list page
            window.history.back();
          }
        });
    },
    showEditButton: true,
  });
}

function createNewSampleWithPhoto(...args) {
  Factory.createSampleWithPhoto(...args)
    .then(sample => sample.save())
    .then(sample => {
      // add to main collection
      savedSamples.add(sample);
    })
    .catch(err => {
      Log(err, 'e');
      radio.trigger('app:dialog:error', err);
    });
}

function photoSelect() {
  Log('Samples:List:Controller: photo select.');

  radio.trigger('app:dialog', {
    title: 'Choose a method to upload a photo',
    buttons: [
      {
        title: t('Camera'),
        onClick() {
          ImageHelp.getImage()
            .then(entry => {
              entry && createNewSampleWithPhoto('general', entry.nativeURL);
            })
            .catch(showErrMsg);
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: t('Gallery'),
        onClick() {
          ImageHelp.getImage({
            sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
            saveToPhotoAlbum: false,
          })
            .then(entry => {
              entry &&
                createNewSampleWithPhoto('general', entry.nativeURL, () => {});
            })
            .catch(showErrMsg);
          radio.trigger('app:dialog:hide');
        },
      },
    ],
  });
}

function photoUpload(e) {
  Log('Samples:List:Controller: photo upload.');
  const photo = e.target.files[0];

  // TODO: show loader
  createNewSampleWithPhoto('general', photo);
}

function navigateToSurveys() {
  radio.trigger('surveys:list', { replace: true });
}

@observer
class Component extends React.Component {
  render() {
    const activity = this.props.appModel.getAttrLock('smp:activity');

    const training = this.props.appModel.get('useTraining');
    const activityTitle = activity ? activity.title : null;

    return (
      <nav id="samples-header">
        <div className="pull-left">
          <a href="#info" className="menu-link icon icon-menu" />
          <button
            id="surveys-btn"
            className="icon icon-surveys"
            onClick={navigateToSurveys}
          />
          <a
            href="#user/activities"
            id="activities-btn"
            className={`icon icon-users ${activityTitle ? 'on' : ''}`}
          />
        </div>
        <div className="pull-right">
          <div
            className="img-picker icon icon-camera"
            onClick={window.cordova && photoSelect}>
            {!window.cordova && (
              <input type="file" accept="image/*" onChange={photoUpload} />
            )}
          </div>
          <button
            id="create-new-btn"
            className="icon icon-plus"
            onClick={createNewSample}
          />
        </div>

        {(activityTitle || training) && (
          <div id="subheader">
            {activityTitle && (
              <div className="activity">{t(activityTitle)}</div>
            )}
            {training && <div className="training">{t('Training')}</div>}
          </div>
        )}
      </nav>
    );
  }
}

Component.propTypes = {
  appModel: PropTypes.object.isRequired,
};

export default Component;
