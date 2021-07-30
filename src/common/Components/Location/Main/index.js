import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonLifeCycleContext } from '@ionic/react';
import AppMain from 'Components/Main';
import { observer } from 'mobx-react';
import map from './map';
import './styles.scss';

@observer
class AreaAttr extends Component {
  static contextType = IonLifeCycleContext;

  static propTypes = {
    sample: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    setLocation: PropTypes.func.isRequired,
    onGPSClick: PropTypes.func,
    onPastLocationsClick: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    this.context.onIonViewDidEnter(() => {
      map.invalidateSize();
    });

    const _getCurrentLocation = () => {
      return this.props.location;
    };

    map.init(
      this.props.onGPSClick,
      this.props.onPastLocationsClick,
      this.props.appModel,
      this.props.sample,
      this.props.setLocation,
      this.mapContainer.current,
      _getCurrentLocation
    );
  }

  componentDidUpdate(prevProps) {
    const { appModel, location } = this.props;
    if (prevProps.location !== location) {
      map.updateMapMarker(location, appModel);
      map._repositionMap(location.source === 'map');
    }
  }

  render() {
    const isGPSTracking = this.props.sample.isGPSRunning();

    return (
      <AppMain>
        <div
          id="location-page-content"
          className={isGPSTracking ? 'gps-running' : ''}
          ref={this.mapContainer}
        />
      </AppMain>
    );
  }
}

export default AreaAttr;
