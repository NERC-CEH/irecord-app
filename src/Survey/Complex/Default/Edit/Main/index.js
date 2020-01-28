import { observer } from 'mobx-react';
import React from 'react';
import { IonButton, IonLabel, IonList } from '@ionic/react';
import AppMain from 'Components/Main';
import DynamicMenuAttrs from 'Components/DynamicMenuAttrs';
import PropTypes from 'prop-types';
import SpeciesList from './components/SpeciesList';
import './styles.scss';

@observer
class Component extends React.Component {
  static propTypes = {
    surveySample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    history: PropTypes.object,
    url: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onToggleSpeciesSort: PropTypes.func.isRequired,
    speciesListSortedByTime: PropTypes.bool.isRequired,
  };

  render() {
    const {
      surveySample,
      url,
      history,
      onDelete,
      onToggleSpeciesSort,
      speciesListSortedByTime,
      appModel,
    } = this.props;

    // calculate unique taxa
    const uniqueTaxa = {};
    surveySample.samples.forEach(childSample => {
      const [occ] = childSample.occurrences;
      if (occ) {
        const taxon = occ.attrs.taxon || {};
        uniqueTaxa[taxon.warehouse_id] = true;
      }
    });

    return (
      <AppMain>
        <IonList lines="full" class="core inputs">
          <DynamicMenuAttrs
            appModel={appModel}
            model={surveySample}
            noWrapper
            url={url}
          />
        </IonList>

        <IonButton
          color="primary"
          expand="block"
          id="add"
          onClick={() => {
            history.push(
              `/survey/complex/default/${surveySample.cid}/edit/smp/new`
            );
          }}
        >
          <IonLabel>{t('Add Species')}</IonLabel>
        </IonButton>

        <SpeciesList
          surveySample={surveySample}
          onDelete={onDelete}
          url={url}
          onToggleSpeciesSort={onToggleSpeciesSort}
          speciesListSortedByTime={speciesListSortedByTime}
        />
      </AppMain>
    );
  }
}

export default Component;
