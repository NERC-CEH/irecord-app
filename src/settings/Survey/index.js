import { observer } from 'mobx-react';
import React from 'react';
import PropTypes from 'prop-types';
import { IonPage, NavContext } from '@ionic/react';
import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import RadioInput from 'Components/RadioInput';
import AppHeader from 'Components/Header';
import AppMain from 'Components/Main';
import './styles.scss';

@observer
class Component extends React.Component {
  static contextType = NavContext;

  static propTypes = {
    appModel: PropTypes.object.isRequired,
  };

  render() {
    const { appModel } = this.props;

    const onChange = value => {
      Log('Settings:Survey: Picked new grid unit');
      if (!value) {
        return;
      }

      appModel.attrs.gridSquareUnit = value;
      appModel.save();
      this.context.goBack();
    };

    const message = t('Please pick your grid square unit.');

    const selection = Object.keys(LocHelp.gridref_accuracy).map(key => ({
      label: LocHelp.gridref_accuracy[key].label,
      value: key,
    }));

    const config = { default: appModel.attrs.gridSquareUnit };

    return (
      <IonPage>
        <AppHeader title={t('Grid Unit')} />
        <AppMain>
          <RadioInput
            info={message}
            selection={selection}
            config={config}
            onChange={onChange}
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Component;
