import { observer } from 'mobx-react';
import clsx from 'clsx';
import { IonSpinner } from '@ionic/react';
import { Badge, Button } from 'common/flumens';
import Sample from 'models/sample';

interface Props {
  sample: Sample;
  onUpload: (e?: any) => void;
  uploadIsPrimary?: boolean;
}

const OnlineStatus = ({ onUpload, sample, uploadIsPrimary }: Props) => {
  const { saved } = sample.metadata;
  const { synchronising } = sample.remote;

  if (!saved) return <Badge className="max-w-32">Draft</Badge>;

  if (synchronising) return <IonSpinner className="survey-status" />;

  if (sample.isUploaded()) return null;

  const isValid = !sample.validateRemote();

  return (
    <Button
      color="primary"
      onPress={onUpload}
      fill={uploadIsPrimary ? undefined : 'outline'}
      preventDefault
      className={clsx(
        'max-w-28 shrink-0 whitespace-nowrap px-4 py-1 text-sm',
        !isValid && 'opacity-50'
      )}
    >
      Upload
    </Button>
  );
};

export default observer(OnlineStatus);
