import { observer } from 'mobx-react';
import React from 'react';
import { IonItem, IonLabel, IonIcon, IonList } from '@ionic/react';
import AppMain from 'Components/Main';
import { lock, pin, calendar, clipboard, people } from 'ionicons/icons';
import DateHelp from 'helpers/date';
import coreAttributes from 'common/config/surveys';
import PropTypes from 'prop-types';
import DynamicMenuAttrs from 'Components/DynamicMenuAttrs';
import LocationLabel from './components/LocationLabel';
import './styles.scss';

@observer
class Component extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    onAttrToggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
  };

  render() {
    const { sample, appModel, onAttrToggle, url } = this.props;

    const [occ] = sample.occurrences;
    const species = occ.attrs.taxon || {};
    const { comment } = occ.attrs;
    const date = DateHelp.print(sample.attrs.date, true);

    // taxon
    const scientificName = species.scientific_name;
    const commonName =
      species.found_in_name >= 0 && species.common_names[species.found_in_name];

    const attrLocks = {};
    // TODO: don't rely on core attributes list to build this as it could contain
    // more than we need
    coreAttributes.forEach(attr => {
      const [attrType, attrName] = attr.split(':');
      const model = attrType === 'smp' ? sample : occ;
      attrLocks[attr] = appModel.isAttrLocked(model, attrName);
    });

    // show activity title.
    const { activity } = sample.attrs;
    const activityTitle = activity ? activity.title : null;

    const locks = attrLocks;

    function getButtonIcon(lockName) {
      let isLocked = locks[lockName];
      if (lockName === 'smp:location') {
        isLocked = locks['smp:location'] || locks['smp:locationName'];
        return {
          detailIcon: isLocked ? lock : 'ios-arrow-forward',
        };
      }

      return {
        detailIcon: isLocked ? lock : 'ios-arrow-forward',
        className: isLocked ? 'locked' : '',
      };
    }

    return (
      <AppMain>
        <IonList lines="full" class="core inputs slim">
          <IonItem detail routerLink={`${url}/taxa`}>
            <IonLabel text-wrap>
              {!commonName && !scientificName && (
                <IonLabel className="error" slot="end">
                  {t('Species missing')}
                </IonLabel>
              )}
              {commonName && (
                <IonLabel className="long" slot="end">
                  {commonName}
                </IonLabel>
              )}
              <IonLabel className="long" slot="end">
                <i>{scientificName}</i>
              </IonLabel>
            </IonLabel>
          </IonItem>
          <IonItem
            routerLink={`${url}/location`}
            detail
            {...getButtonIcon('smp:location')}
          >
            <IonIcon icon={pin} slot="start" />

            <IonLabel text-wrap>
              <LocationLabel sample={sample} locks={locks} />
            </IonLabel>
            <IonLabel slot="start" className="location-label">
              {t('Location')}
            </IonLabel>
          </IonItem>
          <IonItem
            routerLink={`${url}/date`}
            detail
            {...getButtonIcon('smp:date')}
          >
            <IonIcon icon={calendar} slot="start" />
            <IonLabel slot="end">{date}</IonLabel>
            {t('Date')}
          </IonItem>
          <IonItem
            routerLink={`${url}/occ/${occ.cid}/comment`}
            detail
            {...getButtonIcon('occ:comment')}
          >
            <IonIcon icon={clipboard} slot="start" />
            <IonLabel slot="end">{comment}</IonLabel>
            {/* <div slot="end">
              <IonButton
                shape="round"
                fill="clear"
                size="default"
                onClick={this.decreaseCount}
              >
                <IonIcon icon={removeCircleOutline} />
              </IonButton>
              <span>{count}</span>
              <IonButton
                shape="round"
                fill="clear"
                size="default"
                onClick={this.increaseCount}
              >
                <IonIcon icon={addCircleOutline} />
              </IonButton>
            </div> */}
            {t('Comment')}
          </IonItem>
          {activityTitle && (
            <IonItem
              routerLink={`${url}/activity`}
              detail
              {...getButtonIcon('smp:activity')}
            >
              <IonIcon icon={people} slot="start" />
              <IonLabel slot="end">{activityTitle}</IonLabel>
              {t('Activity')}
            </IonItem>
          )}
        </IonList>

        <DynamicMenuAttrs
          appModel={appModel}
          model={sample}
          onAttrToggle={onAttrToggle}
          url={url}
          useLocks
        />
      </AppMain>
    );
  }
}

export default Component;
