/* eslint-disable @getify/proper-arrows/name */
import * as React from 'react';
import { useMap } from 'react-leaflet';
import { withIonLifeCycle, IonIcon, NavContext } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import GPS from 'helpers/GPS';
import L from 'leaflet';
import MapControl from 'Components/MapControl';

const DEFAULT_LOCATED_ZOOM = 18;

class MapInfo extends React.Component {
  static contextType = NavContext;

  state = {
    locating: false,
  };

  // TODO: needs proper memory clean up instead of this
  _leaving = false;

  // eslint-disable-next-line react/no-unused-class-component-methods
  ionViewDidEnter = () => {
    const { map } = this.props;

    const refreshMap = () => {
      map.invalidateSize();
    };

    !this._leaving && map.whenReady(refreshMap);
  };

  componentWillUnmount() {
    this._leaving = true;

    if (this.state.locating) {
      this.stopGPS();
    }
  }

  stopGPS = () => {
    GPS.stop(this.state.locating);
    this.setState({ locating: false });
  };

  startGPS = () => {
    const startGPS = async (resolve, reject) => {
      const callback = (error, location) => {
        this.stopGPS();

        if (error) {
          reject(error);
          return;
        }

        resolve(location);
      };

      const locatingJobId = await GPS.start({ callback });
      this.setState({ locating: locatingJobId });
    };

    return new Promise(startGPS);
  };

  onGeolocate = async () => {
    if (this.state.locating) {
      this.stopGPS();
      return;
    }
    const location = await this.startGPS();
    const { map } = this.props;

    map.setView(
      new L.LatLng(location.latitude, location.longitude),
      DEFAULT_LOCATED_ZOOM
    );
  };

  render() {
    return (
      <MapControl position="topleft" className="user-map-gps-button">
        <button
          className={`geolocate-btn ${this.state.locating ? 'spin' : ''}`}
          onClick={this.onGeolocate}
        >
          <IonIcon icon={locateOutline} mode="md" size="large" />
        </button>
      </MapControl>
    );
  }
}

function withMap(Component) {
  return function WrappedComponent(props) {
    const map = useMap();
    return <Component {...props} map={map} />;
  };
}

export default withMap(withIonLifeCycle(MapInfo));
