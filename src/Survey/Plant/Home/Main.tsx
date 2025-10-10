import { useContext } from 'react';
import { observer } from 'mobx-react';
import { camera, searchOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { Button, InfoMessage, Main } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import { usePromptImageSource } from 'Survey/common/Components/PhotoPicker';
import SpeciesList from 'Survey/common/Components/SpeciesList';

type Props = {
  sample: Sample;
  onDelete: any;
  attachSpeciesImages: any;
  showChildSampleDistanceWarning: boolean;
};

const PlantHomeMain = ({
  sample,
  onDelete,
  showChildSampleDistanceWarning,
  attachSpeciesImages,
}: Props) => {
  const { url } = useRouteMatch();
  const { navigate } = useContext(NavContext);
  const promptImageSource = usePromptImageSource();

  const { isDisabled } = sample;

  const attachSpeciesImagesWrap = async () => {
    const shouldUseCamera = await promptImageSource();
    const cancelled = shouldUseCamera === null;
    if (cancelled) return;

    attachSpeciesImages(shouldUseCamera);
  };

  return (
    <Main>
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded-list mb-2">
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
        <div className="mx-3 mb-2.5 mt-8 flex items-center justify-center gap-5">
          <Button
            color="primary"
            onPress={() => navigate(`${url}/taxon`)}
            fill="outline"
            className="bg-white pl-3"
            prefix={<IonIcon src={searchOutline} className="size-6" />}
          >
            Add Species
          </Button>
          <Button
            color="primary"
            onPress={attachSpeciesImagesWrap}
            fill="outline"
            className="bg-white"
          >
            <IonIcon src={camera} className="size-6" />
          </Button>
        </div>
      )}

      <SpeciesList sample={sample} onDelete={onDelete} useSubSamples />
    </Main>
  );
};

export default observer(PlantHomeMain);
