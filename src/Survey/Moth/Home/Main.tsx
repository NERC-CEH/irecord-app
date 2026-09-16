import { useContext } from 'react';
import { observer } from 'mobx-react';
import { camera, searchOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { Main, InfoMessage, Button } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import { usePromptImageSource } from 'Survey/common/Components/PhotoPicker';
import SpeciesList from 'Survey/common/Components/SpeciesList';
import {
  commentAttr,
  dateAttr,
  methodAttr,
  mothStageAttr,
  numberAttr,
  recorderAttr,
  sexAttr,
} from '../config';

type Props = {
  sample: Sample;
  attachSpeciesImages: (useCamera: boolean) => void;
  onDelete: (occurrence: Occurrence) => void;
};

const MothHomeMain = ({ sample, onDelete, attachSpeciesImages }: Props) => {
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

  const hasDate = !!sample.data.date;

  return (
    <Main className="pb-ion-s-10">
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded-list mb-4">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        <div className="rounded-list">
          <MenuLocation sample={sample} />
          <MenuAttr model={sample} block={dateAttr} />
          {!hasDate && (
            <InfoMessage inline>
              If trapping overnight please enter the date for the evening on
              which the trap was put out.
            </InfoMessage>
          )}
          <MenuAttr model={sample} block={recorderAttr} />
          <MenuAttr model={sample} block={methodAttr} />
          <MenuAttr model={sample} block={commentAttr} />
        </div>
      </IonList>

      {!isDisabled && (
        <div className="mx-3 mt-8 flex items-center justify-center gap-5">
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

      <div className="mt-4">
        <SpeciesList
          sample={sample}
          onDelete={model => onDelete(model as Occurrence)}
          bulkEditAttrs={{
            stage: mothStageAttr,
            sex: sexAttr,
            comment: commentAttr,
          }}
          numberAttrs={[numberAttr]}
        />
      </div>
    </Main>
  );
};

export default observer(MothHomeMain);
