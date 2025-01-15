import { configure as mobxConfig } from 'mobx';
import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { App as AppPlugin } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { loadingController } from '@ionic/core';
import { setupIonicReact, isPlatform } from '@ionic/react';
import * as SentryBrowser from '@sentry/browser';
import config from 'common/config';
import { sentryOptions } from 'common/flumens';
import migrate from 'common/models/migrate';
import { db } from 'common/models/store';
import appModel from 'models/app';
import samples from 'models/collections/samples';
import userModel from 'models/user';
import App from './App';

console.log('🚩 App starting.'); // eslint-disable-line

i18n.use(initReactI18next).init({ lng: 'en' });

setupIonicReact();

mobxConfig({ enforceActions: 'never' });

(async function () {
  if (isPlatform('hybrid') && !localStorage.getItem('sqliteMigrated')) {
    (await loadingController.create({ message: 'Upgrading...' })).present();
    await migrate();
    localStorage.setItem('sqliteMigrated', 'true');
    window.location.reload();
    return;
  }

  await db.init();
  await userModel.fetch();
  await appModel.fetch();
  await samples.fetch();

  appModel.attrs.sendAnalytics &&
    SentryBrowser.init({
      ...sentryOptions,
      dsn: config.sentryDNS,
      environment: config.environment,
      release: config.version,
      dist: config.build,
      initialScope: {
        user: { id: userModel.id },
        tags: { session: appModel.attrs.appSession },
      },
    });

  appModel.attrs.appSession += 1;

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(<App />);

  if (isPlatform('hybrid')) {
    StatusBar.setStyle({
      style: isPlatform('android') ? StatusBarStyle.Dark : StatusBarStyle.Light,
    });

    SplashScreen.hide();

    AppPlugin.addListener('backButton', () => {
      /* disable android app exit using back button */
    });
  }
})();
