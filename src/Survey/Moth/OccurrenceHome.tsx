import { FC } from 'react';
import { IonList } from '@ionic/react';
import { Page, Header, Main } from '@flumens';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';

type Props = {
  occurrence: Occurrence;
};

const MothOccurrenceHome: FC<Props> = ({ occurrence }) => {
  return (
    <Page id="survey-default-edit">
      <Header title="Edit" />
      <Main>
        <IonList lines="full">
          <div className="rounded">
            <PhotoPicker model={occurrence} />
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
