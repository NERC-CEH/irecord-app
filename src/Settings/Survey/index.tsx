import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import { Page, Attr, Header, Main, gridrefAccuracy } from '@flumens';
import appModel from 'models/app';
import './styles.scss';

const GridType: FC = () => {
  const { goBack } = useContext(NavContext);

  const message = 'Please pick your grid square unit.';

  const values = Object.keys(gridrefAccuracy).map(key => ({
    label: gridrefAccuracy[key].label,
    value: key,
  }));

  return (
    <Page id="settings-survey">
      <Header title="Grid Unit" />
      <Main>
        <Attr
          input="radio"
          inputProps={{ options: values }}
          attr="gridSquareUnit"
          onChange={goBack}
          model={appModel}
          info={message}
        />
      </Main>
    </Page>
  );
};

export default observer(GridType);
