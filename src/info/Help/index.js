import React from 'react';
import CONFIG from 'config';
import './swipe_record.png';

export default () => (
  <ul className="table-view accordion" id="accordion">
    <li className="table-view-divider">{t('Records')}</li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c1"
        aria-expanded="false"
        aria-controls="c1"
      >
        <span className="icon icon-collapse pull-left" />
        {t('How to make a new record')}
      </a>
      <p
        id="c1"
        className="collapse"
        aria-labelledby="headingOne"
        aria-expanded="false"
      >
        {t('There are two ways to start a record')}.
        <br />
        <br />
        <strong>{t('Taking a photo')}</strong>
        <br />
        {t(
          'Press the camera button'
        )} <span className="icon icon-camera" />{' '}
        {t(
          'in the home page header. This will prompt you to select the photo source: camera or gallery. Once you have picked a photo, the app will create a new record without any species associated with it. Clicking on the newly created record will open the taxa search page.'
        )}
        <br />
        <br />
        <strong>{t('Selecting species')}</strong>
        <br />
        {t('Please press the plus')} <span className="icon icon-plus" />{' '}
        {t(
          'button in the home page header. This will bring you to the taxa search page. After selecting the species, open the record (either by opening it directly from the taxa search page using the edit button'
        )}
        <span className="icon edit" />{' '}
        {t(
          'beside the species name or through the home-list page) and fill in the details of the sighting, like location, date, number seen etc'
        )}.
        <br />
        <br />
        {t('When finished, set for submission by pressing the paper plane')}
        <span className="icon icon-send" /> {t('button')}
      </p>
    </li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c2"
        aria-expanded="false"
        aria-controls="c2"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Searching for species')}
      </a>
      <p
        id="c2"
        className="collapse"
        aria-labelledby="headingOne"
        aria-expanded="false"
      >
        {t(
          'The application holds all of the UK’s species (70000+) and all the associated taxonomy ranks. For quicker searching of the taxa you can use different shortcuts. For example, to find'
        )}{' '}
        <i>Puffinus puffinus</i> {t('you can type in the search bar')}:
        <br />
        <br />
        <i>puf puf</i>
        <br />
        <i>p puf</i>
        <br />
        <i>p .nus</i>
      </p>
    </li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c3"
        aria-expanded="false"
        aria-controls="c3"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Sync. with iRecord')}
      </a>
      <p
        id="c3"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t(
          'All your saved records will be shown on the home page. By default a record is in'
        )}{' '}
        <i>{t('draft')}</i>{' '}
        {t('mode until it is set for submission. While it is in')}{' '}
        <i>{t('draft')}</i>{' '}
        {t(
          'mode the application will not synchronise your record with the database. To set it for sending, open the record and press the'
        )}
        <span className="icon icon-send" />{' '}
        {t(
          'button in the header. The application will try to submit your record once there is a good network connection'
        )}. {t('If the record has reached the database a red')}{' '}
        <span className="icon icon-send" style={{ color: 'red' }} />({t(
          'set for submission & saved locally'
        )}) {t('will become green')}{' '}
        <span className="icon icon-send" style={{ color: 'green' }} /> ({t(
          'synced to the database'
        )}).{' '}
        {t(
          'Once it has successfully reached the database the record becomes unavailable for new edits. To further edit it please use the'
        )}{' '}
        <a href="http://irecord.org.uk">{t('iRecord Website')}</a>.
        <br />
        <br />
        <b>{t('Note')}:</b>{' '}
        {t(
          'you have to be signed in to your iRecord account and have a network connection, for the records to be automatically synchronised in the background'
        )}.
        <br />
      </p>
    </li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c4"
        aria-expanded="false"
        aria-controls="c4"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Send all records')}
      </a>
      <p
        id="c4"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t(
          'You can set all your draft records for submission. To do that go to the settings page'
        )}
        <span className="icon icon-settings" /> {t('and click Submit All')}
        <span className="icon icon-send" /> {t('button')}.{' '}
        {t('This will try to send all the valid records')}.
      </p>
    </li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c5"
        aria-expanded="false"
        aria-controls="c5"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Delete a record')}
      </a>
      <p
        id="c5"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t(
          'To delete a record, swipe it left in the home-list page and click the delete'
        )}
        <span className="icon icon-delete" /> {t('button')}.
        <img src="images/swipe_record.png" />
        <br />
        <br />
        {t(
          'You can also remove all the locally saved records that have been successfully synchronised with the database. This will leave the records on the database untouched. To do that go to settings page'
        )}
        <span className="icon icon-settings" /> {t('and click')}{' '}
        {t('Remove All Saved')}
        <span className="icon icon-delete" /> {t('button')}.
      </p>
    </li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#locks"
        aria-expanded="false"
        aria-controls="locks"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Lock an attribute')}
      </a>
      <p
        id="locks"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t(
          'You can lock record attributes like date, location, number etc, which will preserve your current attribute value for the subsequently added records'
        )}.
        <br />
        {t('To lock an attribute click on the lock')}{' '}
        <span className="icon icon-lock-open" />{' '}
        {t(
          'button in the attribute edit page header. This will change the symbol to locked'
        )}
        <span className="icon icon-lock-closed" />{' '}
        {t('both on the button and next to the attribute')}.
        <br />
        <br />
        <b>{t('Note')}:</b>{' '}
        {t(
          'For a GPS-sourced location, only the location name can be locked, not the GPS value. As you move about, the GPS value will change. This will allow recording of different GPS values within an named area while keeping the location name the same. You can lock a location if it is selected using a map or entered manually'
        )}.
      </p>
    </li>

    <li className="table-view-divider">{t('User')}</li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c9"
        aria-expanded="false"
        aria-controls="c9"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Sign in/out or register')}
      </a>
      <p
        id="c9"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t('To login, open the main menu page')}{' '}
        <span className="icon icon-menu" />,
        {t('click Login')} <span className="icon icon-user" />
        {t('or Register')} <span className="icon icon-user-plus" />
        {t('buttons and follow the instructions')}.
        <br />
        <br />
        {t('To logout, visit the main menu page')}{' '}
        <span className="icon icon-menu" />
        {t('and click the logout')} <span className="icon icon-logout" />{' '}
        {t('button')}.
        <br />
        <br />
        <b>{t('Note')}:</b>{' '}
        {t(
          'after registering a new account you must verify your email address by clicking on a verification link sent to your email'
        )}.
      </p>
    </li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#activities-help"
        aria-expanded="false"
        aria-controls="activities-help"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Activities')}
      </a>
      <p
        id="activities-help"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t(
          'To send records to a specific activity you can select it in the Activities'
        )}
        <span className="icon icon-users" /> {t('page')}.
        <br />
        <br />
        <b>{t('Note')}:</b>{' '}
        {t(
          'only the activities that allow this mobile app records and only the ones that you have joined on the iRecord website will be available to select'
        )}.
      </p>
    </li>

    <li className="table-view-divider">{t('Other')}</li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c7"
        aria-expanded="false"
        aria-controls="c7"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Manage saved locations')}
      </a>
      <p
        id="c7"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t(
          "You can manage your saved locations both on any record's location page and from the settings page"
        )}
        <span className="icon icon-settings" />.{' '}
        {t('Swipe a location left and click edit')}
        <span className="icon icon-edit" /> {t('or delete')}
        <span className="icon icon-delete" /> {t('buttons')}.
        <br />
        <br />
        <span className="location-favourite icon icon-star " />{' '}
        {t(
          'You can make your location stick to the top of the locations list by clicking the Favourite toggle'
        )}.
      </p>
    </li>
    <li className="table-view-cell">
      <a
        className="collapsed"
        data-toggle="collapse"
        data-parent="#accordion"
        href="#c8"
        aria-expanded="false"
        aria-controls="c8"
      >
        <span className="icon icon-collapse pull-left" />
        {t('Reset the application')}
      </a>
      <p
        id="c8"
        className="collapse"
        aria-labelledby="headingTwo"
        aria-expanded="false"
      >
        {t('Go to the application settings page')}{' '}
        <span className="icon icon-settings" /> {t('and click on the Reset')}{' '}
        <span className="icon icon-undo" />
        {t('button')}.
      </p>
    </li>
    <li>
      {t('For more help please visit the iRecord')}{' '}
      <a href={`${CONFIG.site_url}/forum/26`}>{t('forum')}</a>.
    </li>
  </ul>
);
