import { observer } from 'mobx-react';
import clsx from 'clsx';
import { getPending } from 'models/savedSamples';

type Props = {
  className?: string;
};

function PendingSurveysBadge({ className }: Props) {
  if (!getPending().length) return null;

  return (
    <svg
      className={clsx('size-3 fill-warning-600', className)}
      viewBox="0 0 6 6"
      aria-hidden="true"
    >
      <circle cx={3} cy={3} r={3} />
    </svg>
  );
}

export default observer(PendingSurveysBadge);
