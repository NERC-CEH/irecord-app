import { FC } from 'react';
import { IonBadge } from '@ionic/react';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import './styles.scss';

type SavedSamples = any;

function getPendingCount(savedSamples: SavedSamples) {
  const byUploadStatus = (sample: Sample) => !sample.metadata.syncedOn;

  return savedSamples.filter(byUploadStatus).length;
}

type Props = {
  savedSamples: SavedSamples;
};

const PendingSurveysBadge: FC<Props> = ({ savedSamples }) => {
  const count = getPendingCount(savedSamples);

  if (count <= 0) {
    return null;
  }

  return (
    <IonBadge color="warning" className="pending-surveys-badge">
      {count}
    </IonBadge>
  );
};

export default observer(PendingSurveysBadge);
