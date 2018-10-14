import appModel from 'app_model';
import { coreAttributes } from 'common/config/surveys/general';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import Header from '../../common/Components/Header';

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onLockClick = () => {
    Log('Samples:Attr: lock clicked.');
    const attr = this.props.attr;
    let surveyConfig = this.props.sample.getSurvey();
    const isCoreAttr = coreAttributes.includes(attr);

    surveyConfig = !isCoreAttr && surveyConfig;
    // invert the lock of the attribute
    // real value will be put on exit
    appModel.setAttrLock(
      attr,
      !appModel.getAttrLock(attr, surveyConfig),
      surveyConfig
    );
  };

  render() {
    const { sample } = this.props;
    const surveyAttrs = sample.getSurvey().attrs;

    const attrParts = this.props.attr.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];
    const attrConfig = surveyAttrs[attrType][attrName];

    const capitalizedAttrName =
      attrName.charAt(0).toUpperCase() + attrName.substr(1);
    const title = attrConfig.label || capitalizedAttrName;

    let locked = false;

    if (sample.metadata.complex_survey) {
      locked = appModel.isAttrLocked(sample, attrName);
      return null;
    }
    const occ = sample.getOccurrence();
    const model = attrType === 'smp' ? sample : occ;
    locked = appModel.isAttrLocked(model, attrName);

    const lock = (
      <a
        id="lock-btn"
        className={`icon icon-lock-${locked ? 'closed' : 'open'}`}
        onClick={this.onLockClick}
      >
        {t(locked ? 'Locked' : 'Unlocked')}
      </a>
    );

    return <Header rightPanel={lock}>{title}</Header>;
  }
}

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  attr: PropTypes.string.isRequired
};

export default Component;
