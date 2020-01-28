import Log from 'helpers/log';
import { observer } from 'mobx-react';
import CONFIG from 'config';
import {
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonList,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import PropTypes from 'prop-types';
import React from 'react';
import { error, warn } from 'helpers/toast';
import Device from 'helpers/device';
import Spinner from 'Components/Spinner';
import './styles.scss';

@observer
class Component extends React.Component {
  static propTypes = {
    sample: PropTypes.object,
    userModel: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  componentDidMount = async () => {
    const { userModel } = this.props;

    if (
      !userModel.attrs.activities.length &&
      Device.isOnline() &&
      userModel.hasLogIn()
    ) {
      userModel.syncActivities();
    }
  };

  onListRefreshPull = async e => {
    e && e.detail.complete(); // spinner is shown elsewhere

    const { userModel } = this.props;

    if (!Device.isOnline()) {
      warn(t("Sorry, looks like you're offline."));
      return;
    }

    if (!userModel.hasLogIn()) {
      warn(t('Sorry, you have to login first.'));
      return;
    }

    try {
      await userModel.syncActivities(true);
    } catch (err) {
      Log(err, 'e');
      error(`${t(err.message)}`);
    }
  };

  getActivitiesList = () => {
    const { userModel, appModel, sample, onSelect } = this.props;
    const { activities } = userModel.attrs;
    const { synchronizing } = userModel.activities;

    if (!activities.length) {
      return null;
    }

    const lockedActivity = appModel.getAttrLock('smp', 'activity');
    let sampleActivity;

    if (sample) {
      sampleActivity = sample.attrs.activity;
    }

    const selectedActivity = sampleActivity || lockedActivity || {};

    const empty = {
      id: '',
      title: t('Default'),
      description: '',
    };

    const list = [empty, ...activities].map(({ title, id }) => (
      <React.Fragment key={id + title}>
        <IonItem>
          <IonLabel>{title}</IonLabel>
          <IonRadio disabled={synchronizing} value={id} />
        </IonItem>
      </React.Fragment>
    ));

    const onIonSelect = e => {
      if (selectedActivity.id === e.target.value) {
        return;
      }
      onSelect(e.target.value);
    };

    return (
      <IonRadioGroup
        onIonSelect={onIonSelect}
        value={selectedActivity.id || ''}
      >
        {list}
      </IonRadioGroup>
    );
  };

  showEmptyDataMessage = () => {};

  getReport = () => {
    const { userModel } = this.props;
    const { synchronizing } = userModel.activities;
    const { activities } = userModel.attrs;

    if (!activities.length && !synchronizing) {
      return (
        <IonItem id="activities-list" lines="none">
          <IonItem class="empty">
            <span>
              <p>
                {t('Sorry, no activities data is available at the moment.')}
              </p>
            </span>
          </IonItem>
        </IonItem>
      );
    }

    if (synchronizing) {
      return (
        <IonItem id="activities-list" lines="none">
          <Spinner />
        </IonItem>
      );
    }

    return (
      <IonList id="activities-list" lines="full">
        {this.showEmptyDataMessage()}
        {this.getActivitiesList()}
      </IonList>
    );
  };

  render() {

    return (
      <>
        <div className="info-message">
          <p>
            {t(
              'Click on the activity below which you would like to participate in. Any records you add from now on will be submitted to the chosen activity. You can join in with more activities by logging in to'
            )}
            {' '}
            <a href={CONFIG.site_url}>iRecord</a>
            {' '}
            {t(`and visiting the Record > Activities page`)}
            .
            <br />
            {t(`Pull to refresh the list.`)}
          </p>
        </div>

        <IonRefresher slot="fixed" onIonRefresh={this.onListRefreshPull}>
          <IonRefresherContent />
        </IonRefresher>

        {this.getReport()}
      </>
    );
  }
}

export default Component;
