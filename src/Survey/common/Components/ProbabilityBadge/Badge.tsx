import clsx from 'clsx';
import CONFIG from 'common/config';

interface Props {
  probability?: number;
  className?: string;
  onClick?: any;
}

const ProbabilityBadge = ({ probability, className, onClick }: Props) => {
  if (!probability) return null;

  let color;
  if (probability > CONFIG.POSITIVE_THRESHOLD) {
    color =
      'shrink-0 border border-solid border-2 m-0.5 border-white bg-[var(--classifier-success)]';
  } else if (probability > CONFIG.POSSIBLE_THRESHOLD) {
    color =
      'shrink-0 border border-solid border-2 m-0.5 border-white bg-[var(--classifier-plausible)]';
  } else {
    color =
      'shrink-0 border border-solid border-2 m-0.5 border-white bg-[var(--classifier-unlikely)]';
  }

  return (
    <div
      className={clsx('size-5 rounded-full', className, color)}
      onClick={onClick}
    />
  );
};

export default ProbabilityBadge;
