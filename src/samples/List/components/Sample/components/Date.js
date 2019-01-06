import React from 'react';
import PropTypes from 'prop-types';
import DateHelp from 'helpers/date';
import appModel from 'app_model';

const Component = props => {
  const { sample, isDefaultSurvey } = props;

  const date = DateHelp.print(sample.get('date'), true);
  const dateLocked = appModel.isAttrLocked(sample, 'date', !isDefaultSurvey);

  if (!date) {
    return <span className="date error">{t('Date')}</span>;
  }

  return <span className={`date ${dateLocked ? 'locked' : ''}`}>{date}</span>;
};

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
