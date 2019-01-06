import React from 'react';
import Indicia from 'indicia';
import PropTypes from 'prop-types';
import Loader from 'common/Components/Loader';
import { observer } from 'mobx-react';

const Component = observer(props => {
  const { sample } = props;

  const saved = sample.metadata.saved;

  const syncStatus = sample.getSyncStatus();

  const isSynchronising = syncStatus === Indicia.SYNCHRONISING;
  const onDatabase = syncStatus === Indicia.SYNCED;

  if (!saved) {
    return null;
  }

  if (isSynchronising) {
    return <Loader />;
  }

  return (
    <div
      className={`online-status icon icon-send ${
        onDatabase ? 'cloud' : 'local'
      }`}
    />
  );
});

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
