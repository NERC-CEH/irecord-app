import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { Page, Attr, Header, Main, gridrefAccuracy } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import './styles.scss';

const GridType = () => {
  const { goBack } = useContext(NavContext);
  const { t } = useTranslation();

  const message = 'Please pick your grid square unit.';

  const values = Object.entries(gridrefAccuracy).map(([value, config]) => ({
    label: t(config.label),
    value,
  }));

  const navigateBack = () => goBack();

  return (
    <Page id="settings-survey">
      <Header title="Grid Unit" />
      <Main>
        <Attr
          input="radio"
          inputProps={{ options: values }}
          attr="gridSquareUnit"
          onChange={navigateBack}
          model={appModel}
          info={message}
        />
      </Main>
    </Page>
  );
};

export default observer(GridType);
