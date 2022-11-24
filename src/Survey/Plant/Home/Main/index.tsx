import { FC } from 'react';
import { observer } from 'mobx-react';
import { IonButton, IonLabel, IonList } from '@ionic/react';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import SpeciesList from 'Survey/common/Components/SpeciesList';
import { Main } from '@flumens';
import Sample from 'models/sample';
import { useRouteMatch } from 'react-router';
import { Trans as T } from 'react-i18next';
import './styles.scss';

type Props = {
  sample: Sample;
  onDelete: any;
};

const PlantHomeMain: FC<Props> = ({ sample, onDelete }) => {
  const { url } = useRouteMatch();

  const isDisabled = sample.isDisabled();

  return (
    <Main>
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        <div className="rounded">
          <MenuDynamicAttrs model={sample} skipLocks />
        </div>
      </IonList>

      {!isDisabled && (
        <IonButton
          color="primary"
          expand="block"
          id="add"
          routerLink={`${url}/taxon`}
        >
          <IonLabel>
            <T>Add Species</T>
          </IonLabel>
        </IonButton>
      )}

      <SpeciesList sample={sample} onDelete={onDelete} useSubSamples />
    </Main>
  );
};

export default observer(PlantHomeMain);
