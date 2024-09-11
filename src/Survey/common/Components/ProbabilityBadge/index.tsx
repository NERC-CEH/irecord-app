import { camera } from 'ionicons/icons';
import { IonLabel, IonIcon } from '@ionic/react';
import CONFIG from 'common/config';
import { Badge } from 'common/flumens';
import './styles.scss';

interface Props {
  probability?: number;
}

const ProbabilityBadge = ({ probability }: Props) => {
  if (!probability) return null;

  const roundedProbability = (probability * 100).toFixed();

  let color;
  if (probability > CONFIG.POSITIVE_THRESHOLD) {
    color = 'success';
  } else if (probability > CONFIG.POSSIBLE_THRESHOLD) {
    color = 'plausible';
  } else {
    color = 'unlikely';
  }

  return (
    <Badge className={`badge badge-${color}`}>
      <IonIcon icon={camera} />
      <IonLabel>{roundedProbability}%</IonLabel>
    </Badge>
  );
};

export default ProbabilityBadge;
