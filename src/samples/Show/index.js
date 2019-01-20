import appModel from 'app_model';
import Loader from 'common/Components/Loader';
import CONFIG from 'config';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import Log from 'helpers/log';
import StringHelp from 'helpers/string';
import { observer } from 'mobx-react';
import radio from 'radio';
import React from 'react';
import userModel from 'user_model';
import Gallery from '../../common/gallery';
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
      radio.trigger('user:login');
      return;
    }

    // reset the values
    sample.id = null;
    sample.metadata.server_on = null;
    sample.metadata.updated_on = null;
    sample.metadata.synced_on = null;

    sample.save(null, { remote: true }).catch(err => {
      Log(err, 'e');
      radio.trigger('app:dialog:error', err);
    });
    window.history.back();
  } else {
    radio.trigger('app:dialog:error', {
      message: 'Looks like you are offline!',
    });
  }
}

function photoView(e, sample) {
  e.preventDefault();

  const items = [];
  sample.getOccurrence().media.each(image => {
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

export default observer(props => {
  const { sample } = props;

  if (sample.remote.synchronising) {
    return <Loader />;
  }

  const occ = sample.getOccurrence();
  const specie = occ.get('taxon');

  const { scientific_name: scientificName, common_name: commonName } = specie;

  const locationObj = sample.get('location') || {};

  let number = StringHelp.limit(occ.get('number'));
  if (!number) {
    number = StringHelp.limit(occ.get('number-ranges'));
  }

  // show activity title.
  const activity = sample.get('activity');

  const id = occ.id;
  const cid = occ.cid;
  const useExperiments = appModel.get('useExperiments');
  const siteUrl = CONFIG.site_url;
  const location = sample.printLocation();
  const locationName = locationObj.name;
  const date = DateHelp.print(sample.get('date'), true);
  const stage = StringHelp.limit(occ.get('stage'));
  const identifiers = occ.get('identifiers');
  const comment = occ.get('comment');
  const activityTitle = activity ? activity.title : null;
  const media = occ.media;

  const infoMessage = id ? (
    <ion-button
      id="record-external-link"
      color="light"
      href={`${siteUrl}record-details?occurrence_id=${id}`}>
      {t('View on iRecord')}
    </ion-button>
  ) : (
    <p>
      {t('Go to the')} <a href={siteUrl}>{t('iRecord website')}</a>{' '}
      {t('to edit')}.
    </p>
  );

  return (
    <div id="record-show">
      <div className="info-message">
        <p>
          {t(
            'This record has been submitted and cannot be edited within this App.'
          )}
        </p>
        {infoMessage}
      </div>

      <ul className="table-view core inputs info no-top">
        <li className="table-view-cell species">
          {commonName && (
            <span className="media-object pull-right descript">
              {commonName}
            </span>
          )}
          <span className="media-object pull-right descript">
            <i>{scientificName}</i>
          </span>
        </li>
        <li className="table-view-cell">
          <span className="media-object pull-left icon icon-location" />
          <span className="media-object pull-right descript">
            {locationName}
          </span>
          <span className="media-object pull-right descript">{location}</span>
          {t('Location')}
        </li>
        <li className="table-view-cell">
          <span className="media-object pull-left icon icon-calendar" />
          <span className="media-object pull-right descript">{date}</span>
          {t('Date')}
        </li>
        {number && (
          <li className="table-view-cell">
            <span className="media-object pull-left icon icon-number" />
            <span className="media-object pull-right descript">{number}</span>
            {t('Number')}
          </li>
        )}
        {stage && (
          <li className="table-view-cell">
            <span className="media-object pull-left icon icon-stage" />
            <span className="media-object pull-right descript">{stage}</span>
            {t('Stage')}
          </li>
        )}
        {comment && (
          <li className="table-view-cell">
            <span className="media-object pull-left icon icon-comment" />
            {t('Comment')}
            <span className="comment descript">{comment}</span>
          </li>
        )}
        {identifiers && (
          <li className="table-view-cell">
            <span className="media-object pull-left icon icon-user-plus" />
            {t('Identifiers')}
            <span className="comment descript">{identifiers}</span>
          </li>
        )}
        {activityTitle && (
          <li className="table-view-cell">
            <span className="media-object pull-left icon icon-users" />
            <span className="media-object pull-right descript">
              {activityTitle}
            </span>
            {t('Activity')}
          </li>
        )}

        {media.length > 0 && (
          <li id="img-array">
            {media.map((image, i) => (
              <img
                key={i}
                src={image.getURL()}
                onClick={e => photoView(e, sample)}
                alt=""
              />
            ))}
          </li>
        )}
      </ul>

      {useExperiments && (
        <div id="resend-btn">
          <ion-button color="danger" onClick={() => forceResend(sample)}>
            {t('Resend the record')}
          </ion-button>
        </div>
      )}
      <div id="occurrence-id">{cid}</div>
    </div>
  );
});
