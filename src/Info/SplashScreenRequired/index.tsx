import { useState } from 'react';
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
import 'swiper/css';
import 'swiper/css/pagination';
import SwiperCore from 'swiper';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { arrowForward, checkmarkOutline } from 'ionicons/icons';
import './styles.scss';
import welcomeBackground1 from './images/welcome_1.jpg';
import welcomeBackground2 from './images/welcome_2.jpg';
import welcomeBackground3 from './images/welcome_3.jpg';
import welcomeBackground4 from './images/welcome_4.jpg';
import welcomeBackground5 from './images/welcome_5.jpg';

type Props = {
  children: any;
};

const OnBoardingScreens = ({ children }: Props) => {
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
              <h2>Lets Get Started!</h2>
              <p>
              Login or register to start recording your sightings. Your login
              details can be used on both the app and the ORKS website.
              </p>
            </div>
            <div className="credit">
            <p>Photo by Tamara Weeks</p>
          </div>            
          </SwiperSlide>

          <SwiperSlide
            className="second"
            style={{ backgroundImage: `url(${welcomeBackground2})` }}
          >
            <div className="message">
              <h2>Informing</h2>
              <p>
              The wildlife sightings you record on the ORKS App provide vital
              information for research and conservation.
              </p>
            </div>
            <div className="credit">
            <p>Photo by Ross Wheeler</p>
          </div> 
          </SwiperSlide>

          <SwiperSlide
            className="third"
            style={{ backgroundImage: `url(${welcomeBackground3})` }}
          >
            <div className="message">
              <h2>Accuracy</h2>
              <p>
              This app uses your phones GPS capability to get your location, which
              you can easily update to ensure your records are highly accurate.
              </p>
            </div>
            <div className="credit">
            <p>Photo by Steve Martin</p>
          </div>
          </SwiperSlide>
          <SwiperSlide
            className="fourth"
            style={{ backgroundImage: `url(${welcomeBackground4})` }}
          >
            <div className="message">
              <h2>Recording</h2>
              <p>
              Simply enter the species you&#39;ve seen into the app and add
             details and photos. When you&#39;re ready you can upload you app
             records to the ORKS website.
              </p>
            </div>
            <div className="credit">
            <p>Photo by Terry Dunstan</p>
          </div>
          </SwiperSlide>

          <SwiperSlide
            className="fifth"
            style={{ backgroundImage: `url(${welcomeBackground5})` }}
          >
            <div className="message">
              <h2>Welcome to the ORKS App</h2>
              <p>
              Online Recording Kernow and Scilly (ORKS) is designed to make it as
            quick and easy as possible for you to submit, store and share your
            wildlife records.
              </p>
            </div>
            <div className="credit">
            <p>Photo by Niki Clear</p>
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
