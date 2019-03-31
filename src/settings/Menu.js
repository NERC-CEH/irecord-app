import React from 'react';
import radio from 'radio';
import PropTypes from 'prop-types';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import { observer } from 'mobx-react';
import Toggle from 'common/Components/Toggle';

function deleteAllSamples(savedSamples) {
  const body = `${t(
    'Are you sure you want to remove all successfully synchronised local records?'
  )}<p><i><b>${t('Note')}:</b> ${t(
    'records on the server will not be touched.'
  )}</i></p>`;

  radio.trigger('app:dialog', {
    title: 'Remove All',
    body,
    buttons: [
      {
        title: 'Cancel',
        fill: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: 'Remove',
        color: 'danger',
        onClick() {
          Log('Settings:Menu:Controller: deleting all samples.');

          // delete all
          savedSamples
            .removeAllSynced()
            .then(() => {
              radio.trigger('app:dialog', {
                title: 'Done!',
                timeout: 1000,
              });
            })
            .catch(err => {
              Log(err, 'e');
              radio.trigger('app:dialog:error', err);
            });
          Analytics.trackEvent('Settings', 'delete all');
        },
      },
    ],
  });
}

function sendAllSamples(savedSamples) {
  radio.trigger('app:dialog', {
    title: 'Submit All',
    body: 'Are you sure you want to set all valid records for submission?',
    buttons: [
      {
        title: 'Cancel',
        fill: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: 'Submit',
        onClick() {
          Log('Settings:Menu:Controller: sending all samples.');
          savedSamples
            .setAllToSend()
            .then(() => {
              radio.trigger('app:dialog', {
                title: 'Done!',
                timeout: 1000,
              });
            })
            .catch(err => {
              Log(err, 'e');
              radio.trigger('app:dialog:error', err);
            });
          Analytics.trackEvent('Settings', 'send all');
        },
      },
    ],
  });
}

function resetApp(savedSamples, appModel, userModel) {
  Log('Settings:Menu:Controller: resetting the application!', 'w');
  Analytics.trackEvent('Settings', 'reset app');

  appModel.resetDefaults();
  userModel.logOut();
  return savedSamples.resetDefaults();
}

function resetDialog(savedSamples, appModel, userModel) {
  radio.trigger('app:dialog', {
    title: 'Reset',
    class: 'error',
    body: `${t(
      'Are you sure you want to reset the application to its initial state?'
    )}<p><b>${t('This will wipe all the locally stored app data!')}</b></p>`,
    buttons: [
      {
        title: 'Cancel',
        fill: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: 'Reset',
        color: 'danger',
        onClick() {
          // delete all
          resetApp(savedSamples, appModel, userModel).then(() => {
            radio.trigger('app:dialog', {
              title: 'Done!',
              timeout: 1000,
            });
          });
        },
      },
    ],
  });
}

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.onToggle = this.onToggle.bind(this);
    this.state = {};
  }

  onToggle(setting, checked) {
    Log('Settings:Menu:Controller: setting toggled.');
    this.props.appModel.set(setting, checked);
    this.props.appModel.save();
  }

  render() {
    const { savedSamples, appModel, userModel } = this.props;
    const useTraining = appModel.get('useTraining');
    const useGridRef = appModel.get('useGridRef');
    const useGridMap = appModel.get('useGridMap');
    const useExperiments = appModel.get('useExperiments');
    const gridSquareUnit = appModel.get('gridSquareUnit');

    return (
      <ion-list lines="full">
        <ion-item-divider>{t('Records')}</ion-item-divider>
        <ion-item
          id="submit-all-btn"
          onClick={() => sendAllSamples(savedSamples)}
        >
          <span slot="start" className="icon icon-send" />
          {t('Submit All')}
        </ion-item>
        <ion-item
          id="delete-all-btn"
          onClick={() => deleteAllSamples(savedSamples)}
        >
          <span slot="start" className="icon icon-delete" />
          {t('Remove All Saved')}
        </ion-item>
        <ion-item>
          <span slot="start" className="icon icon-training" />
          <ion-label>{t('Training Mode')}</ion-label>
          <Toggle
            onToggle={checked => this.onToggle('useTraining', checked)}
            checked={useTraining}
          />
        </ion-item>

        <ion-item-divider>{t('Location')}</ion-item-divider>
        <ion-item>
          <span slot="start" className="icon icon-grid" />
          <ion-label>{t('Use Grid Ref')}</ion-label>
          <Toggle
            onToggle={checked => this.onToggle('useGridRef', checked)}
            checked={useGridRef}
          />
        </ion-item>
        <ion-item>
          <span slot="start" className="icon icon-grid" />
          <ion-label>{t('Show Map Grid')}</ion-label>
          <Toggle
            onToggle={checked => this.onToggle('useGridMap', checked)}
            disabled={!useGridRef}
            checked={useGridMap}
          />
        </ion-item>
        <ion-item href="#settings/locations" detail>
          <span slot="start" className="icon icon-location" />
          {t('Manage Saved')}
        </ion-item>
        <ion-item href="#settings/survey" detail>
          <span slot="start" className="icon icon-grid" />
          <span slot="end" className="descript" style={{ width: '25%' }}>
            {gridSquareUnit}
          </span>
          Grid Square Unit
        </ion-item>

        <ion-item-divider>{t('Application')}</ion-item-divider>
        <ion-item>
          <span slot="start" className="icon icon-fire" />
          <ion-label>{t('Experimental Features')}</ion-label>
          <Toggle
            onToggle={checked => this.onToggle('useExperiments', checked)}
            checked={useExperiments}
          />
        </ion-item>
        <ion-item
          id="app-reset-btn"
          onClick={() => resetDialog(savedSamples, appModel, userModel)}
        >
          <span slot="start" className="icon icon-undo" />
          {t('Reset')}
        </ion-item>
      </ion-list>
    );
  }
}

Component.propTypes = {
  savedSamples: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  userModel: PropTypes.object.isRequired,
};

export default Component;
