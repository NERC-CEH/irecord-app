import appModel from 'app_model';
import Input from 'common/Components/Input';
import RadioInput from 'common/Components/RadioInput';
import Textarea from 'common/Components/Textarea';
import { coreAttributes } from 'common/config/surveys/general';
import DateHelp from 'helpers/date';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import radio from 'radio';
import React from 'react';
import NumberAttr from './components/NumberAttr';

@observer
class Component extends React.Component {
  /**
   * Update sample with new values
   */
  save = (value, callback) => {
    Log('Samples:Attr: saving.');
    const { sample } = this.props;
    const attr = this.props.attr;
    let currentVal;
    let newVal;
    const occ = sample.getOccurrence();

    switch (attr) {
      case 'occ:number':
        currentVal = occ.get('number') || occ.get('number-ranges');

        // TODO: validate before setting up
        const [rangesValue, sliderValue] = value;
        if (sliderValue) {
          // specific number
          newVal = sliderValue;
          occ.set('number', newVal);
          occ.unset('number-ranges');
        } else {
          // number ranges
          newVal = rangesValue;
          occ.set('number-ranges', newVal);
          occ.unset('number');
        }
        break;
      default:
        const surveyAttrs = sample.getSurvey().attrs;

        const attrParts = attr.split(':');
        const attrType = attrParts[0];
        const attrName = attrParts[1];
        const attrConfig = surveyAttrs[attrType][attrName];

        const model = attrType === 'smp' ? sample : occ;

        currentVal = model.get(attrName);
        newVal = value;

        // validate before setting up
        if (attrConfig.isValid && !attrConfig.isValid(newVal)) {
          radio.trigger('app:dialog', {
            title: 'Sorry',
            body: 'Invalid date selected',
            timeout: 2000
          });
          return;
        }

        model.set(attrName, value);
    }

    // save it
    sample
      .save()
      .then(() => {
        // update locked value if attr is locked
        this.updateLock(attr, newVal, currentVal, sample.getSurvey());
        callback && callback();
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  };

  updateLock = (attr, newVal, currentVal, surveyConfig) => {
    if (coreAttributes.includes(attr)) {
      surveyConfig = null;
    }
    const lockedValue = appModel.getAttrLock(attr, surveyConfig);

    switch (attr) {
      case 'smp:date':
        if (
          !lockedValue ||
          (lockedValue && DateHelp.print(newVal) === DateHelp.print(new Date()))
        ) {
          // don't lock current day
          appModel.unsetAttrLock(attr);
        } else {
          appModel.setAttrLock(attr, newVal);
        }
        break;
      default:
        if (
          lockedValue &&
          (lockedValue === true || lockedValue === currentVal)
        ) {
          appModel.setAttrLock(attr, newVal, surveyConfig);
        }
    }
  };

  render() {
    Log(`Samples:Attr: showing ${this.props.attr}.`);

    const { sample } = this.props;
    const occ = sample.getOccurrence();

    const surveyAttrs = sample.getSurvey().attrs;

    const attrParts = this.props.attr.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];
    const attrConfig = surveyAttrs[attrType][attrName];

    const currentVal =
      attrType === 'smp' ? sample.get(attrName) : occ.get(attrName);

    if (this.props.attr === 'occ:number') {
      return (
        <NumberAttr
          config={surveyAttrs.occ['number-ranges']}
          rangesValue={occ.get('number-ranges')}
          sliderValue={currentVal}
          onChange={this.save}
        />
      );
    }

    switch (attrConfig.type) {
      case 'date':
      case 'input':
        return (
          <Input
            type="date"
            config={attrConfig}
            default={currentVal}
            onChange={this.save}
          />
        );

      case 'radio':
        return (
          <RadioInput
            config={attrConfig}
            default={currentVal}
            onChange={val =>
              this.save(val, () => {
                window.history.back();
              })
            }
          />
        );

      case 'text':
        return (
          <Textarea
            config={attrConfig}
            default={currentVal}
            onChange={this.save}
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
  attr: PropTypes.string.isRequired
};

export default Component;
