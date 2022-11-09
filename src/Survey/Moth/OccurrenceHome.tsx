import { FC } from 'react';
import { IonList } from '@ionic/react';
import { Page, Header, Main } from '@flumens';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';

type Props = {
  occurrence: Occurrence;
};

const MothOccurrenceHome: FC<Props> = ({ occurrence }) => {
  const isDisabled = occurrence.isDisabled();

  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />
      <Main>
        <IonList lines="full">
          {isDisabled && (
            <div className="rounded">
              <VerificationMessage occurrence={occurrence} />
            </div>
          )}

          <div className="rounded">
            <PhotoPicker model={occurrence} disableClassifier />
          </div>

          <div className="rounded">
            <MenuDynamicAttrs model={occurrence} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothOccurrenceHome);
