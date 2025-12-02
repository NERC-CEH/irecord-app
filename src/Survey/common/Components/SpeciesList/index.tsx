import { useState } from 'react';
import { observer } from 'mobx-react';
import { filterOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { InfoBackgroundMessage, useToast } from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import BulkEdit, { Action } from './BulkEdit';
import SpeciesListItem from './SpeciesListItem';

const speciesNameSort = (occ1: Occurrence, occ2: Occurrence) =>
  occ1.getPrettyName().localeCompare(occ2.getPrettyName());

const speciesNameSortForSamples = (smp1: Sample, smp2: Sample) =>
  speciesNameSort(smp1.occurrences[0], smp2.occurrences[0]);

const speciesOccAddedTimeSort = (
  model1: Sample | Occurrence,
  model2: Sample | Occurrence
) => {
  const date1 = new Date(model1.createdAt);
  const date2 = new Date(model2.createdAt);
  return date2.getTime() - date1.getTime();
};

function increaseCount(occ: Occurrence, is5x: boolean) {
  if (Number.isNaN(occ.data.number)) return;

  const addOneCount = () => (occ.data.number as number)++; // eslint-disable-line no-param-reassign

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
  onBulkEdit?: (action: Action, modelIds: string[], value?: any) => void;
  useSubSamples?: boolean;
};

const SpeciesList = ({
  onDelete,
  sample,
  useSubSamples,
  onBulkEdit,
}: Props) => {
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const toast = useToast();

  const models = useSubSamples ? sample.samples : sample.occurrences;
  if (!models.length)
    return <InfoBackgroundMessage>No species added</InfoBackgroundMessage>;

  const { speciesListSortedByTime } = appModel.data;

  const nameSort = useSubSamples ? speciesNameSortForSamples : speciesNameSort;

  const sort = speciesListSortedByTime ? speciesOccAddedTimeSort : nameSort;

  const onToggleSpeciesSort = () => {
    const newSort = !speciesListSortedByTime;
    appModel.data.speciesListSortedByTime = newSort;
    appModel.save();

    const prettySortName = appModel.data.speciesListSortedByTime
      ? 'last added'
      : 'alphabetical';

    toast.success(`Changed list ordering to ${prettySortName}.`, {
      color: 'light',
      position: 'bottom',
      duration: 1000,
    });
  };

  const speciesList = [...models]
    .sort(sort as any)
    .map(model => (
      <SpeciesListItem
        key={model.cid}
        model={model}
        increaseCount={increaseCount}
        onDelete={() => onDelete(model)}
        useSubSamples={useSubSamples}
        isBulkEditing={isBulkEditing}
      />
    ));

  return (
    <div className="w-full">
      <BulkEdit
        onBulkEdit={onBulkEdit}
        onEditChange={setIsBulkEditing}
        models={models}
      >
        <IonList id="list" lines="full" className="w-full">
          <div className="rounded-list">
            <div className="list-divider">
              {!isBulkEditing && (
                <div className="flex justify-start gap-7">
                  {!sample.isDisabled && !isBulkEditing && (
                    <div className="max-w-[54px]">
                      <T>Count</T>
                    </div>
                  )}
                  <div className="shrink-0">
                    <T>Species</T>{' '}
                    {speciesList.length > 0 && (
                      <span className="opacity-70">({speciesList.length})</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-center w-full justify-end">
                <BulkEdit.Control />

                {!isBulkEditing && (
                  <IonIcon
                    icon={filterOutline}
                    mode="md"
                    className="size-5 p-0"
                    onClick={onToggleSpeciesSort}
                  />
                )}
              </div>
            </div>

            {speciesList}
          </div>
        </IonList>
      </BulkEdit>
    </div>
  );
};

export default observer(SpeciesList);
