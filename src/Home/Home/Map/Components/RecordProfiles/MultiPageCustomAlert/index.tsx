import { FC, useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import SwiperCore, { Pagination } from 'swiper';
import { Swiper } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import '@ionic/react/css/ionic-swiper.css';
import { close, arrowForwardOutline, arrowBackOutline } from 'ionicons/icons';
import clsx from 'clsx';
import CustomAlert from './CustomAlert';
import './styles.scss';

type Props = {
  onClose: any;
};

const MultiPageCustomAlert: FC<Props> = ({ children, onClose }) => {
  const [controlledSwiper, setControlledSwiper] = useState<SwiperCore>();
  const [moreSlidesExist, setMoreSlidesExist] = useState(true);
  const [prevSlidesExist, setPrevSlidesExist] = useState(false);

  const slideNext = () => {
    controlledSwiper && controlledSwiper.slideNext();
  };
  const slidePrev = () => {
    controlledSwiper && controlledSwiper.slidePrev();
  };

  const handleSlideChange = async () => {
    setMoreSlidesExist(!controlledSwiper?.isEnd);
    setPrevSlidesExist(!controlledSwiper?.isBeginning);
  };

  return (
    <CustomAlert>
      <IonButton
        onClick={onClose}
        className="close"
        color="light"
        fill="solid"
        shape="round"
      >
        <IonIcon slot="icon-only" icon={close} />
      </IonButton>

      <Swiper
        onSwiper={(swiper: SwiperCore) => {
          setMoreSlidesExist(!swiper?.isEnd);
          setPrevSlidesExist(!swiper?.isBeginning);
          setControlledSwiper(swiper);
        }}
        modules={[Pagination]}
        pagination={{
          type: 'fraction',
          el: '.multi-page-alert-pagination',
        }}
        onSlideChange={handleSlideChange}
      >
        {children}
      </Swiper>

      <div
        className={clsx(
          'multi-page-alert-footer',
          !prevSlidesExist && !moreSlidesExist && 'hidden'
        )}
      >
        {prevSlidesExist ? (
          <IonButton fill="clear" color="dark" onClick={slidePrev}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
        ) : (
          <div />
        )}

        <div className="multi-page-alert-pagination" />

        {moreSlidesExist ? (
          <IonButton fill="clear" color="dark" onClick={slideNext}>
            <IonIcon icon={arrowForwardOutline} />
          </IonButton>
        ) : (
          <div />
        )}
      </div>
    </CustomAlert>
  );
};

export default MultiPageCustomAlert;
