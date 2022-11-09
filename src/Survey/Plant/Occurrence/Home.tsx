import { FC } from 'react';
import { IonList } from '@ionic/react';
import { Page, Header, Main } from '@flumens';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';
import Sample from 'models/sample';
import { observer } from 'mobx-react';

type Props = {
  subSample: Sample;
};

const PlantOccurrenceHome: FC<Props> = ({ subSample: sample }) => {
  const [occ] = sample.occurrences;
  const isDisabled = sample.isDisabled();

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />

      <Main>
        <IonList lines="full">
          {isDisabled && (
            <div className="rounded">
              <VerificationMessage occurrence={occ} />
            </div>
          )}

          <div className="rounded">
            <PhotoPicker model={occ} disableClassifier />
          </div>

          <div className="rounded">
            <MenuTaxonItem occ={occ} />
            <MenuLocation sample={sample} skipName />
            <MenuDynamicAttrs model={sample} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(PlantOccurrenceHome);
