import { observer } from 'mobx-react';
import { Page, Header, Main, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Occurrence from 'models/occurrence';
import MenuDynamicAttr from 'Survey/common/Components/MenuDynamicAttrs';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';

const MothOccurrenceHome = () => {
  const { occurrence } = useSample<any, Occurrence>();
  if (!occurrence) return null;

  const surveyConfig = occurrence.getSurvey();

  const { isDisabled } = occurrence;

  const renderArray =
    typeof surveyConfig.render === 'function'
      ? surveyConfig.render(occurrence as any)
      : surveyConfig.render;

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
            {renderArray?.map((config: any) => (
              <MenuDynamicAttr
                key={config.id}
                model={occurrence}
                config={config}
              />
            ))}
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothOccurrenceHome);
