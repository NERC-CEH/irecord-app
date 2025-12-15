import { observer } from 'mobx-react';
import { Page, Header, Main, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Occurrence from 'models/occurrence';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';

const MothOccurrenceHome = () => {
  const { occurrence } = useSample<any, Occurrence>();
  if (!occurrence) return null;

  const surveyConfig = occurrence.getSurvey();

  const { isDisabled } = occurrence;

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />
      <Main>
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
            <MenuDynamicAttrs model={occurrence} surveyConfig={surveyConfig} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothOccurrenceHome);
