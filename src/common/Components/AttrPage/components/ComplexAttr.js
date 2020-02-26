import React from 'react';
import PropTypes from 'prop-types';
import Attr from './Attr';

class Component extends React.Component {
  state = { initialVal: this.props.initialVal };

  onValueChange = (value, exit) => {
    const { attrConfig, onValueChange } = this.props;

    const valuePlaceholder = attrConfig.group.reduce((agg, attrFullName) => {
      const [, attrName] = attrFullName.split(':');
      agg[attrName] = null; // eslint-disable-line
      return agg;
    }, {});

    const fullValue = { ...valuePlaceholder, ...value };

    this.setState({ initialVal: fullValue });
    onValueChange(fullValue, exit);
  };

  render() {
    const { attrConfig } = this.props;
    const hasValue = Object.values(this.state.initialVal).find(val => val);

    const attr = attrConfig.groupConfig.map((config, index) => {
      const [, attrName] = attrConfig.group[index].split(':');
      const fullConfig = { ...config, ...{ dontAutoSetDefault: hasValue } };
      return (
        <Attr
          key={attrName}
          attrConfig={fullConfig}
          controlled
          onValueChange={(newValue, exit) =>
            this.onValueChange({ [attrName]: newValue }, exit)}
          initialVal={this.state.initialVal[attrName]}
        />
      );
    });

    const message = attrConfig.info;
    return (
      <>
        {message && (
          <div className="info-message">
            <p>{t(message)}</p>
          </div>
        )}
        {attr}
      </>
    );
  }
}

Component.propTypes = {
  attrConfig: PropTypes.object.isRequired,
  initialVal: PropTypes.array.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default Component;
