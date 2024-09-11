import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Main, InfoMessage, Button } from '@flumens';
import { IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import SpeciesList from 'Survey/common/Components/SpeciesList';

type Props = {
  sample: Sample;
  onDelete: any;
};

const MothHomeMain = ({ sample, onDelete }: Props) => {
  const { url } = useRouteMatch();
  const { navigate } = useContext(NavContext);

  const isDisabled = sample.isDisabled();

  const hasDate = !!sample.attrs.date;

  return (
    <Main>
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded-list">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        <div className="rounded-list">
          <MenuLocation sample={sample} />
          <MenuAttr model={sample} attr="date" />
          {!hasDate && (
            <InfoMessage inline>
              If trapping overnight please enter the date for the evening on
              which the trap was put out.
            </InfoMessage>
          )}
          <MenuAttr model={sample} attr="recorder" />
          <MenuAttr model={sample} attr="method" />
          <MenuAttr model={sample} attr="comment" />
        </div>
      </IonList>
      {!isDisabled && (
        <Button
          color="primary"
          className="mx-auto mb-2.5 mt-8"
          onPress={() => navigate(`${url}/taxon`)}
        >
          Add Species
        </Button>
      )}

      <SpeciesList sample={sample} onDelete={onDelete} />
    </Main>
  );
};

export default observer(MothHomeMain);
