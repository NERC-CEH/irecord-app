import ReactDOM from 'react-dom';
import { setupIonicReact, isPlatform } from '@ionic/react';
import appModel from 'models/app';
import userModel from 'models/user';
import savedSamples from 'models/savedSamples';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as AppPlugin } from '@capacitor/app';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import config from 'common/config';
import { configure as mobxConfig } from 'mobx';
import { initAnalytics } from '@flumens';
import App from './App';
import '@capacitor/core';
import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';
import 'common/theme.scss';

console.log('🚩 App starting.'); // eslint-disable-line

i18n.use(initReactI18next).init({ lng: 'en' });

setupIonicReact({ swipeBackEnabled: false });

mobxConfig({ enforceActions: 'never' });

async function init() {
  await appModel.ready;
  await userModel.ready;
  await savedSamples.ready;

  appModel.attrs.sendAnalytics &&
    initAnalytics({
      dsn: config.sentryDNS,
      environment: config.environment,
      build: config.build,
      release: config.version,
      userId: userModel.id,
      tags: {
        'app.appSession': appModel.attrs.appSession,
      },
    });

  appModel.attrs.appSession += 1;
  appModel.save();

  ReactDOM.render(<App />, document.getElementById('root'));

  if (isPlatform('hybrid')) {
    StatusBar.setStyle({
      style: StatusBarStyle.Light,
    });

    SplashScreen.hide();

    AppPlugin.addListener('backButton', () => {
      /* disable android app exit using back button */
    });
  }
}

init();
