import { useContext } from 'react';
import { observer } from 'mobx-react';
import { camera, searchOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { Button, InfoMessage, Main } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import { usePromptImageSource } from 'Survey/common/Components/PhotoPicker';
import SpeciesList from 'Survey/common/Components/SpeciesList';
import { Action } from 'Survey/common/Components/SpeciesList/BulkEdit';

type Props = {
  sample: Sample;
  onDelete: any;
  attachSpeciesImages: any;
  showChildSampleDistanceWarning: boolean;
  onBulkEdit?: (action: Action, modelIds: string[], value?: any) => void;
};

const HomeMain = ({
  sample,
  onDelete,
  showChildSampleDistanceWarning,
  attachSpeciesImages,
  onBulkEdit,
}: Props) => {
  const { url } = useRouteMatch();
  const { navigate } = useContext(NavContext);
  const promptImageSource = usePromptImageSource();

  const surveyConfig = sample.getSurvey();

  const { groupId } = sample.data;

  const { isDisabled } = sample;

  const attachSpeciesImagesWrap = async () => {
    const shouldUseCamera = await promptImageSource();
    const cancelled = shouldUseCamera === null;
    if (cancelled) return;

    attachSpeciesImages(shouldUseCamera);
  };

  return (
    <Main>
      <IonList lines="full" className="mb-2 flex! flex-col gap-4">
        {isDisabled && (
          <div className="rounded-list mb-2">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        {/* Only showing if pre-selected */}
        {groupId && (
          <div className="rounded-list">
            <MenuAttr.WithLock model={sample} attr="groupId" />
          </div>
        )}

        <div className="rounded-list">
          {showChildSampleDistanceWarning && (
            <InfoMessage color="warning" inline>
              Some species are located far from the survey area. Please check
              that this is correct.
            </InfoMessage>
          )}
          <MenuDynamicAttrs
            model={sample}
            surveyConfig={surveyConfig}
            skipLocks
          />
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

      <SpeciesList
        sample={sample}
        onDelete={onDelete}
        onBulkEdit={onBulkEdit}
        useSubSamples
      />
    </Main>
  );
};

export default observer(HomeMain);
