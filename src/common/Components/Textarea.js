import Device from 'helpers/device';
import StringHelp from 'helpers/string';
import PropTypes from 'prop-types';
import React from 'react';

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.state = { value: this.props.default || this.props.config.default };
  }

  onChange = e => {
    e.persist();
    this.setState({ value: e.target.value });
    const value = StringHelp.escape(e.target.value);
    this.props.onChange(value);
  };

  componentDidMount() {
    this.input.current.focus();
    if (window.cordova && Device.isAndroid()) {
      window.Keyboard.show();
      this.input.current.onfocusout = () => {
        window.Keyboard.hide();
      };
    }
  }

  render() {
    const config = this.props.config || {};
    const message = this.props.info || config.info;

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{message}</p>
          </div>
        )}
        <div className="input-group">
          <textarea
            ref={this.input}
            value={this.state.value}
            cols="80"
            rows="16"
            onChange={this.onChange}
            autoFocus
          />
        </div>
      </div>
    );
  }
}

Component.propTypes = {
  default: PropTypes.string,
  config: PropTypes.any.isRequired,
  info: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default Component;
