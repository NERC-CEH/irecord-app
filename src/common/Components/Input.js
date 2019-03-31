/**
 * Input view.
 */
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import StringHelp from 'helpers/string';
import PropTypes from 'prop-types';
import React from 'react';

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.state = { value: props.default || props.config.default };

    if (props.type === 'date') {
      this.state.value = DateHelp.toDateInputValue(this.state.value);
    }
  }

  onChange = e => {
    this.setState({ value: e.target.value });

    const value = this.processValue(e.target.value);
    if (value) {
      this.props.onChange(value);
    }
  };

  processValue = value => {
    const valid = this.validate(value);
    if (!valid) {
      return null;
    }

    if (this.type === 'date') {
      const date = new Date(value);
      if (DateHelp.validate(date)) {
        return date;
      }
    }

    return StringHelp.escape(value);
  };

  validate(value) {
    if (this.props.validate) {
      const valid = this.props.validate(value);
      if (!valid) {
        return false;
      }
    }

    if (this.type === 'date') {
      return DateHelp.validate(new Date(value));
    }

    return true;
  }

  componentDidMount() {
    this.input.current.focus();
    if (window.cordova && Device.isAndroid()) {
      const config = this.props.config || {};
      const type = this.props.type || config.type;
      if (type === 'date') {
        const options = {
          date: new Date(this.state.value),
          mode: 'date',
          androidTheme: 16974373,
          allowOldDates: true,
          allowFutureDates: false,
        };

        window.datePicker.show(options, date => {
          this.onChange({
            target: { value: DateHelp.toDateInputValue(new Date(date)) },
          });
        });
        return;
      }

      window.Keyboard.show();
      this.input.current.onfocusout = () => {
        window.Keyboard.hide();
      };
    }
  }

  render() {
    const config = this.props.config || {};
    const type = this.props.type || config.type || 'text';
    let max = this.props.max || config.max;
    if (typeof max === 'function') {
      max = max();
      if (type === 'date') {
        max = max.toJSON().split('T')[0];
      }
    }
    const message = this.props.info || config.info;

    const className = this.props.typeahead ? 'typeahead' : '';
    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{message}</p>
          </div>
        )}
        <div className="input-group">
          <input
            ref={this.input}
            onChange={this.onChange}
            type={type}
            className={className}
            max={max}
            value={this.state.value}
          />
        </div>
      </div>
    );
  }
}

Component.propTypes = {
  default: PropTypes.any,
  config: PropTypes.any.isRequired,
  info: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  validate: PropTypes.func,
  max: PropTypes.any,
  typeahead: PropTypes.func,
  type: PropTypes.string.isRequired,
};

export default Component;
