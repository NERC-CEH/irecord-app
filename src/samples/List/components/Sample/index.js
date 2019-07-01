import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import radio from 'radio';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import Location from './components/Location';
import Date from './components/Date';
import OnlineStatus from './components/OnlineStatus';
import Attributes from './components/Attributes';
import Gallery from '../../../../common/gallery';

export function sampleDelete(sample) {
  Log('Samples:List:Controller: deleting sample.');

  let body = window.t(
    "This record hasn't been saved to iRecord yet, " +
      'are you sure you want to remove it from your device?'
  );

  const isSynced = sample.metadata.synced_on;
  if (isSynced) {
    body = t(
      'Are you sure you want to remove this record from your device?' +
        '</br><i><b>Note:</b> it will remain on the server.</i>'
    );
  }
  radio.trigger('app:dialog', {
    title: 'Delete',
    body,
    buttons: [
      {
        title: 'Cancel',
        fill: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: 'Delete',
        color: 'danger',
        onClick() {
          sample.destroy();
          radio.trigger('app:dialog:hide');
          Analytics.trackEvent('List', 'sample remove');
        },
      },
    ],
  });
}

/**
 * Sets a new taxon to an occurrence created by a photo-first method.
 * @param sample
 * @param taxon
 * @param editButtonClicked
 * @returns {*}
 */
export function setTaxon(sample) {
  radio.trigger('samples:edit:attr', sample.cid, 'taxon', {
    onSuccess(taxon, editButtonClicked) {
      return sample
        .setTaxon(taxon)
        .then(() => sample.save())
        .then(() => {
          if (editButtonClicked) {
            radio.trigger('samples:edit', sample.cid, { replace: true });
          } else {
            // return back to list page
            window.history.back();
          }
        });
    },
    showEditButton: true,
  });
}

function showGallery(e, media) {
  Log('Samples:List: photo view.');
  e.stopPropagation();

  const items = [];

  media.forEach(image => {
    items.push({
      src: image.getURL(),
      w: image.get('width') || 800,
      h: image.get('height') || 800,
    });
  });

  // Initializes and opens PhotoSwipe
  const gallery = new Gallery(items);
  gallery.init();
}

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.sampleRef = React.createRef();
  }

  componentWillUnmount() {
    if (this.sampleRef.current) {
      this.sampleRef.current.closeOpened();
    }
  }

  render() {
    const { sample } = this.props;
    const occ = sample.getOccurrence();
    if (!occ) {
      return <div />;
    }

    const specie = occ.get('taxon') || {};
    const media = occ.media.length && occ.media.models[0];
    let img = media && media.get('thumbnail');

    if (!img) {
      // backwards compatibility
      img = media && media.getURL();
    }

    let taxon =
      specie.found_in_name >= 0
        ? specie.common_names[specie.found_in_name]
        : specie.scientific_name;

    if (specie.found_in_name === 'common_name') {
      // This is just to be backwards compatible
      // TODO: remove in the next update
      taxon = specie.common_name;
    }

    const activity = sample.get('activity');

    const survey = sample.getSurvey();
    const isDefaultSurvey = occ.get('taxon') && survey.name === 'default'; // photo-first sample check

    const id = sample.cid;
    const onDatabase = sample.metadata.synced_on;

    img = img ? (
      <img src={img} onClick={e => showGallery(e, occ.media.models)} />
    ) : (
      ''
    );

    const openEditPage = () => {
      window.location.hash = `#samples/${id}${onDatabase ? '' : '/edit'}`;
    };
    const onClick = taxon ? openEditPage : () => setTaxon(sample);

    return (
      <ion-item-sliding key={id} ref={this.sampleRef}>
        <ion-item id="add-species-btn" detail={false} onClick={onClick}>
          {activity && <div className="activity" />}

          <div className="photo">{img}</div>

          <OnlineStatus sample={sample} />

          <div className="media-body">
            {taxon ? (
              <div className="species">{taxon}</div>
            ) : (
              <div className="species error">{t('Species missing')}</div>
            )}

            <div className="core">
              <Date isDefaultSurvey={isDefaultSurvey} sample={sample} />
              <span> @ </span>
              <Location isDefaultSurvey={isDefaultSurvey} sample={sample} />
            </div>

            <div className="attributes">
              <Attributes
                occ={occ}
                isDefaultSurvey={isDefaultSurvey}
                sample={sample}
              />
            </div>
          </div>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option
            id="delete"
            color="danger"
            onClick={() => sampleDelete(sample)}
          >
            <div className="edit icon icon-delete" />
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    );
  }
}

Component.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default Component;
