import React from 'react';
import PropTypes from 'prop-types';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { lock, unlock, business, pin } from 'ionicons/icons';
import { observer } from 'mobx-react';
import './styles.scss';

// onLocationChange() {
//   Log('Location:Controller:MainViewHeader: on location change.');
//   const location = this._getCurrentLocation();

//   if (location.source !== 'gridref') {
//     this.render();
//     return;
//   }

//   this.updateLocks();
//   this._clearGrTimeout();
//   this._refreshGrErrorState(false);
//   this._refreshGridRefElement(location);
// },

// /**
//  * Attaches suggestions to the location name search.
//  */
// onAttach() {
//   const appModel = this.model.get('appModel');
//   const strs = appModel.get('locations');

//   this.$el.find('.typeahead').typeahead(
//     {
//       hint: false,
//       highlight: false,
//       minLength: 0,
//     },
//     {
//       limit: 3,
//       name: 'names',
//       source: typeaheadSearchFn(strs, 3, a => a.name),
//     }
//   );
// },

// changeName(e) {
//   this.triggerMethod('name:change', $(e.target).val());
// },

// blurInput() {
//   this.triggerMethod('input:blur');
// },

// /**
//  * after delay, if gridref is valid then apply change
//  */

// /**
//  * stop any delayed gridref refresh
//  */
// _clearGrTimeout() {
//   Log('Location:MainView:Header: executing _clearGrTimeout.');

//   if (this.grRefreshTimeout) {
//     clearTimeout(this.grRefreshTimeout);
//     this.grRefreshTimeout = null;
//   }
// },

// changeGridRef(e) {
//   Log('Location:MainView:Header: executing changeGridRef.');

//   this._clearGrTimeout();
//   this.triggerMethod('gridref:change', $(e.target).val());
// },

// _refreshGrErrorState(isError) {
//   const grInputEl = document.getElementById('location-gridref');
//   if (grInputEl) {
//     if (isError) {
//       grInputEl.setAttribute('data-gr-error', 'error');
//       // this._removeMapMarker();
//     } else {
//       grInputEl.removeAttribute('data-gr-error');
//     }
//   }
// },

// updateLocks() {
//   Log('Location:MainView:Header: updating the locks.');

//   const appModel = this.model.get('appModel');
//   const sample = this.model.get('sample');
//   const location = sample.attrs.location || {};

//   // location lock
//   const $locationLockBtn = this.$el.find('#location-lock-btn');

//   const disableLocationLock = location.source === 'gps';
//   const locationLocked = this.isLocationLocked(disableLocationLock);

function isLocationLocked(appModel, disableLocationLock = false) {
  const currentLock = appModel.getAttrLock('smp', 'location');
  return !disableLocationLock && currentLock;
}
const Header = observer(
  ({
    sample,
    appModel,
    location,
    onManualGridrefChange,
    onNameLockClick,
    onLocationLockClick,
    onLocationNameChange,
  }) => {
    // this.locationInitiallyLocked = appModel.isAttrLocked(
    //   sample,
    //   'location',
    //   null,
    //   sample.getSurvey()
    // );

    let value = location.gridref;
    const { name } = location;

    // avoid testing location.longitude as this can validly be zero within the UK
    if ((!appModel.attrs.useGridRef || !value) && location.latitude) {
      value = `${location.latitude}, ${location.longitude}`;
    }

    const disableLocationLock = location.source === 'gps';

    const locationLocked = isLocationLocked(appModel, disableLocationLock);
    const nameLocked = appModel.isAttrLocked(sample, 'locationName');

    const showLocationNameToolbar = !!onLocationNameChange;

    return (
      <IonHeader
        id="location-page-header"
        className={!showLocationNameToolbar ? 'slim' : ''}
      >
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text={t('')} defaultHref="/" />
          </IonButtons>
          <IonInput
            placeholder={t('Grid Reference')}
            slot="start"
            debounce={300}
            value={value}
            onInput={onManualGridrefChange}
          >
            <IonIcon icon={pin} />
          </IonInput>
          {onLocationLockClick && (
            <IonButton fill="clear" slot="end" onClick={onLocationLockClick}>
              <IonIcon
                icon={locationLocked ? lock : unlock}
                className={locationLocked ? 'locked' : ''}
              />
            </IonButton>
          )}
        </IonToolbar>
        {showLocationNameToolbar && (
          <IonToolbar>
            <IonInput
              placeholder={t('Nearest named place (e.g town, park)')}
              slot="start"
              debounce={300}
              value={name}
              onIonChange={onLocationNameChange}
            >
              <IonIcon icon={business} />
            </IonInput>
            {onNameLockClick && (
              <IonButton fill="clear" slot="end" onClick={onNameLockClick}>
                <IonIcon
                  icon={nameLocked ? lock : unlock}
                  className={nameLocked ? 'locked' : ''}
                />
              </IonButton>
            )}
          </IonToolbar>
        )}
      </IonHeader>
    );
  }
);

Header.propTypes = {
  sample: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  onManualGridrefChange: PropTypes.func.isRequired,
  onLocationNameChange: PropTypes.func,
  onNameLockClick: PropTypes.func,
  onLocationLockClick: PropTypes.func,
};

export default Header;
