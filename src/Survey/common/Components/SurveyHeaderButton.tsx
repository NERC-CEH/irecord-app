import { observer } from 'mobx-react';
import Sample from 'models/sample';
import HeaderButton from './HeaderButton';

interface Props {
  sample: Sample;
  onClick: any;
}

const SurveyHeaderButton = ({ sample, onClick }: Props) => {
  const isDisabled = sample.isUploaded;
  if (isDisabled) return null;

  const isInvalid = sample.validateRemote();

  return (
    <HeaderButton isInvalid={isInvalid} onClick={onClick}>
      {sample.metadata.saved ? 'Upload' : 'Finish'}
    </HeaderButton>
  );
};

export default observer(SurveyHeaderButton);
