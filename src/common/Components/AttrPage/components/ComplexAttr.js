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

    return attrConfig.groupConfig.map((config, index) => {
      const [, attrName] = attrConfig.group[index].split(':');
      return (
        <Attr
          key={attrName}
          attrConfig={config}
          controlled
          onValueChange={(newValue, exit) =>
            this.onValueChange({ [attrName]: newValue }, exit)}
          initialVal={this.state.initialVal[attrName]}
        />
      );
    });
  }
}

Component.propTypes = {
  attrConfig: PropTypes.object.isRequired,
  initialVal: PropTypes.array.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default Component;
