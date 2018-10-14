import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../common/Components/Header';

const StatisticsHeader = props => (
  <Header
    rightPanel={
      <a
        id="refresh-btn"
        onClick={() => props.userModel.syncStats(true)}
        className="icon icon-arrows-cw"
      >
        {t('Refresh')}
      </a>
    }
  >
    Statistics
  </Header>
);

StatisticsHeader.propTypes = {
  userModel: PropTypes.object
};

export default StatisticsHeader;
