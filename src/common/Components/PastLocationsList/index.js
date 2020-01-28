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
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import alert from 'common/helpers/alert';
import './styles.scss';

/**
 * Sort the past locations placing favourites to the top.
 */
const sortFavLocationsToTop = (a, b) =>
  a.favourite === b.favourite ? 0 : a.favourite ? -1 : 1; // eslint-disable-line

function showEditPopup(location, onSave) {
  const { name, favourite } = location;

  alert({
    header: t('Edit'),
    message: `
    <ion-list lines="full">
      <ion-item>
        <ion-label>${t('Name')}</ion-label>
        <ion-input
          id="location-name"
          type="text"
          placeholder="${t('Name')}"
          value="${name}"
          defaultValue="123"
          value="123"
        />
      </ion-item>
      <ion-item>
        <ion-label>${t('Favourite')}</ion-label>
        <ion-toggle slot="end" id="favourite-btn" ${
  favourite ? 'checked' : ''
} />
      </ion-item>
    </ion-list>
    `,

    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Save'),
        cssClass: 'danger',
        handler: () => {
          const newName = document.getElementById('location-name').value;
          const isFavourite = document.getElementById('favourite-btn').checked;

          onSave(StringHelp.escape(newName), isFavourite);
        },
      },
    ],
  });
}

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

  state = { locations: [...this.props.appModel.attrs.locations] };

  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  editLocation(locationId) {
    const updatedLocation = {
      ...{},
      ...this.state.locations.find(({ id }) => id === locationId),
    };

    const onEdit = (newName, isFavourite) => {
      updatedLocation.name = StringHelp.escape(newName);
      updatedLocation.favourite = isFavourite;
      appModel.setLocation(updatedLocation);

      this.setState({ locations: this.props.appModel.attrs.locations });
      this.listRef.current && this.listRef.current.closeSlidingItems();
    };

    showEditPopup(updatedLocation, onEdit);
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

  componentWillUnmount() {
    if (this.listRef.current) {
      this.listRef.current.closeSlidingItems();
    }
  }

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
      const { id, name, favourite, source, date } = location;
      const dateStr = date ? DateHelp.print(date, true) : '';

      return (
        <IonItemSliding className="location" key={id}>
          <IonItem
            detail
            detailIcon={favourite ? star : starOutline}
            onClick={() => this.selectLocation(id)}
          >
            <IonLabel position="stacked">
              <IonLabel slot="start">
                {name ? <strong>{name}</strong> : ''}
              </IonLabel>
              <IonLabel slot="start">{locationStr}</IonLabel>
              <IonLabel slot="start">
                <span className="location-date">{dateStr}</span>
              </IonLabel>
            </IonLabel>

            <IonLabel slot="end" position="stacked">
              <span
                className={`location-favourite icon icon-star ${
                  favourite ? 'on' : ''
                }`}
              />
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
