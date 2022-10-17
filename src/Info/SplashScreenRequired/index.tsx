import { FC, useState } from 'react';
import appModel from 'models/app';
import { Page, Main } from '@flumens';
import { observer } from 'mobx-react';
import {
  IonButton,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonFooter,
} from '@ionic/react';
import SwiperCore, { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { arrowForward, checkmarkOutline } from 'ionicons/icons';
import './styles.scss';
import welcomeBackground1 from './images/welcome_1.jpg';
import welcomeBackground2 from './images/welcome_2.jpg';
import welcomeBackground3 from './images/welcome_3.jpg';
import welcomeBackground4 from './images/welcome_4.jpg';

const OnBoardingScreens: FC = ({ children }) => {
  const [moreSlidesExist, setMoreSlidesExist] = useState(true);
  const [controlledSwiper, setControlledSwiper] = useState<SwiperCore>();

  const { showWelcome } = appModel.attrs;
  if (!showWelcome) {
    return <>{children}</>; // eslint-disable-line react/jsx-no-useless-fragment
  }

  function exit() {
    // eslint-disable-next-line no-param-reassign
    appModel.attrs.showWelcome = false;
    appModel.save();
  }

  const handleSlideChangeStart = async () => {
    const isEnd = controlledSwiper && controlledSwiper.isEnd;
    setMoreSlidesExist(!isEnd);
  };

  const slideNextOrClose = () => {
    if (moreSlidesExist) {
      controlledSwiper && controlledSwiper.slideNext();
      return;
    }

    exit();
  };

  return (
    <Page id="welcome-page">
      <Main>
        <Swiper
          onSwiper={setControlledSwiper}
          modules={[Pagination]}
          pagination={moreSlidesExist}
          onSlideChange={handleSlideChangeStart}
        >
          <SwiperSlide
            className="first"
            style={{ backgroundImage: `url(${welcomeBackground1})` }}
          >
            <div className="message">
              <h2>Welcome</h2>
              <p>
                <b>iRecord</b> is a platform for management and sharing of your
                wildlife observations.
              </p>
            </div>
          </SwiperSlide>

          <SwiperSlide
            className="second"
            style={{ backgroundImage: `url(${welcomeBackground2})` }}
          >
            <div className="message">
              <h2>Record</h2>
              <p>
                Record all the wildlife you see. Over <b>100,000 taxa</b> to
                choose from.
              </p>
            </div>
          </SwiperSlide>

          <SwiperSlide
            className="third"
            style={{ backgroundImage: `url(${welcomeBackground3})` }}
          >
            <div className="message">
              <h2>Accuracy</h2>
              <p>
                Benefit from your <b>GPS and rich mapping choices</b>, further
                automatic <b>data checks</b> and review by experts.
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide
            className="fourth"
            style={{ backgroundImage: `url(${welcomeBackground4})` }}
          >
            <div className="message">
              <h2>Science</h2>
              <p>
                Become a citizen scientist and contribute your sightings to{' '}
                <b>research and conservation</b>.
              </p>
            </div>
          </SwiperSlide>
        </Swiper>
      </Main>

      <IonFooter className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton
              onClick={slideNextOrClose}
              color="primary"
              fill="solid"
              shape="round"
            >
              <IonIcon
                icon={!moreSlidesExist ? checkmarkOutline : arrowForward}
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </Page>
  );
};

export default observer(OnBoardingScreens);
