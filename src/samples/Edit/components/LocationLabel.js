import React from 'react';
import PropTypes from 'prop-types';
import StringHelp from 'helpers/string';
import { observer } from 'mobx-react';

@observer
class LocationLabel extends React.Component {
  render() {
    const { sample, locks } = this.props;
    const location = sample.get('location') || {};
    const locationPretty = StringHelp.limit(sample.printLocation());
    const locationName = StringHelp.limit(location.name);
    const isLocating = sample.isGPSRunning();

    function getLocation() {
      if (isLocating) {
        return (
          <span slot="end" className="descript long warn">
            {t('Locating')}...
          </span>
        );
      }

      if (locationPretty) {
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

      return (
        <span slot="end" className="descript long error">
          {t('Location missing')}
        </span>
      );
    }

    function getLocationName() {
      if (locationName) {
        return (
          <span
            slot="end"
            className={`descript long ${
              locks['smp:locationName'] ? 'lock' : ''
            }`}>
            {locationName}
          </span>
        );
      }
      return (
        <span slot="end" className="descript long error">
          {t('Name missing')}
        </span>
      );
    }
    return (
      <React.Fragment>
        {getLocation()}
        {getLocationName()}
      </React.Fragment>
    );
  }
}

LocationLabel.propTypes = {
  sample: PropTypes.object.isRequired,
  locks: PropTypes.object.isRequired,
};
export default LocationLabel;
