import { checkmarkCircle, closeCircle, helpOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import './styles.scss';

interface Props {
  status: 'verified' | 'plausible' | 'rejected' | 'queried';
}

const VerificationStatus = ({ status }: Props) => {
  let detailIcon;
  let idClass;

  if (status === 'queried') {
    idClass = '';
    detailIcon = helpOutline;
  }

  if (status === 'verified') {
    idClass = 'success';
    detailIcon = checkmarkCircle;
  }

  if (status === 'plausible') {
    idClass = 'warning';
    detailIcon = checkmarkCircle;
  }

  if (status === 'rejected') {
    idClass = 'danger';
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
