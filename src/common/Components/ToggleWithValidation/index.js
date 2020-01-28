import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import Toggle from 'Components/Toggle';
import './styles.scss';

const ToggleWithValidation = ({
  name,
  label,
  icon,
  setFieldValue,
  values,
  errors,
  touched,
}) => {
  const error = errors[name] && touched[name];
  return (
    <>
      <IonItem error={!!error}>
        <IonIcon icon={icon} faint size="small" slot="start" />
        <IonLabel class="ion-text-wrap">{label}</IonLabel>
        <Toggle
          checked={values[name]}
          onToggle={val => setFieldValue(name, val)}
          name={name}
        />
      </IonItem>
      {error && (
        <div className="error-container">
          <div className="error-message">
            <IonIcon
              icon={informationCircleOutline}
              faint
              size="small"
              slot="start"
            />
            <span>{t(errors[name])}</span>
          </div>
        </div>
      )}
    </>
  );
};

ToggleWithValidation.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
  icon: PropTypes.object,
  setFieldValue: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
};
export default ToggleWithValidation;
