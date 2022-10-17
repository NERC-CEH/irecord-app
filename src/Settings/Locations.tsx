import { Page, Main, Header } from '@flumens';
import { observer } from 'mobx-react';
import PastLocationsList from 'Components/PastLocationsList';

const Container = () => (
  <Page id="locations">
    <Header title="Past Locations" />
    <Main>
      <PastLocationsList />
    </Main>
  </Page>
);

export default observer(Container);
