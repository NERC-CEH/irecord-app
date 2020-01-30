import appModel from 'app_model';
import { observer } from 'mobx-react';
import {
  IonList,
  IonItemOption,
  IonItem,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';
import PropTypes from 'prop-types';
import React from 'react';
import alert from 'common/helpers/alert';
import StringHelp from 'helpers/string';
import EditModal from './components/EditModal';
import './styles.scss';

/**
 * Sort the past locations placing favourites to the top.
 */
const sortFavLocationsToTop = (a, b) =>
  a.favourite === b.favourite ? 0 : a.favourite ? -1 : 1; // eslint-disable-line

function showDeletePopup(onDelete) {
  alert({
    header: t('Delete'),
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Delete'),
        cssClass: 'danger',
        handler: onDelete,
      },
    ],
  });
}

@observer
class Component extends React.Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
    onSelect: PropTypes.func,
  };

  state = {
    locations: [...this.props.appModel.attrs.locations],
    editLocation: false,
  };

  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  deleteLocation(locationId) {
    const onDelete = () => {
      appModel.removeLocation(locationId);
      this.setState({ locations: this.props.appModel.attrs.locations });
      this.listRef.current.closeSlidingItems();
    };

    showDeletePopup(onDelete);
  }

  selectLocation(locationId) {
    if (!this.props.onSelect) {
      return;
    }
    const location = this.state.locations.find(loc => loc.id === locationId);
    const locationCopy = { ...location };
    delete locationCopy.id;
    delete locationCopy.favourite;
    delete locationCopy.date;
    this.props.onSelect(locationCopy);
  }

  editLocation = locationId => {
    this.listRef.current.closeSlidingItems();

    const location = this.state.locations.find(({ id }) => id === locationId);
    const editLocation = { ...{}, ...location };
    this.setState({ editLocation });
  };

  editLocationSave = (name, favourite) => {
    if (!name) {
      this.setState({ editLocation: false });
      return;
    }

    const updatedLocation = { ...this.state.editLocation };
    updatedLocation.name = StringHelp.escape(name);
    updatedLocation.favourite = favourite;

    appModel.setLocation(updatedLocation);

    this.setState({
      locations: this.props.appModel.attrs.locations,
      editLocation: false,
    });
    this.listRef.current && this.listRef.current.closeSlidingItems();
  };

  getPastLocations = () => {
    if (!this.state.locations || !this.state.locations.length) {
      return (
        <IonList id="user-locations" ref={this.listRef}>
          <IonItem class="empty">
            <span>
              <p>{t('You have no previous locations.')}</p>
            </span>
          </IonItem>
        </IonList>
      );
    }

    function getPastLocation(location) {
      const locationStr = appModel.printLocation(location);
      const { id, name, favourite, source, latitude, longitude } = location;

      const lat = latitude.toFixed(3);
      const lon = longitude.toFixed(3);
      return (
        <IonItemSliding className="location" key={id}>
          <IonItem
            detail
            detailIcon={favourite ? star : starOutline}
            className={`location-favourite ${favourite ? 'on' : ''}`}
            onClick={() => this.selectLocation(id)}
          >
            <IonLabel className="details" position="stacked" mode="ios">
              <IonLabel slot="start">
                {name ? <strong>{name}</strong> : ''}
              </IonLabel>
              <IonLabel slot="start">{locationStr}</IonLabel>
              <IonLabel slot="start" className="location-raw">
                {`${lat}, ${lon}`}
              </IonLabel>
            </IonLabel>

            <IonLabel slot="end" position="stacked" mode="ios">
              <span className="location-source">
                {`${t('source')}: ${t(source)}`}
              </span>
            </IonLabel>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption
              color="danger"
              onClick={() => this.deleteLocation(id)}
            >
              {t('Delete')}
            </IonItemOption>
            <IonItemOption onClick={() => this.editLocation(id)}>
              {t('Edit')}
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    }
    const formattedLocations = this.state.locations
      .sort(sortFavLocationsToTop)
      .map(getPastLocation.bind(this));

    return (
      <IonList id="user-locations" ref={this.listRef}>
        {formattedLocations}
      </IonList>
    );
  };

  render() {
    return (
      <>
        {this.state.editLocation && (
          <EditModal
            location={this.state.editLocation}
            onLocationSave={this.editLocationSave}
          />
        )}
        <div className="info-message" id="previous-location-message">
          <p>
            {t('Here you can select or swipe to edit your previous locations')}
.
          </p>
        </div>
        {this.getPastLocations()}
      </>
    );
  }
}

export default Component;
