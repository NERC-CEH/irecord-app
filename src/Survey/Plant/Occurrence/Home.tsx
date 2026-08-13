import { observer } from 'mobx-react';
import { Page, Header, Main, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'common/models/sample';
import MenuDynamicAttr from 'Survey/common/Components/MenuDynamicAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';
import surveyConfig from '../config';

const PlantOccurrenceHome = () => {
  const { subSample } = useSample<Sample>();
  if (!subSample) return null;

  const [occ] = subSample.occurrences;
  const { isDisabled } = subSample;

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />

      <Main className="pb-ion-s-10">
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
            {surveyConfig.smp.occ.render?.map((attr: any) => (
              <MenuDynamicAttr
                key={attr.id}
                model={occ}
                block={attr}
                useSeparateOccPage
                survey={surveyConfig.name}
              />
            ))}
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(PlantOccurrenceHome);
