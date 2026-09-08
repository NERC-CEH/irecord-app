import type { ComponentProps } from 'react';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import HeaderButton from './HeaderButton';

type Props = {
  sample: Sample;
  onClick: ComponentProps<typeof HeaderButton>['onClick'];
};

const SurveyHeaderButton = ({ sample, onClick }: Props) => {
  const isDisabled = sample.isUploaded;
  if (isDisabled) return null;

  const isInvalid = sample.validateRemote();

  return (
    <HeaderButton isInvalid={!!isInvalid} onClick={onClick}>
      {sample.metadata.saved ? 'Upload' : 'Finish'}
    </HeaderButton>
  );
};

export default observer(SurveyHeaderButton);
