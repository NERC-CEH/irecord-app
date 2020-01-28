import React from 'react';
import PropTypes from 'prop-types';
import alert from 'common/helpers/alert';
import { observer } from 'mobx-react';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { open } from 'ionicons/icons';
import OnlineStatus from './components/OnlineStatus';
import ErrorMessage from './components/ErrorMessage';
import Attributes from './components/Attributes';
import Location from './components/Location';
import './styles.scss';

function deleteSurvey(sample) {
  let body = t(
    "This record hasn't been uploaded to the database yet. " +
      'Are you sure you want to remove it from your device?'
  );

  const isSynced = sample.metadata.synced_on;
  if (isSynced) {
    body = t(
      'Are you sure you want to remove this record from your device?' +
        '</br><i><b>Note:</b> it will remain on the database.</i>'
    );
  }
  alert({
    header: t('Delete'),
    message: body,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Delete'),
        cssClass: 'danger',
        handler: () => sample.destroy(),
      },
    ],
  });
}

function showGallery(e, media) {
  e.stopPropagation();

  const items = [];

  media.forEach(image => {
    items.push({
      src: image.getURL(),
      w: image.attrs.width || 800,
      h: image.attrs.height || 800,
    });
  });

  // Initializes and opens PhotoSwipe
  // TODO:
  // const gallery = new Gallery(items);
  // gallery.init();
}

const Survey = observer(({ sample, style }) => {
  const isSent = sample.metadata.server_on;
  const survey = sample.getSurvey();

  const { synchronising } = sample.remote;

  let href;
  if (!synchronising) {
    const allowEdit = !isSent;
    if (survey.complex) {
      href = allowEdit
        ? `/survey/complex/${survey.name}/${sample.cid}/edit`
        : `/survey/complex/${survey.name}/${sample.cid}/show`;
    } else {
      href = allowEdit
        ? `/survey/default/${sample.cid}/edit`
        : `/survey/default/${sample.cid}/show`;
    }
  }
  let externalHref;

  function getSampleInfo() {
    if (survey.complex) {
      const speciesCount = sample.samples.length;
      return (
        <>
          <div className="photo">
            <div className="complex-survey-band" />
          </div>

          <OnlineStatus sample={sample} />

          <div className="details">
            <div className="survey-name">{`${survey.label} Survey`}</div>

            <div className="core">
              <Location isDefaultSurvey={isDefaultSurvey} sample={sample} />
            </div>

            <div className="species-count">
              {`${t('Species')}: ${speciesCount}`}
            </div>
          </div>
        </>
      );
    }

    const [occ] = sample.occurrences;
    if (!occ) {
      return <div />;
    }

    const specie = occ.attrs.taxon || {};
    const media = occ.media.length && occ.media[0];
    let img = media && media.attrs.thumbnail;

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

    const { activity } = sample.attrs;

    const isDefaultSurvey = occ.attrs.taxon && survey.name === 'default'; // photo-first sample check

    img = img ? <img src={img} onClick={e => showGallery(e, occ.media)} /> : '';
    
    return (
      <>
        <div className="photo">
          {activity && <div className="activity-band" />}
          {img}
        </div>

        <OnlineStatus sample={sample} />

        <div className="details">
          {taxon ? (
            <div className="species">{taxon}</div>
          ) : (
            <div className="species error">{t('Species missing')}</div>
          )}

          <div className="core">
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
      </>
    );
  }

  return (
    <IonItemSliding class="survey-list-item" style={style}>
      <ErrorMessage sample={sample} />
      <IonItem
        routerLink={href}
        href={externalHref}
        detailIcon={externalHref ? open : undefined}
      >
        {getSampleInfo()}
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={() => deleteSurvey(sample)}>
          {t('Delete')}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
});

Survey.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default Survey;
