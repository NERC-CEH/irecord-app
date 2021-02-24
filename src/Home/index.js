import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  IonFab,
  IonFabButton,
  IonFabList,
} from '@ionic/react';
import { camera, add, menu, home, map } from 'ionicons/icons';
import Hammer from 'hammerjs';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import alert from 'helpers/alert';
import { error, warn } from 'helpers/toast';
import actionSheet from 'helpers/actionSheet';
import ImageHelp from 'helpers/image';
import Log from 'helpers/log';
import defaultSurvey from 'common/config/surveys/default';
import Sample from 'sample';
import Occurrence from 'occurrence';
import SurveysList from './List';
import SurveysMap from './Map';
import './styles.scss';

// const activity = this.props.appModel.getAttrLock('smp', 'activity');

// const training = this.props.appModel.attrs.useTraining;
// const activityTitle = activity ? activity.title : null;

async function createNewSampleWithPhoto(...args) {
  const sample = await defaultSurvey.createWithPhoto(
    Sample,
    Occurrence,
    ...args
  );
  await sample.save();
  // add to main collection
  savedSamples.push(sample);
}

class Component extends React.Component {
  static propTypes = {
    history: PropTypes.object,
  };

  constructor() {
    super();
    this.fabRef = React.createRef();
  }

  showPhotoOptions = () => {
    const showErrMsg = err => {
      Log(err, 'e');
      error(`${t(err.message || err)}`);
    };

    actionSheet({
      header: t('Choose a method to upload a photo'),
      buttons: [
        {
          text: t('Gallery'),
          handler: () => {
            if (!window.cordova) {
              warn(
                'Sorry, but this action is not available in browser context.'
              );
              return;
            }
            ImageHelp.getImage({
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false,
            })
              .then(entry => {
                entry && createNewSampleWithPhoto(entry.nativeURL, () => {});
              })
              .catch(showErrMsg);
          },
        },
        {
          text: t('Camera'),
          handler: () => {
            if (!window.cordova) {
              warn(
                'Sorry, but this action is not available in browser context.'
              );
              return;
            }
            ImageHelp.getImage()
              .then(entry => {
                entry && createNewSampleWithPhoto(entry.nativeURL);
              })
              .catch(showErrMsg);
          },
        },
        {
          text: t('Cancel'),
          role: 'cancel',
        },
      ],
    });
  };

  _setUpNonCordovaFabButton = () => {
    const { history } = this.props;
    window.l = this.fabRef.current;
    const h = new Hammer(this.fabRef.current);
    h.on('press click touch tap pressup', ev => {
      ev.preventDefault();
      ev.srcEvent.stopPropagation();

      if (!['ion-fab-button', 'ion-icon'].includes(ev.target.localName)) {
        return;
      }

      ev.srcEvent.preventDefault();
      ev.srcEvent.stopImmediatePropagation();

      if (
        this.fabRef.current.activated &&
        ev.type === 'tap' &&
        ev.target.localName !== ' ion-label'
      ) {
        this.fabRef.current.close();
        return;
      }

      if (ev.type === 'tap') {
        if (this.fabRef.current.activated) {
          return;
        }

        history.push(`/survey/default/new`);
      }
    });
  };

  componentDidMount() {
    if (!appModel.attrs.shownLongPressTip) {
      alert({
        header: 'Tip: Adding Observations',
        message:
          'Tap on the <ion-icon class="tip-icon" src="/images/ios-add.svg"></ion-icon> button to capture a new record.',
        buttons: [
          {
            text: t('OK, got it'),
            role: 'cancel',
            cssClass: 'primary',
          },
        ],
      });
      appModel.attrs.shownLongPressTip = true;
      appModel.save();
    }

    if (!window.cordova) {
      this._setUpNonCordovaFabButton();
      return;
    }

    const { history } = this.props;
    const fab = new Hammer(this.fabRef.current);
    fab.on(
      'press click touch tap touchend pressup tapstart ionBlur ionFocus',
      ev => {
        if (!['ion-fab-button', 'ion-icon'].includes(ev.target.localName)) {
          return;
        }
        ev.preventDefault();

        if (ev.type === 'press') {
          this.fabRef.current.click();
          return;
        }

        if (ev.type === 'tap') {
          this.fabRef.current.close();

          if (this.fabRef.current.activated) {
            return;
          }

          history.push(`/survey/default/new`);
        }
      }
    );
  }

  render() {
    //const activitiesOn = !!appModel.getAttrLock('smp', 'activity');
    const { useExperiments } = appModel.attrs;

    return (
      <>
        <IonFab
          ref={this.fabRef}
          vertical="bottom"
          horizontal="center"
          slot="fixed"
        >
          <IonFabButton>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonTabs>
          <IonRouterOutlet>
            <Route
              path="/home/surveys"
              render={props => (
                <SurveysList
                  appModel={appModel}
                  savedSamples={savedSamples}
                  {...props}
                />
              )}
              exact
            />

            <Route
              path="/home/map"
              render={props => (
                <SurveysMap
                  appModel={appModel}
                  savedSamples={savedSamples}
                  {...props}
                />
              )}
              exact
            />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home/surveys" href="/home/surveys">
              <IonIcon icon={home} />
              <IonLabel>{t('Home')}</IonLabel>
            </IonTabButton>

            <IonTabButton
              // className={activitiesOn ? 'activities-button-on' : ''}
              tab="home/activities"
              href="/home/activities"
            >
              {/* <IonIcon icon={people} />
              <IonLabel>{t('Activities')}</IonLabel> */}

              {/* TODO: */}
              {/* className={`icon icon-users ${activityTitle ? 'on' : ''}`} */}
            </IonTabButton>

            <IonTabButton>{/* placeholder */}</IonTabButton>

            {useExperiments ? (
              <IonTabButton tab="map" href="/home/map">
                <IonIcon icon={map} />
                <IonLabel>{t('Map')}</IonLabel>
              </IonTabButton>
            ) : (
              <IonTabButton onClick={this.showPhotoOptions}>
                <IonIcon icon={camera} />
                <IonLabel>{t('Photo')}</IonLabel>
              </IonTabButton>
            )}

            <IonTabButton tab="menu" href="/info/menu">
              <IonIcon icon={menu} />
              <IonLabel>{t('Menu')}</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </>
    );
  }
}

export default Component;
