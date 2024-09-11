import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Button, InfoMessage, Main } from '@flumens';
import { IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import SpeciesList from 'Survey/common/Components/SpeciesList';

type Props = {
  sample: Sample;
  onDelete: any;
  showChildSampleDistanceWarning: boolean;
};

const PlantHomeMain = ({
  sample,
  onDelete,
  showChildSampleDistanceWarning,
}: Props) => {
  const { url } = useRouteMatch();
  const { navigate } = useContext(NavContext);

  const isDisabled = sample.isDisabled();

  return (
    <Main>
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded-list">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        <div className="rounded-list">
          {showChildSampleDistanceWarning && (
            <InfoMessage color="warning" inline>
              Some species are located far from the survey area. Please check
              that this is correct.
            </InfoMessage>
          )}
          <MenuDynamicAttrs model={sample} skipLocks />
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

      <SpeciesList sample={sample} onDelete={onDelete} useSubSamples />
    </Main>
  );
};

export default observer(PlantHomeMain);
