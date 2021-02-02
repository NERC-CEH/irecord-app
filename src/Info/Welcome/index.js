import React from 'react';
import Log from 'helpers/log';
import radio from 'radio';
import PropTypes from 'prop-types';
import './styles.scss';
import './images/welcome_1.jpg';
import './images/welcome_2.jpg';
import './images/welcome_3.jpg';
import './images/welcome_4.jpg';
import './images/welcome_5.jpg';

function next(sliderRef) {
  sliderRef.current.slideNext();
}

const Component = props => {
  const { appModel } = props;

  function exit() {
    Log('Info:Welcome:Controller: exit.');
    appModel.attrs.showWelcome = false;
    appModel.save();
    radio.trigger('samples:list', { replace: true });
  }

  const sliderRef = React.createRef();

  return (
    <ion-slides id="welcome" pager="true" ref={sliderRef}>
      <ion-slide class="first">
        <ion-button
          class="skip"
          fill="outline"
          color="light"
          strong="true"
          onClick={exit}
        >
          {t('Skip')}
        </ion-button>
        <ion-button
          class="next"
          fill="outline"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </ion-button>
        <div className="message">
          <h2>Welcome</h2>
          <p>
            <b>ORKS</b> is a platform for management and sharing of your
            wildlife observations. Learn more by swiping left.
          </p>
        </div>
      </ion-slide>

      <ion-slide class="second">
        <ion-button
          class="skip"
          fill="outline"
          color="light"
          strong="true"
          onClick={exit}
        >
          {t('Skip')}
        </ion-button>
        <ion-button
          class="next"
          fill="outline"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </ion-button>

        <div className="message">
          <h2>Record</h2>
          <p>
            Record all the wildlife you see. Over <b>100,000 taxa</b> to choose
            from.
          </p>
        </div>
      </ion-slide>

      <ion-slide class="third">
        <ion-button
          class="skip"
          fill="outline"
          color="light"
          strong="true"
          onClick={exit}
        >
          {t('Skip')}
        </ion-button>
        <ion-button
          class="next"
          fill="outline"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </ion-button>

        <div className="message">
          <h2>Accuracy</h2>
          <p>
            Benefit from your <b>GPS and rich mapping choices</b>, further
            automatic <b>data checks</b> and review by experts.
          </p>
        </div>
      </ion-slide>

      <ion-slide class="fourth">
        <ion-button
          class="skip"
          fill="outline"
          color="light"
          strong="true"
          onClick={exit}
        >
          {t('Skip')}
        </ion-button>
        <ion-button
          class="next"
          fill="outline"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </ion-button>

        <div className="message">
          <h2>Science</h2>
          <p>
            Become a citizen scientist and contribute your sightings to{' '}
            <b>research and conservation</b>.
          </p>
        </div>
      </ion-slide>

      <ion-slide class="fifth">
        <div className="message">
          <h2>Lets start!</h2>
          <p>
            All that’s left to do is to click on the{' '}
            <b style={{ whiteSpace: 'nowrap' }}>Get Started</b> button below.
          </p>
        </div>
        <ion-button color="light" strong="true" onClick={exit}>
          {' '}
          {t('Get Started')}{' '}
        </ion-button>
      </ion-slide>
    </ion-slides>
  );
};

Component.propTypes = {
  appModel: PropTypes.object.isRequired,
};

export default Component;
