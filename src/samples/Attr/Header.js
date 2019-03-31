import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import Header from '../../common/Components/Header';

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onLeave = this.onLeave.bind(this);
  }

  onLeave() {
    this.props.onLeave && this.props.onLeave();
    window.history.back();
  }

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

    let locked;

    if (sample.metadata.complex_survey) {
      locked = this.props.appModel.isAttrLocked(sample, attrName);
      return null;
    }
    const occ = sample.getOccurrence();
    const model = attrType === 'smp' ? sample : occ;
    locked = this.props.appModel.isAttrLocked(model, attrName);

    const lock = (
      <a
        id="lock-btn"
        className={`icon icon-lock-${locked ? 'closed' : 'open'}`}
        onClick={this.props.onLockClick}
      >
        {t(locked ? 'Locked' : 'Unlocked')}
      </a>
    );

    return (
      <Header rightPanel={lock} onLeave={this.onLeave}>
        {title}
      </Header>
    );
  }
}

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  attr: PropTypes.string.isRequired,
  onLockClick: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
};

export default Component;
