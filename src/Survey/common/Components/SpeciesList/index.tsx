import { FC } from 'react';
import { observer } from 'mobx-react';
import {
  IonButton,
  IonIcon,
  IonList,
  IonItemDivider,
  IonLabel,
} from '@ionic/react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { InfoBackgroundMessage, useToast } from '@flumens';
import { filterOutline } from 'ionicons/icons';
import appModel from 'models/app';
import SpeciesListItem from './SpeciesListItem';
import './styles.scss';

const speciesNameSort = (occ1: Occurrence, occ2: Occurrence) => {
  const taxon1 = occ1.attrs.taxon;
  const taxon2 = occ2.attrs.taxon;

  const name1 =
    taxon1.found_in_name >= 0
      ? taxon1.common_names[taxon1.found_in_name]
      : taxon1.scientific_name;
  const name2 =
    taxon2.found_in_name >= 0
      ? taxon2.common_names[taxon2.found_in_name]
      : taxon2.scientific_name;
  return name1.localeCompare(name2);
};

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

const SpeciesList: FC<Props> = ({ onDelete, sample, useSubSamples }) => {
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

      <IonList id="list" lines="full">
        <div className="rounded">
          <IonItemDivider className="species-list-header" mode="ios">
            <IonLabel>Count</IonLabel>
            <IonLabel>Species</IonLabel>
            <IonLabel>{speciesList.length}</IonLabel>
          </IonItemDivider>

          {speciesList}
        </div>
      </IonList>
    </>
  );
};

export default observer(SpeciesList);
