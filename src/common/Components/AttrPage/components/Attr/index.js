import Input from 'Components/Input';
import RadioInput from 'Components/RadioInput';
import Textarea from 'Components/Textarea';
import SliderInput from 'Components/SliderInput';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import InputList from './components/InputList';

@observer
class Component extends React.Component {
  state = { currentVal: this.props.initialVal };

  componentDidMount() {
    this._ismounted = true;
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  onValueChanged = (val, radioWasClicked) => {
    if (this._ismounted) {
      this.setState({ currentVal: val });
    }
    this.props.onValueChange(val, radioWasClicked);
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.controlled &&
      prevProps.initialVal !== this.props.initialVal
    ) {
      // eslint-disable-next-line
      this.setState({ currentVal: this.props.initialVal });
    }
  }

  render() {
    const { attrConfig } = this.props;

    switch (attrConfig.type) {
      case 'date':
      case 'input':
        return (
          <Input
            type={attrConfig.type}
            config={attrConfig}
            default={this.state.currentVal}
            onChange={this.onValueChanged}
          />
        );
      case 'inputList':
        return (
          <InputList
            type="text"
            config={attrConfig}
            default={this.state.currentVal}
            onChange={this.onValueChanged}
          />
        );

      case 'radio':
        return (
          <RadioInput
            config={attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onValueChanged(val, true)}
          />
        );

      case 'text':
        return (
          <Textarea
            config={attrConfig}
            default={this.state.currentVal}
            onChange={this.onValueChanged}
          />
        );

      case 'slider':
        return (
          <SliderInput
            config={attrConfig}
            default={this.state.currentVal}
            onChange={this.onValueChanged}
          />
        );

      default:
        Log('Samples:AttrView: no such attribute type was found!', 'e');
        Log(attrConfig);
    }

    return null;
  }
}

Component.propTypes = {
  attrConfig: PropTypes.object.isRequired,
  onValueChange: PropTypes.func.isRequired,
  initialVal: PropTypes.any,
  controlled: PropTypes.bool,
};

export default Component;

export function getModel(savedSamples, match) {
  const { id, smpId, occId } = match.params;
  const surveySample = savedSamples.find(({ cid }) => cid === id);

  const subSample = surveySample.samples.find(({ cid }) => cid === smpId);

  if (occId) {
    const sample = subSample || surveySample;
    return sample.occurrences.find(({ cid }) => cid === occId);
  }

  if (smpId) {
    return subSample;
  }

  return surveySample;
}
