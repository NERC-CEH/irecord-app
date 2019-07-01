import Log from 'helpers/log';
import { observer } from 'mobx-react';
import React from 'react';
import PropTypes from 'prop-types';
import LocHelp from 'helpers/location';
import RadioInput from 'common/Components/RadioInput';
import './styles.scss';

const Component = observer(props => {
  const { appModel } = props;

  function onChange(value) {
    Log('Settings:Survey: Picked new grid unit');
    appModel.set('gridSquareUnit', value);
    appModel.save();
    window.history.back();
  }

  const message = t('Please pick your grid square unit.');

  const selection = Object.keys(LocHelp.gridref_accuracy).map(key => ({
    label: LocHelp.gridref_accuracy[key].label,
    value: key,
  }));

  const config = { default: appModel.get('gridSquareUnit') };

  return (
    <React.Fragment>
      <RadioInput
        info={message}
        selection={selection}
        config={config}
        onChange={onChange}
      />
    </React.Fragment>
  );
});

Component.propTypes = {
  appModel: PropTypes.object.isRequired,
};

export default Component;
