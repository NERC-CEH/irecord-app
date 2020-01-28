import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonInput, IonItem } from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import './styles.scss';

const InputWithValidation = ({
  name,
  type,
  placeholder,
  icon,
  handleChange,
  handleBlur,
  values,
  errors,
  children,
  touched,
}) => {
  const error = errors[name] && touched[name];
  return (
    <>
      <IonItem error={!!error}>
        <IonIcon icon={icon} faint size="small" slot="start" />
        <IonInput
          type={type}
          placeholder={placeholder}
          onIonChange={handleChange}
          onIonBlur={handleBlur}
          value={values[name]}
          name={name}
        />
        {children}
      </IonItem>
      {error && (
        <div className="error-container">
          <div className="error-message">
            <IonIcon
              icon={informationCircleOutline}
              role="img"
              class="hydrated"
              aria-label="information circle outline"
            />
            <span>{t(errors[name])}</span>
          </div>
        </div>
      )}
    </>
  );
};

InputWithValidation.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  icon: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
export default InputWithValidation;
