import { Trans as T } from 'react-i18next';
import { Button, InfoMessage } from '@flumens';
import config from 'common/config';
import Sample from 'models/sample';

interface Props {
  sample: Sample;
}

const DisabledRecordMessage = ({ sample }: Props) => {
  const [occ] = sample.occurrences;

  const survey = sample.getSurvey();

  const url =
    survey.name === 'default'
      ? `${config.backend.url}/${survey.webForm}?occurrence_id=${occ.id}`
      : `${config.backend.url}/${survey.webForm}?sample_id=${sample.id}`;

  return (
    <InfoMessage skipTranslation>
      <div className="mb-2">
        <T>
          This record has been submitted and cannot be edited within this App.
        </T>
      </div>
      <div>
        <T>To view the full record, please visit the iRecord website.</T>
      </div>
      <Button href={url} className="mt-2 p-1">
        iRecord website
      </Button>
    </InfoMessage>
  );
};

export default DisabledRecordMessage;
