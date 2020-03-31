import React from 'react';
import PropTypes from 'prop-types';
import {
  IonItem,
  IonLabel,
  IonList,
  IonRadioGroup,
  IonRadio,
  IonItemDivider,
} from '@ionic/react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

class Component extends React.PureComponent {
  onChange = e => {
    const { onChange } = this.props;
    onChange(e.target.value);
  };

  getMessage() {
    const { info } = this.props;

    if (!info) {
      return null;
    }

    return (
      <div className="info-message">
        <p>
          <T>{info}</T>
        </p>
      </div>
    );
  }

  render() {
    const { values, currentValue } = this.props;

    const getInput = ({
      label,
      value,
      isDefault,
      isPlaceholder,
      preventDefaultAutoSelect,
    }) => {
      if (isPlaceholder) {
        return (
          <IonItemDivider key={label}>
            <IonLabel>{label}</IonLabel>
          </IonItemDivider>
        );
      }

      const className = isDefault ? 'radio-input-default-option' : '';

      const matchesCurrentValue = value && value === currentValue;
      const matchesDefault =
        isDefault && !currentValue && !preventDefaultAutoSelect;

      const checked = matchesDefault || matchesCurrentValue;

      return (
        <IonItem key={label || value} className={className}>
          <IonLabel class="ion-text-wrap normal-font-size">
            <T>{label || value}</T>
          </IonLabel>
          <IonRadio value={value} checked={checked} onClick={this.onChange} />
        </IonItem>
      );
    };

    const inputs = values.map(getInput);

    return (
      <div>
        {this.getMessage()}

        <IonList lines="full">
          <IonRadioGroup>{inputs}</IonRadioGroup>
        </IonList>
      </div>
    );
  }
}

Component.propTypes = {
  values: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  currentValue: PropTypes.any,
  info: PropTypes.string,
};

export default Component;
