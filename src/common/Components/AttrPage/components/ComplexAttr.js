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

  getMessage = () => {
    const { info } = this.props.attrConfig;
    if (!info) {
      return null;
    }

    return (
      <div className="info-message">
        <p>{t(info)}</p>
      </div>
    );
  };

  getAttribute = (config, index) => {
    const { attrConfig } = this.props;

    const hasValue = Object.values(this.state.initialVal).find(val => val);

    const [, attrName] = attrConfig.group[index].split(':');

    // TODO: we need to make sure that the config exists, empty shouldn't be allowed
    const cleanConfig = JSON.parse(JSON.stringify(config || {}));
    const disallowDefault = cleanConfig.values instanceof Array && hasValue;
    if (disallowDefault) {
      const defaultVal = cleanConfig.values.find(({ isDefault }) => isDefault);
      defaultVal.preventDefaultAutoSelect = true;
    }

    return (
      <Attr
        key={attrName}
        attrConfig={cleanConfig}
        controlled
        onValueChange={(newValue, exit) =>
          this.onValueChange({ [attrName]: newValue }, exit)}
        initialVal={this.state.initialVal[attrName]}
      />
    );
  };

  render() {
    const { attrConfig } = this.props;

    const attributesList = attrConfig.groupConfig.map(this.getAttribute);

    return (
      <>
        {this.getMessage()}
        {attributesList}
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
