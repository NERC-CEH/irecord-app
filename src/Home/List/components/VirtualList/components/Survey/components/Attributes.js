import React from 'react';
import PropTypes from 'prop-types';
import StringHelp from 'helpers/string';
import appModel from 'app_model';
import { observer } from 'mobx-react';

const Component = observer(props => {
  const { sample, occ, isDefaultSurvey } = props;

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
    <div className={`comment ${commentLocked ? 'locked' : ''}`}>{comment}</div>
  );

  const survey = sample.getSurvey();
  if (!isDefaultSurvey && survey.name !== 'butterflies') {
    return commentComponent;
  }

  return (
    <div>
      <div className={`number ${numberLocked ? 'locked' : ''}`}>{number}</div>
      <div className={`stage ${stageLocked ? 'locked' : ''}`}>{t(stage)}</div>
      {commentComponent}
    </div>
  );
});

Component.propTypes = {
  occ: PropTypes.object.isRequired,
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
