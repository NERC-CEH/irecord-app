import { Trans as T } from 'react-i18next';
import { Button, InfoMessage } from '@flumens';
import config from 'common/config';
import Sample from 'models/sample';
import './styles.scss';

interface Props {
  sample: Sample;
}

const DisabledRecordMessage = ({ sample }: Props) => {
  const [occ] = sample.occurrences;
  const hasOccId = parseInt(occ?.id || '', 10) > 0; // -1 in case couldn't retrieve

  return (
    <InfoMessage className="disabled-record-message" skipTranslation>
      <T>
        This record has been submitted and cannot be edited within this App.
      </T>
      <Button
        href={
          hasOccId
            ? `${config.backend.url}/record-details?occurrence_id=${occ.id}`
            : config.backend.url
        }
        className="mt-2 p-1"
      >
        iRecord website
      </Button>
    </InfoMessage>
  );
};

export default DisabledRecordMessage;
