import { FC } from 'react';
import Sample from 'models/sample';
import { InfoMessage } from '@flumens';
import { IonButton } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import config from 'common/config';

interface Props {
  sample: Sample;
}

const DisabledRecordMessage: FC<Props> = ({ sample }) => {
  const [occ] = sample.occurrences;

  return (
    <InfoMessage color="dark">
      This record has been submitted and cannot be edited within this App.
      <IonButton
        expand="block"
        href={
          occ?.id
            ? `${config.backend.url}/record-details?occurrence_id=${occ.id}`
            : config.backend.url
        }
      >
        <T>iRecord website</T>
      </IonButton>
    </InfoMessage>
  );
};

export default DisabledRecordMessage;
