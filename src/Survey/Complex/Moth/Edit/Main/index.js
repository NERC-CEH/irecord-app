import { observer } from 'mobx-react';
import React from 'react';
import { IonButton, IonLabel } from '@ionic/react';
import AppMain from 'Components/Main';
import PropTypes from 'prop-types';
import DynamicMenuAttrs from 'Components/DynamicMenuAttrs';
import SpeciesList from './components/SpeciesList';
import './styles.scss';

@observer
class Component extends React.Component {
  static propTypes = {
    surveySample: PropTypes.object.isRequired,
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
    } = this.props;

    return (
      <AppMain>
        <DynamicMenuAttrs model={surveySample} url={url} />

        <IonButton
          color="primary"
          expand="block"
          id="add"
          onClick={() => {
            history.push(
              `/survey/complex/moth/${surveySample.cid}/edit/occ/new`
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
