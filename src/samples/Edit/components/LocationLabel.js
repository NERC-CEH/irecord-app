import React from 'react';
import PropTypes from 'prop-types';
import StringHelp from 'helpers/string';
import { observer } from 'mobx-react';

function getLocationName(sample, locks) {
  const location = sample.get('location') || {};
  const locationName = StringHelp.limit(location.name);

  if (!locationName) {
    return (
      <span slot="end" className="descript long error">
        {t('Name missing')}
      </span>
    );
  }

  return (
    <span
      slot="end"
      className={`descript long ${locks['smp:locationName'] ? 'lock' : ''}`}>
      {locationName}
    </span>
  );
}

function getLocation(sample, locks) {
  const locationPretty = StringHelp.limit(sample.printLocation());
  const isLocating = sample.isGPSRunning();
  if (isLocating) {
    return (
      <span slot="end" className="descript long warn">
        {t('Locating')}...
      </span>
    );
  }

  if (!locationPretty) {
    return (
      <span slot="end" className="descript long error">
        {t('Location missing')}
      </span>
    );
  }

  return (
    <span
      slot="end"
      className={`location long descript ${
        locks['smp:location'] ? 'lock' : ''
      }`}>
      {locationPretty}
    </span>
  );
}

@observer
class LocationLabel extends React.Component {
  render() {
    const { sample, locks } = this.props;

    return (
      <React.Fragment>
        {getLocation(sample, locks)}
        {getLocationName(sample, locks)}
      </React.Fragment>
    );
  }
}

LocationLabel.propTypes = {
  sample: PropTypes.object.isRequired,
  locks: PropTypes.object.isRequired,
};
export default LocationLabel;
