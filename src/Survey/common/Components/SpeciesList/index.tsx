import { observer } from 'mobx-react';
import { filterOutline } from 'ionicons/icons';
import { InfoBackgroundMessage, useToast } from '@flumens';
import { IonButton, IonIcon, IonList, IonLabel } from '@ionic/react';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import SpeciesListItem from './SpeciesListItem';
import './styles.scss';

const speciesNameSort = (occ1: Occurrence, occ2: Occurrence) =>
  occ1.getPrettyName().localeCompare(occ2.getPrettyName());

const speciesNameSortForSamples = (smp1: Sample, smp2: Sample) =>
  speciesNameSort(smp1.occurrences[0], smp2.occurrences[0]);

const speciesOccAddedTimeSort = (
  model1: Sample | Occurrence,
  model2: Sample | Occurrence
) => {
  const date1 = new Date(model1.metadata.createdOn);
  const date2 = new Date(model2.metadata.createdOn);
  return date2.getTime() - date1.getTime();
};

function increaseCount(occ: Occurrence, is5x: boolean) {
  if (Number.isNaN(occ.attrs.number)) return;

  const addOneCount = () => (occ.attrs.number as number)++; // eslint-disable-line no-param-reassign

  if (is5x) {
    [...Array(5)].forEach(addOneCount);
  } else {
    addOneCount();
  }

  occ.save();
}

type Props = {
  sample: Sample;
  onDelete: any;
  useSubSamples?: boolean;
};

const SpeciesList = ({ onDelete, sample, useSubSamples }: Props) => {
  const toast = useToast();

  const models = useSubSamples ? sample.samples : sample.occurrences;
  if (!models.length) {
    return <InfoBackgroundMessage>No species added</InfoBackgroundMessage>;
  }

  const onToggleSpeciesSort = () => {
    const { speciesListSortedByTime } = appModel.attrs;
    const newSort = !speciesListSortedByTime;
    appModel.attrs.speciesListSortedByTime = newSort;
    appModel.save();

    const prettySortName = appModel.attrs.speciesListSortedByTime
      ? 'last added'
      : 'alphabetical';

    toast.success(`Changed list ordering to ${prettySortName}.`, {
      color: 'light',
      position: 'bottom',
      duration: 1000,
    });
  };

  const { speciesListSortedByTime } = appModel.attrs;

  const nameSort = useSubSamples ? speciesNameSortForSamples : speciesNameSort;

  const sort = speciesListSortedByTime ? speciesOccAddedTimeSort : nameSort;

  const speciesList = [...models]
    .sort(sort as any)
    .map(model => (
      <SpeciesListItem
        key={model.cid}
        model={model}
        increaseCount={increaseCount}
        onDelete={() => onDelete(model)}
        useSubSamples={useSubSamples}
      />
    ));

  return (
    <>
      <div id="species-list-sort">
        <IonButton fill="clear" size="small" onClick={onToggleSpeciesSort}>
          <IonIcon icon={filterOutline} mode="md" />
        </IonButton>
      </div>

      <IonList id="list" lines="full" className="mb-2">
        <div className="rounded-list">
          <div className="list-divider species-list-header">
            <IonLabel>Count</IonLabel>
            <IonLabel>Species</IonLabel>
            <IonLabel>{speciesList.length}</IonLabel>
          </div>

          {speciesList}
        </div>
      </IonList>
    </>
  );
};

export default observer(SpeciesList);
