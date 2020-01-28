import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import bigu from 'bigu';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import Log from 'helpers/log';
import { message } from 'helpers/toast';
import Header from 'Components/Location/Header';
import Main from 'Components/Location/Main';
import {
  onManualGridrefChange,
  onLocationNameChange,
  onGPSClick,
} from 'Components/Location/utils';

function showInvalidLocationMessage(sample) {
  const { gridref } = sample.parent.attrs.location;
  message(t(`Selected location should be within ${gridref}`));
}

@observer
class Container extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
    appModel: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.surveySample = this.props.savedSamples.find(
      ({ cid }) => cid === this.props.match.params.id
    );

    const sample = this.surveySample.samples.find(
      ({ cid }) => cid === this.props.match.params.smpId
    );

    this.state = {
      sample,
    };

    this.onManualGridrefChange = onManualGridrefChange.bind(this);
    this.onLocationNameChange = onLocationNameChange.bind(this);
    this.onGPSClick = onGPSClick.bind(this);
  }

  /**
   * Sets location for the sample.
   * @param sample
   * @param loc
   * @param reset
   * @returns {Promise.<T>}
   */
  setLocation = async (loc, reset) => {
    const { appModel } = this.props;
    const { sample } = this.state;

    // validate this new location
    const valid = this.validateLocation(loc);
    if (!valid) {
      showInvalidLocationMessage(sample);
      return Promise.resolve();
    }

    let location = loc;
    // we don't need the GPS running and overwriting the selected location
    if (sample.isGPSRunning()) {
      sample.stopGPS();
    }

    if (!reset) {
      // extend old location to preserve its previous attributes like name or id
      let oldLocation = sample.attrs.location;
      if (!_.isObject(oldLocation)) {
        oldLocation = {};
      } // check for locked true
      location = { ...oldLocation, ...location };
    }

    // save to past locations
    const savedLocation = await appModel.setLocation(location);
    if (savedLocation.id) {
      location.id = savedLocation.id;
    }

    sample.attrs.location = location;

    return sample.save().catch(error => {
      Log(error, 'e');
    });
  };

  validateLocation = location => {
    const { sample } = this.state;

    const gridCoords = bigu.latlng_to_grid_coords(
      location.latitude,
      location.longitude
    );

    if (!gridCoords) {
      return false;
    }

    const parentGridref = sample.parent.attrs.location.gridref;
    const parentParsedRef = bigu.GridRefParser.factory(parentGridref);

    if (location.gridref.length < parentGridref.length) {
      return false;
    }

    return gridCoords.to_gridref(parentParsedRef.length) === parentGridref;
  };

  render() {
    const { appModel } = this.props;
    const { sample } = this.state;

    const location = sample.attrs.location || {};

    return (
      <IonPage id="survey-complex-plant-edit-subsample-location">
        <Header
          location={location}
          sample={sample}
          appModel={appModel}
          onManualGridrefChange={this.onManualGridrefChange}
        />
        <Main
          location={location}
          sample={sample}
          appModel={appModel}
          onGPSClick={this.onGPSClick}
          setLocation={this.setLocation}
        />
      </IonPage>
    );
  }
}

export default Container;
