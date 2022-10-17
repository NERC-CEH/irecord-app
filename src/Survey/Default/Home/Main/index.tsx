import { FC } from 'react';
import { observer } from 'mobx-react';
import { IonList } from '@ionic/react';
import { Main } from '@flumens';
import Sample from 'models/sample';
import { useRouteMatch } from 'react-router';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';

import './styles.scss';

interface Props {
  sample: Sample;
}

const EditMain: FC<Props> = ({ sample }) => {
  const { url } = useRouteMatch();

  const [occ] = sample.occurrences;

  const { activity } = sample.attrs;

  const isDisabled = sample.isDisabled();

  return (
    <Main>
      {isDisabled && <DisabledRecordMessage sample={sample} />}

      {/* Only showing if pre-selected */}
      {activity && (
        <IonList lines="full">
          <div className="rounded">
            <MenuAttr.WithLock model={sample} attr="activity" />
          </div>
        </IonList>
      )}

      <IonList lines="full">
        <div className="rounded">
          <PhotoPicker model={occ} />
        </div>

        <div className="rounded">
          <MenuTaxonItem occ={occ} />
          <MenuLocation.WithLock sample={sample} />
          <MenuAttr.WithLock model={sample} attr="date" />
          <MenuAttr.WithLock
            model={occ}
            attr="comment"
            itemProps={{
              routerLink: `${url}/occ/${occ.cid}/comment`,
            }}
          />
          <MenuDynamicAttrs model={sample} />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditMain);
