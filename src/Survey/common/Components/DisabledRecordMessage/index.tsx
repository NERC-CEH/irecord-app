import { FC } from 'react';
import { Trans as T } from 'react-i18next';
import { InfoMessage } from '@flumens';
import { IonButton } from '@ionic/react';
import config from 'common/config';
import Sample from 'models/sample';
import './styles.scss';

interface Props {
  sample: Sample;
}

const DisabledRecordMessage: FC<Props> = ({ sample }) => {
  const [occ] = sample.occurrences;
  const hasOccId = parseInt(occ?.id || '', 10) > 0; // -1 in case couldn't retrieve

  return (
    <InfoMessage
      color="dark"
      className="disabled-record-message"
      skipTranslation
    >
      <T>
        This record has been submitted and cannot be edited within this App.
      </T>
      <IonButton
        expand="block"
        href={
          hasOccId
            ? `${config.backend.url}/record-details?occurrence_id=${occ.id}`
            : config.backend.url
        }
      >
        <T>ORKS website</T>
      </IonButton>
    </InfoMessage>
  );
};

export default DisabledRecordMessage;
