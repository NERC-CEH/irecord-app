import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Toggle extends Component {
  constructor(props) {
    super(props);
    this.toggleRef = React.createRef();
    this.onToggle = this.onToggle.bind(this);
  }

  onToggle(e) {
    const checked = e.target.checked;
    this.props.onToggle(checked);
  }

  componentDidMount() {
    this.toggleRef.current.addEventListener('ionChange', this.onToggle);
  }

  componentWillUnmount() {
    this.toggleRef.current.removeEventListener('ionChange', this.onToggle);
  }

  render() {
    return (
      <ion-toggle
        ref={this.toggleRef}
        slot="end"
        disabled={this.props.disabled}
        checked={this.props.checked}
      />
    );
  }
}

Toggle.propTypes = {
  onToggle: PropTypes.func.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Toggle;
