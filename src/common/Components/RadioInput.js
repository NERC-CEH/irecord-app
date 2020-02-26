import React from 'react';
import PropTypes from 'prop-types';
import {
  IonItemDivider,
  IonItem,
  IonLabel,
  IonList,
  IonRadioGroup,
  IonRadio,
} from '@ionic/react';

class Component extends React.PureComponent {
  onChange = e => {
    const { value } = e.target;

    if (value === this.props.config.default) {
      // reset if default
      this.props.onChange(null);
      return;
    }

    this.props.onChange(value);
  };

  render() {
    const config = this.props.config || {};

    const message = this.props.info || config.info;

    let { selection } = this.props;
    if (!selection) {
      selection = Object.keys(config.values).map(key => ({ value: key }));
      // add default
      config.default && selection.unshift({ value: config.default });
    }
    let selected = this.props.default;
    if (!selected && !config.dontAutoSetDefault) {
      selected = config.default;
    }

    const inputs = selection.map(option => (
      <IonItem key={option.label || option.value}>
        <IonLabel class="ion-text-wrap normal-font-size">
          {t(option.label || option.value)}
        </IonLabel>
        <IonRadio
          value={option.value}
          checked={option.value === selected}
          onClick={this.onChange}
        />
      </IonItem>
    ));

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{t(message)}</p>
          </div>
        )}

        <IonList lines="full">
          <IonRadioGroup>{inputs}</IonRadioGroup>
        </IonList>
      </div>
    );
  }
}

Component.propTypes = {
  default: PropTypes.string,
  config: PropTypes.any.isRequired,
  info: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  selection: PropTypes.array,
};

export default Component;
