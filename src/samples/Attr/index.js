import Input from 'common/Components/Input';
import RadioInput from 'common/Components/RadioInput';
import Textarea from 'common/Components/Textarea';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import NumberAttr from './components/NumberAttr';

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);

    const { sample, attr } = this.props;

    this.surveyAttrs = sample.getSurvey().attrs;
    const attrParts = attr.split(':');
    this.attrType = attrParts[0];
    this.attrName = attrParts[1];
    this.attrConfig = this.surveyAttrs[this.attrType][this.attrName];

    let currentVal = this.props.initialVal;
    if (this.props.attr === 'occ:number') {
      const [, sliderValue] = this.props.initialVal;
      currentVal = sliderValue;
    }
    this.state = {
      currentVal,
    };

    this.onValueChanged = this.onValueChanged.bind(this);
  }

  componentDidMount() {
    this._ismounted = true;
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  onValueChanged(val, radioWasClicked) {
    if (this._ismounted) {
      this.setState({ currentVal: val });
    }
    this.props.onValueChange(val, radioWasClicked);
  }

  render() {
    Log(`Samples:Attr: showing ${this.props.attr}.`);

    const { sample } = this.props;
    const occ = sample.getOccurrence();

    if (this.props.attr === 'occ:number') {
      return (
        <NumberAttr
          config={this.surveyAttrs.occ['number-ranges']}
          rangesValue={occ.get('number-ranges')}
          sliderValue={this.state.currentVal}
          onChange={(val, radioWasClicked) =>
            this.onValueChanged(val, radioWasClicked)
          }
        />
      );
    }

    switch (this.attrConfig.type) {
      case 'date':
      case 'input':
        return (
          <Input
            type="date"
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={this.onValueChanged}
          />
        );

      case 'radio':
        return (
          <RadioInput
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onValueChanged(val, true)}
          />
        );

      case 'text':
        return (
          <Textarea
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={this.onValueChanged}
          />
        );

      default:
        Log('Samples:AttrView: no such attribute type was found!', 'e');
    }
    return null;
  }
}

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  attr: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  initialVal: PropTypes.any,
};

export default Component;
