import { observer } from 'mobx-react';
import React from 'react';
import { IonButton, IonLabel, IonList, IonIcon, IonItem } from '@ionic/react';
import AppMain from 'Components/Main';
import DynamicMenuAttrs from 'Components/DynamicMenuAttrs';
import PropTypes from 'prop-types';
import { lock, people } from 'ionicons/icons';
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

    // show activity title.
    const  activity  = surveySample.attrs.activity || {};
    const activityTitle = activity ? activity.title : null;
    const lockedaAtivity = appModel.getAttrLock('smp', 'activity') || {};
    const isActivityLocked = activity.id === lockedaAtivity.id;

    return (
      <AppMain>
        <IonList lines="full" class="core inputs">
          <DynamicMenuAttrs
            appModel={appModel}
            model={surveySample}
            noWrapper
            url={url}
          />
          {activityTitle && (
            <IonItem
              routerLink={`${url}/activity`}
              detail
              detailIcon={isActivityLocked ? lock : 'ios-arrow-forward'}
              className={isActivityLocked ? 'locked' : ''}
            >
              <IonIcon icon={people} slot="start" />
              <IonLabel slot="end">{activityTitle}</IonLabel>
              {t('Activity')}
            </IonItem>
          )}
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
