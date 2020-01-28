import React from 'react';
import PropTypes from 'prop-types';
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

@observer
class Container extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
    history: PropTypes.object,
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

  updateLocationLock = (location, locationWasLocked) => {
    const { appModel } = this.props;

    const currentLock = appModel.getAttrLock('smp:location');

    // location
    if (location.source !== 'gps' && location.latitude) {
      const clonedLocation = JSON.parse(JSON.stringify(location));

      // remove location name as it is locked separately
      delete clonedLocation.name;

      // we can lock location and name on their own
      // don't lock GPS though, because it varies more than a map or gridref
      if (currentLock && (currentLock === true || locationWasLocked)) {
        // update locked value if attr is locked
        // check if previously the value was locked and we are updating
        Log('Updating lock.');
        appModel.setAttrLock('smp:location', clonedLocation);
      }
    } else if (currentLock === true) {
      // reset if no location or location name selected but locked is clicked
      appModel.unsetAttrLock('smp', 'location');
    }
  };

  onPastLocationsClick = () =>
    this.props.history.push(
      `/survey/default/${this.state.sample.cid}/edit/location/past`
    );

  onLocationLockClick = () => {
    Log('Location:Controller: executing onLocationLockClick.');
    const { appModel } = this.props;
    const { sample } = this.state;
    
    const isLocked = appModel.getAttrLock('smp', 'location');
    if (isLocked) {
      appModel.unsetAttrLock('smp', 'location');
      return;
    }

    const { name, ...location } = sample.attrs.location;
    if (!location) {
      return;
    }

    appModel.setAttrLock('smp', 'location', location);
  };

  onNameLockClick = () => {
    Log('Location:Controller: executing onNameLockClick.');
    const { appModel } = this.props;
    const { sample } = this.state;

    const isLocked = appModel.getAttrLock('smp', 'locationName');
    if (isLocked) {
      appModel.unsetAttrLock('smp', 'locationName');
      return;
    }

    const locationName = sample.attrs.location.name;
    if (!locationName) {
      return;
    }

    appModel.setAttrLock('smp', 'locationName', locationName);
  };

  setLocation = async loc => {
    const { appModel } = this.props;
    const { sample } = this.state;

    if (typeof loc !== 'object') {
      // jQuery event object bug fix
      // todo clean up if not needed anymore
      Log('Location:Controller:setLocation: loc is not an object.', 'e');
      return Promise.reject(new Error('Invalid location'));
    }

    // // check if we need custom location setting functionality
    // if (locationSetFunc) {
    //   return locationSetFunc(sample, loc);
    // }

    const oldLocation = sample.attrs.location || {};
    const location = { ...loc, ...{ name: oldLocation.name } };

    // we don't need the GPS running and overwriting the selected location
    if (sample.isGPSRunning()) {
      sample.stopGPS();
    }

    // save to past locations
    const savedLocation = await appModel.setLocation(location);
    if (savedLocation.id) {
      location.id = savedLocation.id;
    }

    sample.attrs.location = location;

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
      <IonPage id="survey-default-edit-location">
        <Header
          location={location}
          sample={sample}
          appModel={appModel}
          onNameLockClick={this.onNameLockClick}
          onLocationLockClick={this.onLocationLockClick}
          onManualGridrefChange={this.onManualGridrefChange}
          onLocationNameChange={this.onLocationNameChange}
        />
        <Main
          onPastLocationsClick={this.onPastLocationsClick}
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
