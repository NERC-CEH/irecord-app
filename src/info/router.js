/** ****************************************************************************
 * Info router.
 **************************************************************************** */
import React from 'react';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import CONFIG from 'config';
import App from 'app';
import radio from 'radio';
import userModel from 'user_model';
import Header from '../common/Components/Header';
import InfoMenu from './Menu';
import WelcomeController from './welcome/controller';
import PrivacyPolicy from './PrivacyPolicy';
import BRCApproved from './BRCApproved';
import Terms from './Terms';
import Credits from './Credits';
import Help from './Help';
import About from './About';

App.info = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'info(/)': () => {
      radio.trigger('app:header', <Header>iRecord App</Header>);
      radio.trigger('app:main', <InfoMenu userModel={userModel}/>);
    },
    'info/welcome(/)': WelcomeController.show,
    'info/about(/)': () => {
      radio.trigger('app:header', <Header>About</Header>);
      radio.trigger('app:main', <About version={CONFIG.version}
                                       build={CONFIG.build}/>);
    },
    'info/help(/)': () => {
      radio.trigger('app:header', <Header>Help</Header>);
      radio.trigger('app:main', <Help/>);
    },
    'info/privacy(/)': () => {
      radio.trigger('app:header', <Header>Privacy Policy</Header>);
      radio.trigger('app:main', <PrivacyPolicy/>);
    },
    'info/terms(/)': () => {
      radio.trigger('app:header', <Header>T&Cs</Header>);
      radio.trigger('app:main', <Terms/>);
    },
    'info/brc-approved(/)': () => {
      radio.trigger('app:header', <Header>BRC Approved</Header>);
      radio.trigger('app:main', <BRCApproved/>);
    },
    'info/credits(/)': () => {
      radio.trigger('app:header', <Header>Credits</Header>);
      radio.trigger('app:main', <Credits/>);
    },
    'info/*path': () => {
      radio.trigger('app:404:show');
    },
  },
});

radio.on('info:welcome', options => {
  App.navigate('info/welcome', options);
  WelcomeController.show();
});

App.on('before:start', () => {
  Log('Info:router: initializing.');
  App.info.router = new Router();
});
