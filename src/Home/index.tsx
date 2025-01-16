import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import {
  peopleOutline,
  menuOutline,
  homeOutline,
  addOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Route, Redirect } from 'react-router-dom';
import { App as AppPlugin } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAlert, LongPressFabButton } from '@flumens';
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
  isPlatform,
} from '@ionic/react';
import appModel from 'models/app';
import userModel from 'models/user';
import DefaultCameraSurveyButton from './DefaultCameraSurveyButton';
import Groups from './Groups';
import Home from './Home';
import Menu from './Menu';
import PendingSurveysBadge from './PendingSurveysBadge';
import './styles.scss';

function useLongPressTip() {
  const alert = useAlert();

  function showLongPressTip() {
    if (!appModel.attrs.shownLongPressTip) {
      alert({
        header: 'Tip: Adding Observations',
        message: (
          <>
            <T>
              Tap on the{' '}
              <IonIcon
                className="rounded-full bg-primary text-white"
                icon={addOutline}
              />{' '}
              button to capture a new record. <br />
            </T>
            <br />
            <T>
              Long-press{' '}
              <IonIcon
                className="rounded-full bg-primary text-white"
                icon={addOutline}
              />{' '}
              button to see some more advanced options.
            </T>
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

const vibrate = () =>
  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

const HomeController = () => {
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

  const navigateToPrimarySurvey = () => navigate(`/survey/default`);

  const activitiesOn = !!appModel.getAttrLock('smp', 'groupId');

  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/home" to="/home/surveys" />
          <Route path="/home/surveys/:id?" component={Home} exact />
          <Route path="/home/activities" component={Groups} exact />
          <Route path="/home/menu" component={Menu} exact />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home/surveys" href="/home/surveys">
            <IonIcon icon={homeOutline} />
            <IonLabel>
              <T>Home</T>
            </IonLabel>
            <PendingSurveysBadge className="absolute bottom-4 right-[calc(50%_-_15px)]" />
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
              onLongClick={vibrate}
              icon={addOutline}
            >
              <div className="flex items-center justify-center bg-primary-900 text-[0.8rem] text-[white]">
                <T>Other recording options</T>
              </div>

              <IonFabButton
                routerLink="/survey/plant"
                color="light"
                // Fixes app animation transition if fast clicked android back button.
                routerDirection="none"
              >
                <IonLabel>
                  <T>Plant Survey</T>
                </IonLabel>
              </IonFabButton>
              <IonFabButton
                routerLink="/survey/moth"
                color="light"
                // Fixes app animation transition if fast clicked android back button.
                routerDirection="none"
              >
                <IonLabel>
                  <T>Moth Survey</T>
                </IonLabel>
              </IonFabButton>
              <IonFabButton
                routerLink="/survey/list"
                color="light"
                // Fixes app animation transition if fast clicked android back button.
                routerDirection="none"
              >
                <IonLabel>
                  <T>Species List Survey</T>
                </IonLabel>
              </IonFabButton>
            </LongPressFabButton>
          </IonTabButton>

          <IonTabButton>
            <DefaultCameraSurveyButton />
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
