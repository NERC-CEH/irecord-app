import { observer } from 'mobx-react';
import React from 'react';
import radio from 'radio';
import './styles.scss';
import Indicia from 'indicia';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import { coreAttributes } from 'common/config/surveys/general';
import PropTypes from 'prop-types';
import Attributes from './components/Attributes';
import LocationLabel from './components/LocationLabel';

/**
 * Need to push the main content down due to the subheader
 * @returns {string}
 */
function getBandMarginClass(sample) {
  let amount = 0;

  if (sample.get('activity')) {
    amount++;
  }

  if (sample.metadata.training) {
    amount++;
  }

  return amount > 0 ? `band-margin-${amount}` : '';
}

export function updateTaxon(sample, taxon) {
  // edit existing one
  return sample
    .setTaxon(taxon)
    .then(() => sample.save())
    .then(() => window.history.back());
}

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.changeSpecies = this.changeSpecies.bind(this);
    this.state = {};
  }

  changeSpecies() {
    const { sample } = this.props;
    radio.trigger('samples:edit:attr', sample.id, 'taxon', {
      onSuccess: taxon => updateTaxon(sample, taxon),
    });
  }

  render() {
    const { sample, appModel } = this.props;
    const occ = sample.getOccurrence();
    const specie = occ.get('taxon') || {};

    // taxon
    const scientificName = StringHelp.limit(specie.scientific_name);
    const commonName = StringHelp.limit(specie.common_name);

    const attrLocks = {};
    // TODO: don't rely on core attributes list to build this as it could contain
    // more than we need
    coreAttributes.forEach(attr => {
      const model = attr.split(':')[0] === 'smp' ? sample : occ;
      attrLocks[attr] = appModel.isAttrLocked(model, attr.split(':')[1]);
    });

    // show activity title.
    const activity = sample.get('activity');
    const activityTitle = activity ? activity.title : null;

    const id = sample.cid;
    const isSynchronising = sample.getSyncStatus() === Indicia.SYNCHRONISING;
    const obj = {
      'smp:date': DateHelp.print(sample.get('date'), true),
      'occ:comment': StringHelp.limit(occ.get('comment')),
      'smp:activity': activityTitle,
    };
    const locks = attrLocks;

    function getButtonIcon(lockName) {
      let isLocked = locks[lockName];
      if (lockName === 'smp:location') {
        isLocked = locks['smp:location'] || locks['smp:locationName'];
      }
      return isLocked ? 'lock' : 'ios-arrow-forward';
    }

    const activityExists = !!sample.get('activity');

    return (
      <div className="attr-edit">
        <ion-list
          lines="full"
          class={`core inputs slim ${
            isSynchronising ? 'disabled' : ''
          } ${getBandMarginClass(sample)}`}>
          <ion-item id="species-button" detail onClick={this.changeSpecies}>
            <ion-label text-wrap>
              {commonName && (
                <span className="descript long">{commonName}</span>
              )}
              <span className="descript long">
                <i>{scientificName}</i>
              </span>
            </ion-label>
          </ion-item>
          <ion-item
            href={`#samples/${id}/edit/location`}
            id="location-button"
            detail
            detail-icon={getButtonIcon('smp:location')}>
            <span slot="start" className="media-object icon icon-location" />

            <ion-label slot="end" text-wrap>
              <LocationLabel sample={sample} locks={locks} />
            </ion-label>

            {t('Location')}
          </ion-item>
          <ion-item
            href={`#samples/${id}/edit/smp:date`}
            id="date-button"
            detail
            detail-icon={getButtonIcon('smp:date')}>
            <span slot="start" className="media-object icon icon-calendar" />
            <span slot="end" className="descript">
              {obj['smp:date']}
            </span>
            {t('Date')}
          </ion-item>
          <ion-item
            href={`#samples/${id}/edit/occ:comment`}
            id="comment-button"
            detail
            detail-icon={getButtonIcon('occ:comment')}>
            <span slot="start" className="media-object icon icon-comment" />
            <span slot="end" className="descript">
              {obj['occ:comment']}
            </span>
            {t('Comment')}
          </ion-item>
          {obj['smp:activity'] && (
            <ion-item
              href={`#samples/${id}/edit/activity`}
              id="activity-button"
              detail
              detail-icon={getButtonIcon('smp:activity')}>
              <span slot="start" className="media-object icon icon-users" />
              <span slot="end" className="descript">
                {obj['smp:activity']}
              </span>
              {t('Activity')}
            </ion-item>
          )}
        </ion-list>

        <Attributes
          activityExists={activityExists}
          appModel={appModel}
          sample={sample}
        />
      </div>
    );
  }
}

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
};

export default Component;
