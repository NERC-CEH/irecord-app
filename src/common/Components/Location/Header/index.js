import React from 'react';
import ReactDOM from 'react-dom';
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
import AutoSuggestInput from 'Components/AutoSuggestInput';
import './styles.scss';

function isLocationLocked(appModel, disableLocationLock = false) {
  const currentLock = appModel.getAttrLock('smp', 'location');
  return !disableLocationLock && currentLock;
}

@observer
class Header extends React.Component {
  suggestionsRef = React.createRef();

  constructor(props) {
    super(props);

    const uniqueLocations = [
      ...new Set(this.props.appModel.attrs.locations.map(loc => loc.name)),
    ];
    this.lookup = uniqueLocations.map(val => ({ name: val }));
  }

  getLocationInput = () => {
    const {
      onManualGridrefChange,
      onLocationLockClick,
      location,
      appModel,
    } = this.props;

    const disableLocationLock = location.source === 'gps';

    const locationLocked = isLocationLocked(appModel, disableLocationLock);

    let value = location.gridref;

    // avoid testing location.longitude as this can validly be zero within the UK
    if ((!appModel.attrs.useGridRef || !value) && location.latitude) {
      value = `${location.latitude}, ${location.longitude}`;
    }

    return (
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
    );
  };

  renderSuggestionsContainer = ({ containerProps, children }) => {
    if (!this.suggestionsRef.current) {
      return null;
    }

    return ReactDOM.createPortal(
      <div {...containerProps}>{children}</div>,
      this.suggestionsRef.current
    );
  };

  getLocationNameInput = () => {
    const {
      onLocationNameChange,
      onNameLockClick,
      appModel,
      sample,
      location,
    } = this.props;

    if (!onLocationNameChange) {
      return null;
    }

    const { name } = location;

    const nameLocked = appModel.isAttrLocked(sample, 'locationName');

    return (
      <>
        <IonToolbar>
          <AutoSuggestInput
            placeholder={t('Nearest named place (e.g town, park)')}
            slot="start"
            debounce={300}
            default={{ name }}
            autocapitalize
            renderSuggestionsContainer={this.renderSuggestionsContainer}
            onChange={e => onLocationNameChange({ target: { value: e.name } })}
            onSuggestionSelected={e =>
              onLocationNameChange({ target: { value: e.name } })}
            config={{ lookup: this.lookup }}
          >
            <IonIcon icon={business} />
          </AutoSuggestInput>
          {onNameLockClick && (
            <IonButton fill="clear" slot="end" onClick={onNameLockClick}>
              <IonIcon
                icon={nameLocked ? lock : unlock}
                className={nameLocked ? 'locked' : ''}
              />
            </IonButton>
          )}
        </IonToolbar>
        <div ref={this.suggestionsRef} />
      </>
    );
  };

  render() {
    const { onLocationNameChange } = this.props;

    const showLocationNameToolbar = !!onLocationNameChange;
    const headerClass = !showLocationNameToolbar ? 'slim' : '';

    return (
      <IonHeader id="location-page-header" className={headerClass}>
        {this.getLocationInput()}
        {this.getLocationNameInput()}
      </IonHeader>
    );
  }
}

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
