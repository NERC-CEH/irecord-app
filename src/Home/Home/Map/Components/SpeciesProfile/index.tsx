import { useState } from 'react';
import {
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import '@ionic/react/css/ionic-swiper.css';
import clsx from 'clsx';
import { closeCircle, checkmarkCircle } from 'ionicons/icons';
import { Gallery } from '@flumens';
import config from 'common/config';
import CustomAlert from './CustomAlert';
import ImageWithBackground from './ImageWithBackground';
import { Record, Media } from '../../esResponse.d';
import './styles.scss';

type Props = {
  record: Record;
  onClose: any;
};

const statuses = {
  C: 'Unconfirmed',
  R: 'Rejected',
  V: 'Accepted',
};
// Verification status 1: Accepted, Rejected or Unconfirmed
// Verification status 2: Correct, Considered correct, Unable to verify, Incorrect, Not reviewed, or Plausible

export default function SpeciesProfile({ record, onClose }: Props) {
  const [showGallery, setShowGallery] = useState<number>();

  const date = record.metadata.created_on.split(' ')[0];
  const formattedDate = new Date(date).toLocaleString('en-GB').split(',')[0];

  const status = record.identification.verification_status;
  const statusText = statuses[status];

  const commonName = record.taxon.vernacular_name;
  const scientificName = record.taxon.accepted_name;

  const gridRef = record.location.output_sref;

  const count = record.occurrence.individual_count;
  const stage = record.occurrence.life_stage;

  const getFullScreenPhotoViewer = () => {
    const initialSlide = showGallery;

    const getImageSource = ({ path }: Media) => {
      const imageURL = `${config.backend.mediaUrl}${path}`;

      return { src: imageURL };
    };

    const items = record.occurrence.media?.map(getImageSource) || [];

    const isOpen = Number.isFinite(showGallery);

    return (
      <Gallery
        isOpen={isOpen}
        items={items}
        initialSlide={initialSlide}
        onClose={setShowGallery}
        mode="md"
      />
    );
  };

  const getSlides = (media?: Media[]) => {
    if (!media?.length) return null;

    const slideOpts = {
      initialSlide: 0,
      speed: 400,
    };

    const getSlide = (image: Media, index: number) => {
      const { path } = image;
      const showPhotoInFullScreenWrap = () => setShowGallery(index);
      const imageURL = `${config.backend.mediaUrl}${path}`;

      return (
        <SwiperSlide
          key={imageURL}
          onClick={showPhotoInFullScreenWrap}
          className="species-profile-photo"
        >
          <ImageWithBackground src={imageURL} />
        </SwiperSlide>
      );
    };

    const slideImage = media?.map(getSlide);

    const pager = media.length > 1;

    return (
      <Swiper
        modules={[Pagination]}
        pagination={pager}
        className={clsx(pager && 'paginated')}
        {...slideOpts}
      >
        {slideImage}
      </Swiper>
    );
  };

  let statusIcon;
  if (status) {
    if (status === 'V') {
      statusIcon = <IonIcon icon={checkmarkCircle} className="id-green" />;
    } else if (status === 'C') {
      statusIcon = <IonIcon icon={checkmarkCircle} className="id-amber" />;
    } else {
      statusIcon = <IonIcon icon={closeCircle} className="id-red" />;
    }
    statusIcon = <div className="verification-status">{statusIcon}</div>;
  }

  return (
    <CustomAlert>
      <div className="alert-species-profile">
        <div className="gallery">{getSlides(record.occurrence.media)}</div>

        <IonCardHeader>
          {statusIcon}

          <div className="title">
            {commonName && <h1>{commonName}</h1>}
            <h3>
              <i>{scientificName}</i>
            </h3>
          </div>
        </IonCardHeader>

        <IonCardContent>
          <div>
            <span className="record-attribute">Status:</span> {statusText}
          </div>
          <div>
            <span className="record-attribute">Date:</span> {formattedDate}
          </div>
          <div>
            <span className="record-attribute">Location:</span> {gridRef}
          </div>
          {count && (
            <div>
              <span className="record-attribute">Count:</span> {count}
            </div>
          )}
          {stage && (
            <div>
              <span className="record-attribute">Stage:</span> {stage}
            </div>
          )}
        </IonCardContent>

        {getFullScreenPhotoViewer()}
      </div>
      <div className="button-wrapper">
        <IonButton
          color="primary"
          type="submit"
          expand="block"
          onClick={onClose}
        >
          Close
        </IonButton>
      </div>
    </CustomAlert>
  );
}
