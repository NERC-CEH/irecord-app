import { checkmarkCircle, closeCircle, helpOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

interface Props {
  status: 'verified' | 'plausible' | 'rejected' | 'queried';
}

const VerificationIcon = ({ status }: Props) => {
  let detailIcon;
  let idClass;

  if (status === 'queried') {
    idClass = '';
    detailIcon = helpOutline;
  }

  if (status === 'verified') {
    idClass = 'text-[color:var(--verification-success)]';
    detailIcon = checkmarkCircle;
  }

  if (status === 'plausible') {
    idClass = 'text-[color:var(--verification-plausible)]';
    detailIcon = checkmarkCircle;
  }

  if (status === 'rejected') {
    idClass = 'text-[color:var(--verification-rejected)]';
    detailIcon = closeCircle;
  }

  return (
    <IonIcon
      slot="end"
      className={`m-0 ml-1 size-6 shrink-0 rounded-[5px] [--ionicon-stroke-width:2em] ${idClass}`}
      icon={detailIcon}
    />
  );
};

export default VerificationIcon;
