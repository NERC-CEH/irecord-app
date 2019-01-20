import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'common/Components/Loader';
import { observer } from 'mobx-react';

const Component = observer(props => {
  const { sample } = props;
  const saved = sample.metadata.saved;

  if (!saved) {
    return null;
  }

  if (sample.remote.synchronising) {
    return <Loader />;
  }

  const isSynced = sample.metadata.synced_on;
  return (
    <div
      className={`online-status icon icon-send ${
        isSynced ? 'cloud' : 'local'
      }`}
    />
  );
});

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
