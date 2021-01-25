import React from 'react';
import { observer } from 'mobx-react';
import { IonSlides, IonSlide, IonButton } from '@ionic/react';
import Log from 'helpers/log';
import appModel from 'app_model';
import './styles.scss';
import './images/welcome_1.jpg';
import './images/welcome_2.jpg';
import './images/welcome_3.jpg';
import './images/welcome_4.jpg';

function next(sliderRef) {
  sliderRef.current.slideNext();
}

const SplashScreen = () => {
  function exit() {
    Log('Info:Welcome:Controller: exit.');
    appModel.attrs.showWelcome = false;
    appModel.save();
  }

  const sliderRef = React.createRef();

  return (
    <IonSlides id="welcome" pager="true" ref={sliderRef}>
      <IonSlide class="first">
        <IonButton class="skip" color="light" strong="true" onClick={exit}>
          {t('Skip')}
        </IonButton>
        <IonButton
          class="next"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </IonButton>
        <div className="message">
          <h2>Lets Get Started!</h2>
          <p>
            Login or register to start recording your sightings. Your login
            details can be used on both the app and the ORKS website.
          </p>
          <div className="credit">
            <p>Photo by Tamara Weeks</p>
          </div>
        </div>
      </IonSlide>

      <IonSlide class="second">
        <IonButton class="skip" color="light" strong="true" onClick={exit}>
          {t('Skip')}
        </IonButton>
        <IonButton
          class="next"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </IonButton>

        <div className="message">
          <h2>Informing</h2>
          <p>
            The wildlife sightings you record on the ORKS App provide vital
            information for research and conservation.
          </p>
          <div className="credit">
            <p>Photo by Ross Wheeler</p>
          </div>
        </div>
      </IonSlide>

      <IonSlide class="third">
        <IonButton class="skip" color="light" strong="true" onClick={exit}>
          {t('Skip')}
        </IonButton>
        <IonButton
          class="next"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </IonButton>
        <div className="message">
          <h2>Mapping</h2>
          <p>
            This app uses your phones GPS capability to get your location, which
            you can easily update to ensure your records are highly accurate.
          </p>
          <div className="credit">
            <p>Photo by Steve Martin</p>
          </div>
        </div>
      </IonSlide>
      <IonSlide class="fourth">
        <div className="message">
          <h2>Recording</h2>
          <p>
            Simply enter the species you've seen into the app and add details
            and photos. When you're ready you can upload you app records to the
            ORKS website.
          </p>
          <div className="credit">
            <p>Photo by Terry Dunstan</p>
          </div>
        </div>
        <IonButton color="light" strong="true" onClick={exit}>
          {t('Get Started')}
        </IonButton>
      </IonSlide>
    </IonSlides>
  );
};

SplashScreen.propTypes = {};

const Component = observer(props => {
  if (appModel.attrs.showWelcome) {
    return <SplashScreen appModel={appModel} />;
  }

  return props.children;
});

Component.propTypes = {};

export default Component;
