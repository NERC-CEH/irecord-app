import { useContext } from 'react';
import { observer } from 'mobx-react';
import { camera, searchOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { Button, InfoMessage, Main, useToast } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
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

const PlantHomeMain = ({
  sample,
  onDelete,
  showChildSampleDistanceWarning,
  attachSpeciesImages,
  onBulkEdit,
}: Props) => {
  const toast = useToast();
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
          <MenuLocation sample={sample} label="Square" />
          <MenuAttr
            model={sample}
            attr="childGeolocation"
            className="menu-attr-item"
            onChange={(val: boolean) => {
              if (!val || sample?.data?.location?.gridref) return;
              sample.data.childGeolocation = false; // eslint-disable-line no-param-reassign
              toast.warn(`Parent location must be selected first.`);
            }}
          />
          <MenuAttr
            model={sample}
            attr="vice-county"
            className="menu-attr-item"
          />
          <MenuAttr model={sample} attr="date" className="menu-attr-item" />
          <MenuAttr
            model={sample}
            attr="recorders"
            className="menu-attr-item"
          />
          <MenuAttr model={sample} attr="comment" className="menu-attr-item" />
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
        useSubSamples
        onBulkEdit={onBulkEdit}
      />
    </Main>
  );
};

export default observer(PlantHomeMain);
