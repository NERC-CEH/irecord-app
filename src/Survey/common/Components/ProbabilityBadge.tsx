import clsx from 'clsx';
import { camera } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import CONFIG from 'common/config';
import { Badge } from 'common/flumens';

interface Props {
  probability?: number;
  className?: string;
}

const ProbabilityBadge = ({ probability, className }: Props) => {
  if (!probability) return null;

  const roundedProbability = (probability * 100).toFixed();

  let color;
  if (probability > CONFIG.POSITIVE_THRESHOLD) {
    color =
      'border border-solid border-[color:var(--classifier-success)] text-[color:var(--classifier-success)] bg-[var(--classifier-success-background)]';
  } else if (probability > CONFIG.POSSIBLE_THRESHOLD) {
    color =
      'border border-solid border-[color:var(--classifier-plausible)] bg-[var(--classifier-plausible-background)] text-[color:var(--classifier-plausible)]';
  } else {
    color =
      'border border-solid border-[color:var(--classifier-unlikely)] bg-[var(--classifier-unlikely-background)] text-[color:var(--classifier-unlikely)]';
  }

  return (
    <Badge
      className={clsx(className, color)}
      prefix={<IonIcon icon={camera} className="mr-[3px] text-[1em]" />}
    >
      {roundedProbability}%
    </Badge>
  );
};

export default ProbabilityBadge;
