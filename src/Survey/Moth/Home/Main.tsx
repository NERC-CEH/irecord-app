import { useContext } from 'react';
import { observer } from 'mobx-react';
import { camera, searchOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { Main, InfoMessage, Button } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import { usePromptImageSource } from 'Survey/common/Components/PhotoPicker';
import SpeciesList from 'Survey/common/Components/SpeciesList';

type Props = {
  sample: Sample;
  attachSpeciesImages: any;
  onDelete: any;
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
    <Main>
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded-list mb-2">
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
        <div className="mx-auto mb-2.5 mt-8 flex items-center justify-center gap-5">
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

      <SpeciesList sample={sample} onDelete={onDelete} />
    </Main>
  );
};

export default observer(MothHomeMain);
