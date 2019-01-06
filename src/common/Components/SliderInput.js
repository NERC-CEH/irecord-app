import PropTypes from 'prop-types';
import React from 'react';

// http://stackoverflow.com/questions/846221/logarithmic-slider
function LogSlider(options = {}) {
  this.minpos = options.minpos || 0;
  this.maxpos = options.maxpos || 100;
  this.minlval = Math.log(options.minval || 1);
  this.maxlval = Math.log(options.maxval || 100000);

  this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
  // Calculate value from a slider position
  value(position) {
    return Math.floor(
      Math.exp((position - this.minpos) * this.scale + this.minlval)
    );
  },
  // Calculate slider position from a value
  position(value) {
    return Math.floor(
      this.minpos + (Math.log(value) - this.minlval) / this.scale
    );
  },
};

const logsl = new LogSlider({ maxpos: 100, minval: 1, maxval: 500 });

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.sliderRef = React.createRef();
    this.inputRef = React.createRef();
    const value = props.default;
    this.state = {
      value,
      position: logsl.position(value || 1).toFixed(0),
    };
  }

  onChangeInput = e => {
    let value = parseInt(e.target.value, 10);
    if (Number.isNaN(value)) {
      value = null;
    }

    const position = value > 0 ? logsl.position(value) : null;
    if (this.state.sliderUpdating) {
      this.setState({ value, sliderUpdating: false });
    } else {
      this.setState({ position, value, inputUpdating: true });
      this.props.onChange(value);
    }
  };

  onChangeSlider = e => {
    let position = parseInt(e.target.value, 10);
    if (Number.isNaN(position)) {
      position = null;
    }

    const value = position > 0 ? logsl.value(position) : null;
    if (this.state.inputUpdating) {
      this.setState({ position, inputUpdating: false });
    } else {
      this.setState({ position, value, sliderUpdating: true });
      this.props.onChange(value);
    }
  };

  componentDidMount() {
    this.sliderRef.current.addEventListener('ionChange', this.onChangeSlider);
    this.inputRef.current.addEventListener('ionChange', this.onChangeInput);
  }

  componentWillUnmount() {
    this.sliderRef.current.removeEventListener(
      'ionChange',
      this.onChangeSlider
    );
    this.inputRef.current.removeEventListener('ionChange', this.onChangeInput);
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
        <ion-item>
          <ion-range
            ref={this.sliderRef}
            min="1"
            max="100"
            onChange={this.onChangeSlider}
            value={this.state.position || 1}
          />
          <input
            ref={this.inputRef}
            style={{ width: '5%', minWidth: '60px' }}
            type="number"
            onChange={this.onChangeInput}
            value={this.state.value || ''}
          />
        </ion-item>
      </div>
    );
  }
}

Component.propTypes = {
  default: PropTypes.number,
  config: PropTypes.any.isRequired,
  info: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Component;
