import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonButton, IonItem, IonIcon, IonList } from '@ionic/react';
import { funnel } from 'ionicons/icons';
import SubSample from './components/SubSample';

const speciesNameSort = (smp1, smp2) => {
  const [occ1] = smp1.occurrences;
  const [occ2] = smp2.occurrences;
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

const speciesOccAddedTimeSort = (smp1, smp2) => {
  const date1 = new Date(smp1.metadata.updated_on);
  const date2 = new Date(smp2.metadata.updated_on);
  return date2.getTime() - date1.getTime();
};

function SpeciesList({
  onDelete,
  speciesListSortedByTime,
  surveySample,
  url,
  onToggleSpeciesSort,
}) {
  if (!surveySample.samples.length) {
    return (
      <IonList id="list" lines="full">
        <IonItem className="empty">
          <span>{t('No species added')}</span>
        </IonItem>
      </IonList>
    );
  }

  const sort = speciesListSortedByTime
    ? speciesOccAddedTimeSort
    : speciesNameSort;

  const subSamples = [...surveySample.samples].sort(sort);

  return (
    <>
      <div id="species-list-sort">
        <IonButton fill="clear" size="small" onClick={onToggleSpeciesSort}>
          <IonIcon icon={funnel} mode="md" />
        </IonButton>
      </div>

      <IonList id="list" lines="full">
        {subSamples.map(subSample => (
          <SubSample
            key={subSample.cid}
            surveySample={surveySample}
            subSample={subSample}
            url={url}
            onDelete={() => onDelete(subSample)}
          />
        ))}
      </IonList>
    </>
  );
}

SpeciesList.propTypes = {
  surveySample: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleSpeciesSort: PropTypes.func.isRequired,
  speciesListSortedByTime: PropTypes.bool.isRequired,
};

export default observer(SpeciesList);
