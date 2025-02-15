import { observer } from 'mobx-react';
import { Page, Header, Main } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'models/sample';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';

type Props = {
  subSample: Sample;
};

const PlantOccurrenceHome = ({ subSample: sample }: Props) => {
  const [occ] = sample.occurrences;
  const isDisabled = sample.isDisabled();

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />

      <Main>
        <IonList lines="full" className="mb-2 flex flex-col gap-4">
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
            <MenuLocation sample={sample} skipName isRequired={false} />
            <MenuDynamicAttrs model={sample} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(PlantOccurrenceHome);
