import React from 'react';
import PropTypes from 'prop-types';
import appModel from 'app_model';

const Component = props => {
  const { sample, isDefaultSurvey } = props;
  const isLocating = sample.isGPSRunning();
  const locationPrint = sample.printLocation();

  const location = sample.attributes.location;
  const locationName = location.name;
  const locationLocked = appModel.isAttrLocked(
    sample,
    'locationName',
    !isDefaultSurvey
  );

  if (!locationPrint) {
    if (isLocating) {
      return <span className="location warn">{t('Locating')}...</span>;
    }

    return <span className="location error">{t('No location')}</span>;
  }

  if (!locationName) {
    return <span className="location error">{t('No location name')}</span>;
  }

  return (
    <span className={`location ${locationLocked ? 'locked' : ''}`}>
      {locationName}
    </span>
  );
};

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
