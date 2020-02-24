import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage, NavContext, IonButton, IonIcon } from '@ionic/react';
import Log from 'helpers/log';
import { warn } from 'helpers/toast';
import alert from 'helpers/alert';
import { lock, unlock } from 'ionicons/icons';
import AppHeader from 'Components/Header';
import AppMain from 'Components/Main';
import Attr, { getModel } from './components/Attr';
import ComplexAttr from './components/ComplexAttr';

function getRenderConfig(model, configId) {
  let survey = model.getSurvey();
  let config;
  if (survey.render) {
    config = survey.render.find(e => e === configId || e.id === configId);
  }

  if (!config) {
    survey = model.parent.getSurvey();
    config = survey.render.find(e => e === configId || e.id === configId);
  }

  return config;
}

@observer
class Controller extends React.Component {
  static contextType = NavContext;

  static propTypes = {
    appModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
    useLocks: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    const { match, savedSamples, appModel } = props;

    const model = getModel(savedSamples, match);

    const { occId, attr } = match.params;
    this.attrType = occId ? 'occ' : 'smp';
    this.attrName = attr;

    const locked = appModel.isAttrLocked(model, this.attrName);
    this.initiallyLocked = locked;

    this.state = { model, locked };

    this.survey = model.getSurvey();

    const id = `${this.attrType}:${this.attrName}`;
    const renderConfig = getRenderConfig(model, id);
    if (typeof renderConfig !== 'string') {
      this.complexAttr = true;
      this.attrConfig = renderConfig;

      this.attrConfig.groupConfig = [];
      this.initialVal = [];

      this.attrConfig.group.forEach(fullAttrName => {
        const [, attrName] = fullAttrName.split(':');
        this.attrConfig.groupConfig.push(this.survey.attrs[attrName]);
        this.initialVal[attrName] = this.state.model.attrs[attrName];
      });
    } else {
      this.attrConfig = this.survey.attrs[this.attrName];
      this.initialVal = this.state.model.attrs[this.attrName];
    }

    this.latestVal = this.initialVal;
  }

  onLockClick = () => {
    this.setState({ locked: !this.state.locked });
  };

  updateLock = newVal => {
    const { appModel } = this.props;

    if (this.state.locked) {
      appModel.setAttrLock(this.state.model, this.attrName, newVal);
      return;
    }

    if (this.initiallyLocked) {
      appModel.unsetAttrLock(this.state.model, this.attrName);
    }
  };

  save = async callback => {
    const { model } = this.state;
    const values = this.latestVal;
    let newVal = values;

    if (this.complexAttr) {
      Object.entries(values).forEach(([key, value]) => {
        // todo: validate before setting up
        if (!value) {
          delete model.attrs[key];
          return;
        }
        newVal = value;
        model.attrs[key] = value;
      });
    } else {
      // validate before setting up
      if (this.attrConfig.isValid) {
        const isValid = this.attrConfig.isValid(values);
        if (!isValid) {
          warn(t('Sorry, value not valid.'));
          return;
        }
      }

      model.attrs[this.attrName] = values;
    }

    try {
      await model.save();
      this.updateLock(newVal);
      callback();
    } catch (err) {
      Log(err, 'e');
    }
  };

  onExit = () => this.save(this.context.goBack);

  onValueChange = (newValue, exit) => {
    this.latestVal = newValue; // cache the val if left using the header
    if (exit) {
      this.onExit();
    }
  };

  componentDidMount() {
    const { appModel, useLocks } = this.props;

    const isRadioAttr = this.attrConfig.type === 'radio';
    if (useLocks && !appModel.attrs.shownLockingTip && isRadioAttr) {
      alert({
        header: 'Tip: Locking Attributes',
        message:
          'You can preserve your current attribute value for the subsequently added records by locking it. Click on the <ion-icon src="/images/ios-lock.svg"></ion-icon> button.',
        buttons: [
          {
            text: t('OK, got it'),
            role: 'cancel',
            cssClass: 'primary',
          },
        ],
      });
      appModel.attrs.shownLockingTip = true;
      appModel.save();
    }
  }

  getAttr = () => {
    if (this.complexAttr) {
      return (
        <ComplexAttr
          attrConfig={this.attrConfig}
          onValueChange={this.onValueChange}
          initialVal={this.initialVal}
        />
      );
    }

    return (
      <Attr
        attrConfig={this.attrConfig}
        onValueChange={this.onValueChange}
        initialVal={this.initialVal}
      />
    );
  };

  render() {
    const { useLocks } = this.props;
    const { locked } = this.state;

    const lockBtn = useLocks ? (
      <IonButton id="lock-btn" onClick={this.onLockClick}>
        <IonIcon icon={locked ? lock : unlock} />
        {t(locked ? 'Locked' : 'Unlocked')}
      </IonButton>
    ) : null;

    return (
      <IonPage>
        <AppHeader
          title={t(this.attrName)}
          onLeave={this.onExit}
          rightSlot={lockBtn}
        />
        <AppMain>{this.getAttr()}</AppMain>
      </IonPage>
    );
  }
}

export default Controller;
