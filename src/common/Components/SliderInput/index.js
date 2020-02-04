import React from 'react';
import PropTypes from 'prop-types';
import { IonItem, IonRange, IonButton, IonIcon } from '@ionic/react';
import { removeCircleOutline, addCircleOutline } from 'ionicons/icons';
import './styles.scss';

// http://stackoverflow.com/questions/846221/logarithmic-slider
function LogSlider(options = {}) {
  this.minpos = options.minpos || 0;
  this.maxpos = options.maxpos || 100;

  if (options.notUseLogarithmic) {
    this.notUseLogarithmic = true;
    return;
  }

  this.minlval = Math.log(options.minval || 1);
  this.maxlval = Math.log(options.maxval || 100000);

  this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
  // Calculate value from a slider position
  value(position) {
    if (this.notUseLogarithmic) {
      return position;
    }

    return Math.floor(
      Math.exp((position - this.minpos) * this.scale + this.minlval)
    );
  },
  // Calculate slider position from a value
  position(value) {
    if (this.notUseLogarithmic) {
      return value;
    }

    return Math.floor(
      this.minpos + (Math.log(value) - this.minlval) / this.scale
    );
  },
};

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.sliderRef = React.createRef();
    this.inputRef = React.createRef();
    const value = props.default;

    const maxval = props.config.max || 500;
    const minval = props.config.min || 1;
    const notUseLogarithmic = maxval <= 100;

    this.logsl = new LogSlider({
      maxpos: 100,
      minval,
      maxval,
      notUseLogarithmic,
    });

    this.state = {
      value,
      position: this.logsl.position(value || 1).toFixed(0),
    };
  }

  onChangeInputE = e => this.onChangeInput(e.target.value);

  onChangeInput = val => {
    const value = parseInt(val, 10);
    let position = null;
    if (!Number.isNaN(value)) {
      position = value >= 0 ? this.logsl.position(value) : null;
    }

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

    const value = position >= 0 ? this.logsl.value(position) : null;
    if (this.state.inputUpdating) {
      this.setState({ position, inputUpdating: false });
    } else {
      this.setState({ position, value, sliderUpdating: true });
      this.props.onChange(value);
    }
  };

  componentDidMount() {
    this.sliderRef.current.addEventListener('ionChange', this.onChangeSlider);
    this.inputRef.current.addEventListener('ionChange', this.onChangeInputE);
  }

  componentWillUnmount() {
    this.sliderRef.current.removeEventListener(
      'ionChange',
      this.onChangeSlider
    );
    this.inputRef.current.removeEventListener('ionChange', this.onChangeInputE);
  }

  increaseCount = () => {
    const val = this.state.value || 0;
    this.onChangeInput(val + 1);
  };

  decreaseCount = () => {
    const val = this.state.value || 0;
    if (val <= 1) {
      return;
    }
    this.onChangeInput(val - 1);
  };

  render() {
    const config = this.props.config || {};
    const message = this.props.info || config.info;

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{t(message)}</p>
          </div>
        )}
        <IonItem className="slider-input">
          <IonRange
            ref={this.sliderRef}
            min="0"
            max="100"
            onChange={this.onChangeSlider}
            value={this.state.position}
          />
          <IonButton
            shape="round"
            fill="clear"
            size="default"
            className="decrement-button"
            onClick={this.decreaseCount}
          >
            <IonIcon icon={removeCircleOutline} />
          </IonButton>
          <input
            ref={this.inputRef}
            type="number"
            onChange={this.onChangeInputE}
            value={this.state.value || ''}
          />
          <IonButton
            shape="round"
            fill="clear"
            size="default"
            className="increment-button"
            onClick={this.increaseCount}
          >
            <IonIcon icon={addCircleOutline} />
          </IonButton>
        </IonItem>
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
