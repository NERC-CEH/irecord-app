import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage, NavContext, IonButton, IonIcon } from '@ionic/react';
import Log from 'helpers/log';
import { warn } from 'helpers/toast';
import alert from 'helpers/alert';
import Attr, { getModel } from 'Components/Attr';
import { lock, unlock } from 'ionicons/icons';
import AppHeader from 'Components/Header';
import AppMain from 'Components/Main';

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

    const { attr } = match.params;
    this.attrType = match.params.occId ? 'occ' : 'smp';
    this.attrName = attr;

    this.survey = model.getSurvey();
    const locked = appModel.isAttrLocked(model, this.attrName);
    this.initiallyLocked = locked;

    this.state = { model, locked };
    const surveyAttrs = this.survey.attrs;

    this.attrConfig = surveyAttrs[this.attrName];

    this.isMultiChoiceNumber =
      this.attrName === 'number' && this.attrConfig.type !== 'slider';

    if (this.isMultiChoiceNumber) {
      this.attrConfig = surveyAttrs['number-ranges'];
    }

    this.initialVal = this.state.model.attrs[this.attrName];
    if (this.isMultiChoiceNumber) {
      this.initialVal = [
        this.state.model.attrs['number-ranges'],
        this.state.model.attrs.number,
      ];
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

    if (this.isMultiChoiceNumber) {
      const [rangesValue, sliderValue] = values;

      // todo: validate before setting up
      if (sliderValue) {
        // specific number
        newVal = sliderValue;
        model.attrs.number = sliderValue;
        delete model.attrs['number-ranges'];
      } else {
        // number ranges
        newVal = rangesValue;
        model.attrs['number-ranges'] = rangesValue;
        delete model.attrs.number;
      }
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

  render() {
    const { useLocks } = this.props;
    const { model, locked } = this.state;
    const rangesValues = this.isMultiChoiceNumber
      ? model.attrs['number-ranges']
      : null;

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
        <AppMain>
          <Attr
            rangesValues={rangesValues}
            attrConfig={this.attrConfig}
            onValueChange={this.onValueChange}
            isMultiChoiceNumber={this.isMultiChoiceNumber}
            initialVal={this.initialVal}
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Controller;
