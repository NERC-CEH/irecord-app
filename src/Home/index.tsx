import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import {
  peopleOutline,
  menuOutline,
  homeOutline,
  mapOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Route, Redirect } from 'react-router-dom';
import { App as AppPlugin } from '@capacitor/app';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  NavContext,
  useIonRouter,
} from '@ionic/react';
import appModel from 'models/app';
import userModel from 'models/user';
import Groups from './Groups';
import Home from './Home';
import Map from './Map';
import Menu from './Menu';
import PendingSurveysBadge from './PendingSurveysBadge';
import SurveyButtonWithImagePicker from './SurveyButtonWithImagePicker';
import './styles.scss';

const HomeController = () => {
  const ionRouter = useIonRouter();

  const { navigate } = useContext(NavContext);

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

  const navigateToPrimarySurvey = (sampleId?: string) =>
    navigate(`/survey/default${sampleId ? `/${sampleId}` : ''}`);
  const navigateToListSurvey = () => navigate(`/survey/list`);
  const navigateToMothSurvey = () => navigate(`/survey/moth`);
  const navigateToPlantSurvey = () => navigate(`/survey/plant`);

  const activitiesOn = !!appModel.getAttrLock('smp', 'groupId');

  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/home" to="/home/surveys" />
          <Route path="/home/surveys/:id?" component={Home} exact />
          <Route path="/home/activities" component={Groups} exact />
          <Route path="/home/map" component={Map} exact />
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

          <IonTabButton className="z-10">
            <SurveyButtonWithImagePicker
              onPrimarySurvey={navigateToPrimarySurvey}
              onListSurvey={navigateToListSurvey}
              onMothSurvey={navigateToMothSurvey}
              onPlantSurvey={navigateToPlantSurvey}
              onCameraSurveyStart={navigateToPrimarySurvey}
              onGallerySurveyStart={navigateToPrimarySurvey}
            />
          </IonTabButton>

          <IonTabButton tab="map" href="/home/map">
            <IonIcon icon={mapOutline} />
            <IonLabel>
              <T>Map</T>
            </IonLabel>
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
