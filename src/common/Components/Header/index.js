import React from 'react';
import PropTypes from 'prop-types';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
} from '@ionic/react';
import Device from 'helpers/device';
import './styles.scss';

// eslint-disable-next-line
export function AppHeaderBand({ title, activity }) {
  if (Device.isAndroid()) {
    return (
      <IonToolbar className={`app-header-band ${activity ? 'activity' : ''}`}>
        <IonTitle slot="start">{/* Placeholder only */}</IonTitle>
        <IonTitle size="small" slot="start">
          {title}
        </IonTitle>
      </IonToolbar>
    );
  }

  return (
    <IonToolbar className={`app-header-band ${activity ? 'activity' : ''}`}>
      <IonTitle size="small">{title}</IonTitle>
    </IonToolbar>
  );
}

const Header = ({
  title,
  subheader,
  onLeave,
  rightSlot,
  defaultHref,
  _defaultToEdit,
}) => {
  if (_defaultToEdit) {
    const baseUrl = _defaultToEdit.split('/edit/')[0];
    defaultHref = `${baseUrl}/edit`; // eslint-disable-line
  }

  return (
    <IonHeader className="app-header">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton
            text={t('Back')}
            defaultHref={defaultHref || '/'}
            {...(onLeave ? { onClick: onLeave } : {})} // for some reason passing null/undefined still takes the onClick handler
          />
        </IonButtons>

        <IonTitle>{title}</IonTitle>

        {rightSlot && <IonButtons slot="end">{rightSlot}</IonButtons>}
      </IonToolbar>

      {subheader}
    </IonHeader>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  defaultHref: PropTypes.string,
  onLeave: PropTypes.func,
  _defaultToEdit: PropTypes.string, // fixes sub-model navigation back when arrived with history.replace
  rightSlot: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  subheader: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Header;
