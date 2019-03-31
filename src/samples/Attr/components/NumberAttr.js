import React from 'react';
import RadioInput from 'common/Components/RadioInput';
import SliderInput from 'common/Components/SliderInput';
import PropTypes from 'prop-types';

class Component extends React.Component {
  constructor(props) {
    super(props);
    // don't show any selected default range if the slider value exists
    const sliderValue = props.rangesValue ? null : props.sliderValue;
    this.state = { rangesValue: props.rangesValue, sliderValue };
  }

  onSliderChange = sliderValue => {
    // unset ranges selection
    this.setState({ rangesValue: null, sliderValue });
    this.props.onChange([null, sliderValue]);
  };

  onRadioChange = rangesValue => {
    if (!rangesValue && this.state.sliderValue) {
      return;
    }
    this.props.onChange([rangesValue], true);
  };

  render() {
    return (
      <div>
        <div className="info-message">
          <p>{t('How many individuals of this type?')}</p>
        </div>
        <SliderInput
          config={this.props.config}
          default={this.state.sliderValue}
          onChange={this.onSliderChange}
        />
        <RadioInput
          config={this.props.config}
          default={this.state.rangesValue}
          onChange={this.onRadioChange}
        />
      </div>
    );
  }
}

Component.propTypes = {
  rangesValue: PropTypes.any,
  sliderValue: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export default Component;
