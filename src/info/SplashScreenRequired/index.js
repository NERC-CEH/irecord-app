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
          <h2>Welcome</h2>
          <p>
            <b>iRecord</b>
            {' '}
is a platform for management and sharing of your
            wildlife observations.
          </p>
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
          <h2>Record</h2>
          <p>
            Record all the wildlife you see. Over 
            {' '}
            <b>100,000 taxa</b>
            {' '}
to choose
            from.
          </p>
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
          <h2>Accuracy</h2>
          <p>
            Benefit from your 
            {' '}
            <b>GPS and rich mapping choices</b>
, further
            automatic 
            {' '}
            <b>data checks</b>
            {' '}
and review by experts.
          </p>
        </div>
      </IonSlide>
      <IonSlide class="fourth">
        <div className="message">
          <h2>Science</h2>
          <p>
            Become a citizen scientist and contribute your sightings to
            {' '}
            <b>research and conservation</b>
.
          </p>
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
