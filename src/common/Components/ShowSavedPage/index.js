import appModel from 'app_model';
import CONFIG from 'config';
import {
  IonPage,
  IonButton,
  IonItem,
  IonList,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { personAdd, pin, calendar, clipboard, people } from 'ionicons/icons';
import AppHeader from 'Components/Header';
import AppMain from 'Components/Main';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import React from 'react';
import userModel from 'user_model';
// import Gallery from '../../common/gallery';
import './styles.scss';

/**
 * Force resend the record.
 *
 * Wipes its server values and makes it local again. Resubmitting should
 * generate a server conflict and the record should update with the same values
 * if exists already. Otherwise, a new record will be created on the server.
 */
function forceResend(sample) {
  if (Device.isOnline()) {
    if (!userModel.hasLogIn()) {
      // radio.trigger('user:login');
      return;
    }

    // reset the values
    sample.id = null;
    sample.metadata.server_on = null;
    sample.metadata.updated_on = null;
    sample.metadata.synced_on = null;

    sample.save(null, { remote: true }).catch(err => {
      Log(err, 'e');
    });
    window.history.back();
  } else {
    // radio.trigger('app:dialog:error', {
    //   message: 'Looks like you are offline!',
    // });
  }
}

function photoView(e, sample) {
  // e.preventDefault();
  // const items = [];
  // sample.occurrences[0].media.forEach(image => {
  //   items.push({
  //     src: image.getURL(),
  //     w: image.attrs.width || 800,
  //     h: image.attrs.height || 800,
  //   });
  // });
  // // Initializes and opens PhotoSwipe
  // const gallery = new Gallery(items);
  // gallery.init();
}

function getDefaultInfoMessage() {
  const siteUrl = CONFIG.site_url;

  return (
    <p>
      {t('Go to the')} <a href={siteUrl}>{t('ORKS website')}</a> {t('to edit')}.
    </p>
  );
}

function complexShow(sample) {
  const { cid } = sample;
  const { location, date, comment, identifiers } = sample.attrs;
  const prettyDate = DateHelp.print(date, true);
  const locationName = (location || {}).name;
  const { useExperiments } = appModel.attrs;

  return (
    <IonPage id="record-show">
      <AppHeader title={t('View')} />
      <AppMain>
        <div className="info-message">
          <p>
            {t(
              'This record has been submitted and cannot be edited within this App.'
            )}
          </p>
          {getDefaultInfoMessage()}
        </div>

        <IonList lines="full">
          <IonItem>
            <IonIcon icon={pin} slot="start" />
            <IonLabel slot="start">{t('Location')}</IonLabel>
            <IonLabel position="stacked">
              <IonLabel slot="end">{locationName}</IonLabel>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={calendar} slot="start" />
            <IonLabel slot="end">{prettyDate}</IonLabel>
            {t('Date')}
          </IonItem>
          {comment && (
            <IonItem>
              <IonIcon icon={clipboard} slot="start" />
              <IonLabel slot="end">{comment}</IonLabel>
              {t('Comment')}
            </IonItem>
          )}
          {identifiers && (
            <IonItem>
              <IonIcon icon={personAdd} slot="start" />
              <IonLabel slot="end">{identifiers}</IonLabel>
              {t('Identifiers')}
            </IonItem>
          )}
        </IonList>
        {useExperiments && (
          <div id="resend-btn">
            <IonButton color="danger" onClick={() => forceResend(sample)}>
              {t('Allow Re-uploading')}
            </IonButton>
          </div>
        )}
        <div id="occurrence-id">{cid}</div>
      </AppMain>
    </IonPage>
  );
}

export default observer(props => {
  const { savedSamples, match } = props;

  const sample = savedSamples.find(({ cid }) => cid === match.params.id);

  const isComplexSample = !!sample.metadata.complex_survey;
  if (isComplexSample) {
    return complexShow(sample);
  }

  const [occ] = sample.occurrences;
  const specie = occ.attrs.taxon;

  const { scientific_name: scientificName } = specie;

  const commonName =
    specie.found_in_name >= 0 && specie.common_names[specie.found_in_name];

  let { number } = occ.attrs;
  if (!number) {
    number = occ.attrs['number-ranges'];
  }

  // show activity title.
  const { activity, date, location } = sample.attrs;
  const prettyDate = DateHelp.print(date, true);
  const locationName = (location || {}).name;

  const { cid, id, media } = occ;
  const { useExperiments } = appModel.attrs;

  const { stage, type, identifiers, comment } = occ.attrs;
  const activityTitle = activity ? activity.title : null;

  const siteUrl = CONFIG.site_url;
  const infoMessage = id ? (
    <IonButton
      id="record-external-link"
      color="light"
      href={`${siteUrl}record-details?occurrence_id=${id}`}
    >
      {t('View on ORKS')}
    </IonButton>
  ) : (
    getDefaultInfoMessage(siteUrl)
  );

  return (
    <IonPage id="record-show">
      <AppHeader title={t('View')} />
      <AppMain>
        <div className="info-message">
          <p>
            {t(
              'This record has been submitted and cannot be edited within this App.'
            )}
          </p>
          {infoMessage}
        </div>

        <IonList lines="full">
          <IonItem>
            <IonLabel position="stacked">
              {commonName && <IonLabel slot="end">{commonName}</IonLabel>}
              <IonLabel slot="end">
                <i>{scientificName}</i>
              </IonLabel>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={pin} slot="start" />
            <IonLabel slot="start">{t('Location')}</IonLabel>
            <IonLabel position="stacked">
              <IonLabel slot="end">{locationName}</IonLabel>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={calendar} slot="start" />
            <IonLabel slot="end">{prettyDate}</IonLabel>
            {t('Date')}
          </IonItem>
          {number && (
            <IonItem>
              <IonIcon src="/images/number.svg" slot="start" />
              <IonLabel slot="end">{number}</IonLabel>
              {t('Number')}
            </IonItem>
          )}
          {stage && (
            <IonItem>
              <IonIcon src="/images/progress-circles.svg" slot="start" />
              <IonLabel slot="end">{stage}</IonLabel>
              {t('Stage')}
            </IonItem>
          )}
          {type && (
            <IonItem>
              <IonIcon src="/images/progress-circles.svg" slot="start" />
              <IonLabel slot="end">{type}</IonLabel>
              {t('Type')}
            </IonItem>
          )}
          {comment && (
            <IonItem>
              <IonIcon icon={clipboard} slot="start" />
              <IonLabel slot="end">{comment}</IonLabel>
              {t('Comment')}
            </IonItem>
          )}
          {identifiers && (
            <IonItem>
              <IonIcon icon={personAdd} slot="start" />
              <IonLabel slot="end">{identifiers}</IonLabel>
              {t('Identifiers')}
            </IonItem>
          )}
          {activityTitle && (
            <IonItem>
              <IonIcon icon={people} slot="start" />
              <IonLabel slot="end">{activityTitle}</IonLabel>
              {t('Activity')}
            </IonItem>
          )}

          {media.length > 0 && (
            <IonItem id="img-array">
              {media.map((image, i) => (
                <img
                  key={i}
                  src={image.getURL()}
                  onClick={e => photoView(e, sample)}
                  alt=""
                />
              ))}
            </IonItem>
          )}
        </IonList>
        {useExperiments && (
          <div id="resend-btn">
            <IonButton color="danger" onClick={() => forceResend(sample)}>
              {t('Allow Re-uploading')}
            </IonButton>
          </div>
        )}
        <div id="occurrence-id">{cid}</div>
      </AppMain>
    </IonPage>
  );
});
