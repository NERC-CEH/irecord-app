import { observer } from 'mobx-react';
import { Route, Redirect } from 'react-router-dom';
import {
  SamplesContext,
  TailwindBlockContext,
  TailwindContext,
  TailwindContextValue,
  defaultContext,
} from '@flumens';
import { IonApp, IonRouterOutlet, isPlatform } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import UpdatedRecordsAlert from 'common/Components/UpdatedRecordsAlert';
import samples from 'common/models/collections/samples';
import 'common/theme.css';
import 'common/translations/translator';
import Home from './Home';
import OnboardingScreens from './Info/OnboardingScreens';
import Info from './Info/router';
import Settings from './Settings/router';
import Survey from './Survey/router';
import User from './User/router';

const platform = isPlatform('ios') ? 'ios' : 'android';
const tailwindContext: TailwindContextValue = { platform };
const tailwindBlockContext = {
  ...defaultContext,
  ...tailwindContext,
  basePath: '',
};

const samplesContext = { samples };

const HomeRedirect = () => <Redirect to="home" />;

const App = () => (
  <IonApp>
    <OnboardingScreens>
      <TailwindContext.Provider value={tailwindContext}>
        <TailwindBlockContext.Provider value={tailwindBlockContext}>
          <SamplesContext.Provider value={samplesContext}>
            <IonReactRouter>
              <UpdatedRecordsAlert />
              <IonRouterOutlet id="main">
                <Route exact path="/" component={HomeRedirect} />
                <Route path="/home" component={Home} />
                {User}
                {Info}
                {Survey}
                {Settings}
              </IonRouterOutlet>
            </IonReactRouter>
          </SamplesContext.Provider>
        </TailwindBlockContext.Provider>
      </TailwindContext.Provider>
    </OnboardingScreens>
  </IonApp>
);

export default observer(App);
