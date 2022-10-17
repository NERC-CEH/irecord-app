import { FC } from 'react';
import { IonButton } from '@ionic/react';
import Sample from 'models/sample';
import './styles.scss';

interface Props {
  sample: Sample;
  onClick: any;
}

const PrimaryHeaderButton: FC<Props> = ({ sample, onClick }) => {
  const isDisabled = sample.isUploaded();
  if (isDisabled) return null;

  const isValid = !sample.validateRemote();

  return (
    <IonButton
      onClick={onClick}
      className="primary-header-button"
      color={isValid ? 'primary' : 'medium'}
      fill="solid"
    >
      {sample.metadata.saved ? 'Upload' : 'Finish'}
    </IonButton>
  );
};

export default PrimaryHeaderButton;
