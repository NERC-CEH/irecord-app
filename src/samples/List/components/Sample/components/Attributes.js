import React from 'react';
import PropTypes from 'prop-types';
import StringHelp from 'helpers/string';
import appModel from 'app_model';
import { observer } from 'mobx-react';

const Component = observer(props => {
  const { occ, isDefaultSurvey } = props;

  let number = StringHelp.limit(occ.get('number'));
  if (!number) {
    number = StringHelp.limit(occ.get('number-ranges'));
  }
  const stage = StringHelp.limit(occ.get('stage'));
  const comment = occ.get('comment');

  const commentLocked = appModel.isAttrLocked(occ, 'comment', !isDefaultSurvey);
  const numberLocked = appModel.isAttrLocked(occ, 'number', !isDefaultSurvey);
  const stageLocked = appModel.isAttrLocked(occ, 'stage', !isDefaultSurvey);

  const commentComponent = (
    <div className={`comment ${commentLocked ? 'locked' : ''}`}>{comment}</div>
  );

  if (!isDefaultSurvey) {
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
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
