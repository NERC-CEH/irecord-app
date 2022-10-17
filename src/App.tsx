import { FC } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { observer } from 'mobx-react';
import Home from './Home';
import User from './User/router';
import Info from './Info/router';
import Settings from './Settings/router';
import SplashScreenRequired from './Info/SplashScreenRequired';
import Survey from './Survey/router';
import 'common/translations/translator';

const HomeRedirect = () => <Redirect to="home" />;

const App: FC = () => (
  <IonApp>
    <SplashScreenRequired>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route exact path="/" component={HomeRedirect} />
          <Route path="/home" component={Home} />
          {User}
          {Info}
          {Survey}
          {Settings}
        </IonRouterOutlet>
      </IonReactRouter>
    </SplashScreenRequired>
  </IonApp>
);

export default observer(App);
