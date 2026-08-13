import { useContext } from 'react';
import { observer } from 'mobx-react';
import { camera, searchOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { Button, InfoMessage, Main } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import { butterflyNumberRangesAttr } from 'Survey/Default/config/butterflies';
import { numberAttr, numberRangesAttr } from 'Survey/Default/config/common';
import { plantFungiNumberDAFORAttr } from 'Survey/Default/config/plantFungi';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import { usePromptImageSource } from 'Survey/common/Components/PhotoPicker';
import SpeciesList from 'Survey/common/Components/SpeciesList';
import {
  childGeolocationAttr,
  commentAttr,
  dateAttr,
  recorderAttr,
} from 'Survey/common/config';
import { groupIdAttr } from '../config';

const getActionConfig = (attrs: any, action: string) => {
  if (action in attrs) return attrs[action];

  return Object.values(attrs).find(
    (config: any) => config?.block?.title?.toLowerCase() === action
  );
};

type BulkEditModel = {
  getSurvey: () => { taxa?: string; occ?: { attrs?: any } };
};

export const getBulkEditAttrs = (models: BulkEditModel[]) => {
  const surveys = models.map(model => model.getSurvey());
  const [survey] = surveys;
  if (!survey || surveys.some(config => config.taxa !== survey.taxa))
    return { comment: commentAttr };

  const attrs = survey.occ?.attrs || {};
  const stage = getActionConfig(attrs, 'stage');
  const sex = getActionConfig(attrs, 'sex');

  return {
    ...(stage && { stage }),
    ...(sex && { sex }),
    comment: commentAttr,
  };
};

type Props = {
  sample: Sample;
  onDelete: any;
  attachSpeciesImages: any;
  showChildSampleDistanceWarning: boolean;
};

const HomeMain = ({
  sample,
  onDelete,
  showChildSampleDistanceWarning,
  attachSpeciesImages,
}: Props) => {
  const { url } = useRouteMatch();
  const { navigate } = useContext(NavContext);
  const promptImageSource = usePromptImageSource();

  const { groupId } = sample.data;

  const { isDisabled } = sample;

  const attachSpeciesImagesWrap = async () => {
    const shouldUseCamera = await promptImageSource();
    const cancelled = shouldUseCamera === null;
    if (cancelled) return;

    attachSpeciesImages(shouldUseCamera);
  };

  return (
    <Main className="pb-ion-s-10">
      <IonList lines="full" className="mb-2 flex! flex-col gap-4">
        {isDisabled && (
          <div className="rounded-list mb-2">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        {/* Only showing if pre-selected */}
        {groupId && (
          <div className="rounded-list">
            <MenuAttr.WithLock
              model={sample}
              block={groupIdAttr}
              survey={sample.getSurvey().name}
              taxa="all"
            />
          </div>
        )}

        <div className="rounded-list">
          {showChildSampleDistanceWarning && (
            <InfoMessage color="warning" inline>
              Some species are located far from the survey area. Please check
              that this is correct.
            </InfoMessage>
          )}

          <MenuLocation sample={sample} />
          <MenuAttr model={sample} block={childGeolocationAttr} />
          <MenuAttr model={sample} block={dateAttr} />
          <MenuAttr model={sample} block={recorderAttr} />
          <MenuAttr model={sample} block={commentAttr} />
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
        bulkEditAttrs={getBulkEditAttrs}
        useSubSamples
        numberAttrs={[
          numberAttr,
          numberRangesAttr,
          butterflyNumberRangesAttr,
          plantFungiNumberDAFORAttr,
        ]}
      />
    </Main>
  );
};

export default observer(HomeMain);
