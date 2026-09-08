import { observer } from 'mobx-react';
import { Page, Header, Main, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import MenuDynamicAttr from 'Survey/common/Components/MenuDynamicAttr';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';
import surveyConfig from './config';

const MothOccurrenceHome = () => {
  const { occurrence } = useSample<Sample, Occurrence>();
  if (!occurrence) return null;

  const { isDisabled } = occurrence;
  const blocks = surveyConfig.occ.render;

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />
      <Main className="pb-ion-s-10">
        <IonList lines="full" className="mb-2 flex! flex-col gap-4">
          {isDisabled && (
            <div className="rounded-list">
              <VerificationMessage occurrence={occurrence} />
            </div>
          )}

          <div className="rounded-list">
            <PhotoPicker model={occurrence} />
          </div>

          <div className="rounded-list">
            {blocks?.map(config => (
              <MenuDynamicAttr
                key={config.id}
                model={occurrence}
                block={config}
                survey={surveyConfig.name}
              />
            ))}
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothOccurrenceHome);
