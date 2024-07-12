import { FC } from 'react';
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

const Attributes: FC<Props> = ({ occ, sample, isDefaultSurvey }) => {
  let number = StringHelp.limit(occ.attrs.number);
  if (!number) {
    number = StringHelp.limit(occ.attrs['number-ranges']);
  }
  const stage = StringHelp.limit(occ.attrs.stage);
  const type = StringHelp.limit(occ.attrs.type);
  const { comment } = occ.attrs;

  const commentLocked = appModel.isAttrLocked(occ, 'comment');
  const numberLocked = appModel.isAttrLocked(occ, 'number');
  const stageLocked = appModel.isAttrLocked(occ, 'stage');
  const typeLocked = appModel.isAttrLocked(occ, 'type');

  const commentComponent = (
    <span className={`comment ${commentLocked ? 'locked' : ''}`}>
      {comment}
    </span>
  );

  const survey = sample.getSurvey();
  if (!isDefaultSurvey && survey.name !== 'butterflies') {
    return commentComponent;
  }

  return (
    <>
      <span className={`number ${numberLocked ? 'locked' : ''}`}>{number}</span>
      <span className={`stage ${stageLocked ? 'locked' : ''}`}>
        <T>{stage}</T>
      </span>
      <span className={`type ${typeLocked ? 'locked' : ''}`}>
        <T>{type}</T>
      </span>

      {commentComponent}
    </>
  );
};

export default observer(Attributes);
