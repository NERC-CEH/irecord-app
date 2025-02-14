import clsx from 'clsx';
import CONFIG from 'common/config';

interface Props {
  probability?: number;
  className?: string;
}

const ProbabilityBadge = ({ probability, className }: Props) => {
  if (!probability) return null;

  let color;
  if (probability > CONFIG.POSITIVE_THRESHOLD) {
    color =
      'border border-solid border-2 m-0.5 border-white bg-[var(--classifier-success)]';
  } else if (probability > CONFIG.POSSIBLE_THRESHOLD) {
    color =
      'border border-solid border-2 m-0.5 border-white bg-[var(--classifier-plausible)]';
  } else {
    color =
      'border border-solid border-2 m-0.5 border-white bg-[var(--classifier-unlikely)]';
  }

  return <div className={clsx('size-5 rounded-full', className, color)} />;
};

export default ProbabilityBadge;
