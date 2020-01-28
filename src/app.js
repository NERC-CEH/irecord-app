import 'helpers/system_checkup';
import 'helpers/translator';
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { IonApp, IonPage, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { observer } from 'mobx-react';

import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';
import 'common/theme.scss';
import Home from './Home';
import User from './User';
import Info from './Info';
import Settings from './Settings';
import SplashScreenRequired from './Info/SplashScreenRequired';
import Survey from './Survey';

const App = observer(() => (
  <IonApp>
    <IonReactRouter>
      <Route exact path="/" render={() => <Redirect to="/home/surveys" />} />
      <SplashScreenRequired>
        <IonPage id="main">
          <Switch>
            <Route path="/home" component={Home} />
            <Route path="/survey" component={Survey} />
            <IonRouterOutlet>
              {User}
              {Info}
              {Settings}
            </IonRouterOutlet>
          </Switch>
        </IonPage>
      </SplashScreenRequired>
    </IonReactRouter>
  </IonApp>
));

export default App;
