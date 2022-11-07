import { FC } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import './styles.scss';

interface Props {
  status: 'verified' | 'plausible' | 'rejected';
}

const VerificationStatus: FC<Props> = ({ status }) => {
  let detailIcon;
  let idClass;

  if (status === 'verified') {
    idClass = 'id-green';
    detailIcon = checkmarkCircle;
  }

  if (status === 'plausible') {
    idClass = 'id-amber';
    detailIcon = checkmarkCircle;
  }

  if (status === 'rejected') {
    idClass = 'id-red';
    detailIcon = closeCircle;
  }

  return (
    <IonIcon
      slot="end"
      className={`verification-icon ${idClass}`}
      icon={detailIcon}
    />
  );
};

export default VerificationStatus;
