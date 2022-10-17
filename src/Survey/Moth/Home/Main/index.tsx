import { FC } from 'react';
import { observer } from 'mobx-react';
import { IonButton, IonLabel, IonList } from '@ionic/react';
import { Main, InfoMessage } from '@flumens';
import Sample from 'models/sample';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import SpeciesList from 'Survey/common/Components/SpeciesList';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import './styles.scss';

type Props = {
  sample: Sample;
  onDelete: any;
};

const MothHomeMain: FC<Props> = ({ sample, onDelete }) => {
  const { url } = useRouteMatch();

  const isDisabled = sample.isDisabled();

  const hasDate = !!sample.attrs.date;

  return (
    <Main>
      {isDisabled && <DisabledRecordMessage sample={sample} />}

      <IonList lines="full">
        <div className="rounded">
          <MenuLocation sample={sample} />
          <MenuAttr model={sample} attr="date" />
          {!hasDate && (
            <InfoMessage color="dark">
              If trapping overnight please enter the date for the evening on
              which the trap was put out.
            </InfoMessage>
          )}
          <MenuAttr model={sample} attr="recorders" />
          <MenuAttr model={sample} attr="method" />
          <MenuAttr model={sample} attr="comment" />
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

      <SpeciesList sample={sample} onDelete={onDelete} />
    </Main>
  );
};

export default observer(MothHomeMain);
