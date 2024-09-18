import { observer } from 'mobx-react';
import { Page, Header, Main } from '@flumens';
import { IonList } from '@ionic/react';
import Occurrence from 'models/occurrence';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';

type Props = {
  occurrence: Occurrence;
};

const MothOccurrenceHome = ({ occurrence }: Props) => {
  const isDisabled = occurrence.isDisabled();

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />
      <Main>
        <IonList lines="full" className="mb-2 flex flex-col gap-4">
          {isDisabled && (
            <div className="rounded-list">
              <VerificationMessage occurrence={occurrence} />
            </div>
          )}

          <div className="rounded-list">
            <PhotoPicker model={occurrence} disableClassifier />
          </div>

          <div className="rounded-list">
            <MenuDynamicAttrs model={occurrence} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothOccurrenceHome);
