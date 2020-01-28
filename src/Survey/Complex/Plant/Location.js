import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import Log from 'helpers/log';
import Header from 'Components/Location/Header';
import Main from 'Components/Location/Main';
import {
  onManualGridrefChange,
  onLocationNameChange,
  onGPSClick,
} from 'Components/Location/utils';
import LocHelp from 'helpers/location';
import { message } from 'helpers/toast';

function showInvalidLocationMessage(squareSize) {
  const prettyName = LocHelp.gridref_accuracy[squareSize].label;
  message(t(`Selected location should be a ${prettyName}`));
}

/**
 * Updates child sample locations to match the parent (survey) sample.
 * @param sample
 */
function updateChildrenLocations(sample) {
  sample.samples.forEach(child => {
    const loc = child.attrs.location;

    // the child must not have any location
    if (loc.latitude) {
      throw new Error('Child location has a location set already.');
    }

    const location = _.cloneDeep(sample.attrs.location);
    delete location.name;
    child.attrs.location = location;
  });
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

    this.state = {
      sample: this.props.savedSamples.find(
        ({ cid }) => cid === this.props.match.params.id
      ),
    };

    this.onManualGridrefChange = onManualGridrefChange.bind(this);
    this.onLocationNameChange = onLocationNameChange.bind(this);
    this.onGPSClick = onGPSClick.bind(this);
  }

  /**
   * Sets new sample location and if a full location (+name) then sets that
   * to the child samples.
   * @param sample
   * @param loc
   * @param reset
   * @returns {Promise.<T>}
   */
  setLocation = async (loc, reset) => {
    const { appModel } = this.props;
    const { sample } = this.state;

    // 1st validation of location accuracy
    let { gridSquareUnit } = sample.metadata;
    if (!LocHelp.checkGridType(loc, gridSquareUnit)) {
      // check if the grid unit has been changed and it matches the new unit
      // or this is the first time we are setting a location
      gridSquareUnit = appModel.attrs.gridSquareUnit;
      if (!LocHelp.checkGridType(loc, gridSquareUnit)) {
        showInvalidLocationMessage(gridSquareUnit);
        return Promise.resolve();
      }
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

    // set the gridSquareUnit so that future changes in the settings don't change that;
    sample.metadata.gridSquareUnit = gridSquareUnit; // eslint-disable-line

    sample.attrs.location = location;

    // 2nd validation of the location name
    if (location.name) {
      updateChildrenLocations(sample);
    }

    return sample.save().catch(error => {
      Log(error, 'e');
      // radio.trigger('app:dialog:error', error);
    });
  };

  render() {
    const { appModel } = this.props;
    const { sample } = this.state;

    const location = sample.attrs.location || {};

    return (
      <IonPage id="survey-complex-plant-edit-location">
        <Header
          location={location}
          sample={sample}
          appModel={appModel}
          onManualGridrefChange={this.onManualGridrefChange}
          onLocationNameChange={this.onLocationNameChange}
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
