import React from 'react';
import PropTypes from 'prop-types';

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

    let selection = this.props.selection;
    if (!selection) {
      selection = Object.keys(config.values).map(key => ({ value: key }));
      // add default
      config.default && selection.unshift({ value: config.default });
    }
    const selected = this.props.default || config.default;

    const inputs = selection.map((option, i) => (
      <ion-item key={i}>
        <ion-label>{t(option.label || option.value)}</ion-label>
        <ion-radio
          value={option.value}
          checked={option.value === selected}
          onClick={this.onChange}
        />
      </ion-item>
    ));

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{message}</p>
          </div>
        )}

        <ion-list lines="full">
          <ion-radio-group>{inputs}</ion-radio-group>
        </ion-list>
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
