import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import StringHelp from 'helpers/string';

type Props = {
  occ: Occurrence;
  sample: Sample;
  isDefaultSurvey: boolean;
};

const Attributes = ({ occ, sample, isDefaultSurvey }: Props) => {
  let number = StringHelp.limit(occ.attrs.number);
  if (!number) {
    number = StringHelp.limit(occ.attrs['number-ranges']);
  }
  const stage = StringHelp.limit(occ.attrs.stage);
  const { comment } = occ.attrs;

  const commentLocked = appModel.isAttrLocked(occ, 'comment');
  const numberLocked = appModel.isAttrLocked(occ, 'number');
  const stageLocked = appModel.isAttrLocked(occ, 'stage');

  const commentComponent = (
    <span
      className={`mr-2.5 w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm ${
        commentLocked ? 'locked' : ''
      }`}
    >
      {comment}
    </span>
  );

  const survey = sample.getSurvey();
  if (!isDefaultSurvey && survey.name !== 'butterflies') {
    return commentComponent;
  }

  return (
    <div className="flex flex-nowrap text-xs [&>*:not(:empty)]:mr-2">
      <span className={`${numberLocked ? 'locked' : ''}`}>{number}</span>
      <span className={`${stageLocked ? 'locked' : ''}`}>
        <T>{stage}</T>
      </span>

      {commentComponent}
    </div>
  );
};

export default observer(Attributes);
