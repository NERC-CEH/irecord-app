import { FC, useContext, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  IonFabButton,
  NavContext,
  useIonRouter,
} from '@ionic/react';
import { observer } from 'mobx-react';
import {
  peopleOutline,
  cameraOutline,
  menuOutline,
  homeOutline,
  addOutline,
} from 'ionicons/icons';
import { App as AppPlugin } from '@capacitor/app';
import savedSamples from 'models/savedSamples';
import appModel from 'models/app';
import userModel from 'models/user';
import { Trans as T } from 'react-i18next';
import { useAlert, captureImage, LongPressFabButton } from '@flumens';
import defaultSurveyConfig from 'Survey/Default/config';
import PendingSurveysBadge from 'Components/PendingSurveysBadge';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import Home from './Home';
import Activities from './Activities';
import Menu from './Menu';
import './styles.scss';

async function createDefaultSurvey(image: string) {
  if (!defaultSurveyConfig.createWithPhoto) return null; // to bypass TS

  const sample = await defaultSurveyConfig.createWithPhoto(Sample, Occurrence, {
    image,
  });

  await sample.save();

  // add to main collection
  savedSamples.push(sample);

  return sample;
}

function useLongPressTip() {
  const alert = useAlert();

  function showLongPressTip() {
    if (!appModel.attrs.shownLongPressTip) {
      alert({
        header: 'Tip: Adding Observations',
        message: (
          <>
            Tap on the <IonIcon class="tip-icon" icon={addOutline} /> button to
            capture a new record. <br />
            <br />
            Long-press <IonIcon class="tip-icon" icon={addOutline} /> button to
            see some more advanced options.
          </>
        ),
        buttons: [
          {
            text: 'OK, got it',
            role: 'cancel',
          },
        ],
      });
      appModel.attrs.shownLongPressTip = true;
      appModel.save();
    }
  }

  useEffect(showLongPressTip, []);
}

const HomeController: FC = () => {
  const ionRouter = useIonRouter();

  const { navigate } = useContext(NavContext);

  useLongPressTip();

  const exitApp = () => {
    const onExitApp = () => !ionRouter.canGoBack() && AppPlugin.exitApp();

    // eslint-disable-next-line @getify/proper-arrows/name
    document.addEventListener('ionBackButton', (ev: any) =>
      ev.detail.register(-1, onExitApp)
    );

    const removeEventListener = () =>
      document.addEventListener('ionBackButton', onExitApp);
    return removeEventListener;
  };
  useEffect(exitApp, []);

  async function startDefaultSurveyWithImage() {
    const [image] = await captureImage({ camera: true });
    if (!image) return;

    const sample = await createDefaultSurvey(image);

    navigate(`/survey/default/${sample?.cid}`);
  }

  const navigateToPrimarySurvey = () => navigate(`/survey/default`);

  const activitiesOn = !!appModel.getAttrLock('smp', 'activity');

  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/home" to="/home/surveys" />
          <Route path="/home/surveys" component={Home} exact />
          <Route path="/home/activities" component={Activities} exact />
          <Route path="/home/menu" component={Menu} exact />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home/surveys" href="/home/surveys">
            <IonIcon icon={homeOutline} />
            <IonLabel>
              <T>Home</T>
            </IonLabel>
            <PendingSurveysBadge savedSamples={savedSamples} />
          </IonTabButton>

          <IonTabButton
            className={activitiesOn ? 'activities-button-on' : ''}
            tab="home/activities"
            href={userModel.isLoggedIn() ? '/home/activities' : '/user/login'}
          >
            <IonIcon icon={peopleOutline} />
            <IonLabel>
              <T>Activities</T>
            </IonLabel>
          </IonTabButton>

          <IonTabButton>
            <LongPressFabButton
              onClick={navigateToPrimarySurvey}
              icon={addOutline}
              buttonProps={{ longClickDuration: 500 }}
            >
              <div className="long-press-surveys-label">
                <T>Other recording options</T>
              </div>

              <IonFabButton
                className="fab-button-label"
                routerLink="/survey/plant"
              >
                <IonLabel>
                  <T>Plant Survey</T>
                </IonLabel>
              </IonFabButton>
              <IonFabButton
                className="fab-button-label"
                routerLink="/survey/moth"
              >
                <IonLabel>
                  <T>Moth Survey</T>
                </IonLabel>
              </IonFabButton>
              <IonFabButton
                className="fab-button-label"
                routerLink="/survey/list"
              >
                <IonLabel>
                  <T>General Survey</T>
                </IonLabel>
              </IonFabButton>
            </LongPressFabButton>
          </IonTabButton>

          <IonTabButton>
            {/* https://github.com/ionic-team/ionic-framework/issues/22511 */}
            <div
              className="on-click-container"
              onClick={startDefaultSurveyWithImage}
            >
              <IonIcon icon={cameraOutline} />
              <IonLabel>
                <T>Photo</T>
              </IonLabel>
            </div>
          </IonTabButton>

          <IonTabButton tab="menu" href="/home/menu">
            <IonIcon icon={menuOutline} />
            <IonLabel>
              <T>Menu</T>
            </IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default observer(HomeController);
