/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { observer } from 'mobx-react';
import { close } from 'ionicons/icons';
import { IonIcon, IonButton } from '@ionic/react';
import Media from 'models/media';
import ClassificationStatus from './ClassificationStatus';

type Props = {
  media: Media;
  isDisabled: boolean;
  onDelete: any;
  onClick: any;
};

const Image = ({ media, isDisabled, onDelete, onClick }: Props) => {
  return (
    <div className="img">
      {!isDisabled && (
        <IonButton fill="clear" className="delete" onClick={onDelete}>
          <IonIcon icon={close} />
        </IonButton>
      )}

      <img src={media.getURL()} onClick={onClick} />

      <div className="absolute bottom-0 right-0">
        <ClassificationStatus media={media} />
      </div>
    </div>
  );
};

export default observer(Image);
