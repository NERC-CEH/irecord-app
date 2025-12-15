import { observer } from 'mobx-react';
import { Page, Header, Main, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'common/models/sample';
import MenuDynamicAttr from 'Survey/common/Components/MenuDynamicAttrs';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';

const PlantOccurrenceHome = () => {
  const { subSample } = useSample<Sample>();
  if (!subSample) return null;

  const surveyConfig = subSample.getSurvey();

  const [occ] = subSample.occurrences;
  const { isDisabled } = subSample;

  const renderArray = typeof surveyConfig.smp?.render === 'function' 
    ? surveyConfig.smp.render(subSample) 
    : surveyConfig.smp?.render;

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />

      <Main>
        <IonList lines="full" className="mb-2 flex! flex-col gap-4">
          {isDisabled && (
            <div className="rounded-list">
              <VerificationMessage occurrence={occ} />
            </div>
          )}

          <div className="rounded-list">
            <PhotoPicker model={occ} />
          </div>

          <div className="rounded-list">
            <MenuTaxonItem occ={occ} />
            <MenuLocation sample={subSample} skipName isRequired={false} />
            {renderArray?.map((config: any) => (
              <MenuDynamicAttr
                key={config.id}
                model={subSample}
                config={config}
              />
            ))}
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(PlantOccurrenceHome);
