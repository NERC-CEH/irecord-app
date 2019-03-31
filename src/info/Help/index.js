import React from 'react';
import CONFIG from 'config';
import Collapse from 'common/Components/Collapse/index';
import Icon from 'common/Components/Icon';
import './swipe_record.png';

export default () => (
  <div>
    <ion-list lines="full">
      <ion-item-divider>{t('Records')}</ion-item-divider>
      <Collapse title={t('How to make a new record')}>
        <p>
          {t('There are two ways to start a record')}
.
          <br />
          <br />
          <strong>{t('Taking a photo')}</strong>
          <br />
          {t('Press the camera button')} 
          {' '}
          <Icon i="camera" />
          {' '}
          {t(
            'in the home page header. This will prompt you to select the photo source: camera or gallery. Once you have picked a photo, the app will create a new record without any species associated with it. Clicking on the newly created record will open the taxa search page.'
          )}
          <br />
          <br />
          <strong>{t('Selecting species')}</strong>
          <br />
          {t('Please press the plus')} 
          {' '}
          <Icon i="plus" />
          {' '}
          {t(
            'button in the home page header. This will bring you to the taxa search page. After selecting the species, open the record (either by opening it directly from the taxa search page using the edit button'
          )}
          <span className="icon edit" />
          {' '}
          {t(
            'beside the species name or through the home-list page) and fill in the details of the sighting, like location, date, number seen etc'
          )}
          .
          <br />
          <br />
          {t('When finished, set for submission by pressing the paper plane')}
          <Icon i="send" /> 
          {' '}
          {t('button')}
        </p>
      </Collapse>

      <Collapse title={t('Searching for species')}>
        <p>
          {t(
            'The application holds all of the UK’s species (70000+) and all the associated taxonomy ranks. For quicker searching of the taxa you can use different shortcuts. For example, to find'
          )}
          {' '}
          <i>Puffinus puffinus</i> 
          {' '}
          {t('you can type in the search bar')}
:
          <br />
          <br />
          <i>puf puf</i>
          <br />
          <i>p puf</i>
          <br />
          <i>p .nus</i>
        </p>
      </Collapse>
      <Collapse title={t('Sync. with iRecord')}>
        <p>
          {t(
            'All your saved records will be shown on the home page. By default a record is in'
          )}
          {' '}
          <i>{t('draft')}</i>
          {' '}
          {t('mode until it is set for submission. While it is in')}
          {' '}
          <i>{t('draft')}</i>
          {' '}
          {t(
            'mode the application will not synchronise your record with the database. To set it for sending, open the record and press the'
          )}
          <Icon i="send" />
          {' '}
          {t(
            'button in the header. The application will try to submit your record once there is a good network connection'
          )}
          . 
          {' '}
          {t('If the record has reached the database a red')}
          {' '}
          <Icon i="send" style={{ color: 'red' }} />
(
          {t('set for submission & saved locally')}
)
          {t('will become green')}
          {' '}
          <Icon i="send" style={{ color: 'green' }} />
          {' '}
(
          {t('synced to the database')}
).
          {' '}
          {t(
            'Once it has successfully reached the database the record becomes unavailable for new edits. To further edit it please use the'
          )}
          {' '}
          <a href="http://irecord.org.uk">{t('iRecord Website')}</a>
.
          <br />
          <br />
          <b>
            {t('Note')}
:
          </b>
          {' '}
          {t(
            'you have to be signed in to your iRecord account and have a network connection, for the records to be automatically synchronised in the background'
          )}
          .
          <br />
        </p>
      </Collapse>
      <Collapse title={t('Send all records')}>
        <p>
          {t(
            'You can set all your draft records for submission. To do that go to the settings page'
          )}
          <Icon i="settings" /> 
          {' '}
          {t('and click Submit All')}
          <Icon i="send" /> 
          {' '}
          {t('button')}
.
          {' '}
          {t('This will try to send all the valid records')}
.
        </p>
      </Collapse>
      <Collapse title={t('Delete a record')}>
        <p>
          {t(
            'To delete a record, swipe it left in the home-list page and click the delete'
          )}
          <Icon i="delete" /> 
          {' '}
          {t('button')}
.
          <img src="images/swipe_record.png" />
          <br />
          <br />
          {t(
            'You can also remove all the locally saved records that have been successfully synchronised with the database. This will leave the records on the database untouched. To do that go to settings page'
          )}
          <Icon i="settings" /> 
          {' '}
          {t('and click')} 
          {' '}
          {t('Remove All Saved')}
          <Icon i="delete" /> 
          {' '}
          {t('button')}
.
        </p>
      </Collapse>
      <Collapse title={t('Lock an attribute')}>
        <p>
          {t(
            'You can lock record attributes like date, location, number etc, which will preserve your current attribute value for the subsequently added records'
          )}
          .
          <br />
          {t(
            'To lock an attribute click on the lock'
          )} 
          {' '}
          <Icon i="lock-open" />
          {' '}
          {t(
            'button in the attribute edit page header. This will change the symbol to locked'
          )}
          <Icon i="lock-closed" />
          {' '}
          {t('both on the button and next to the attribute')}
.
          <br />
          <br />
          <b>
            {t('Note')}
:
          </b>
          {' '}
          {t(
            'For a GPS-sourced location, only the location name can be locked, not the GPS value. As you move about, the GPS value will change. This will allow recording of different GPS values within an named area while keeping the location name the same. You can lock a location if it is selected using a map or entered manually'
          )}
          .
        </p>
      </Collapse>

      <ion-item-divider>{t('User')}</ion-item-divider>
      <Collapse title={t('Sign in/out or register')}>
        <p>
          {t('To login, open the main menu page')} 
          {' '}
          <Icon i="menu" />
,
          {t('click Login')} 
          {' '}
          <Icon i="user" />
          {t('or Register')} 
          {' '}
          <Icon i="user-plus" />
          {t('buttons and follow the instructions')}
.
          <br />
          <br />
          {t('To logout, visit the main menu page')} 
          {' '}
          <Icon i="menu" />
          {t('and click the logout')} 
          {' '}
          <Icon i="logout" /> 
          {' '}
          {t('button')}
.
          <br />
          <br />
          <b>
            {t('Note')}
:
          </b>
          {' '}
          {t(
            'after registering a new account you must verify your email address by clicking on a verification link sent to your email'
          )}
          .
        </p>
      </Collapse>
      <Collapse title={t('Activities')}>
        <p>
          {t(
            'To send records to a specific activity you can select it in the Activities'
          )}
          <Icon i="users" /> 
          {' '}
          {t('page')}
.
          <br />
          <br />
          <b>
            {t('Note')}
:
          </b>
          {' '}
          {t(
            'only the activities that allow this mobile app records and only the ones that you have joined on the iRecord website will be available to select'
          )}
          .
        </p>
      </Collapse>

      <ion-item-divider>{t('Other')}</ion-item-divider>
      <Collapse title={t('Manage saved locations')}>
        <p>
          {t(
            "You can manage your saved locations both on any record's location page and from the settings page"
          )}
          <Icon i="settings" />
.
          {t('Swipe a location left and click edit')}
          <Icon i="edit" /> 
          {' '}
          {t('or delete')}
          <Icon i="delete" /> 
          {' '}
          {t('buttons')}
.
          <br />
          <br />
          <span className="location-favourite icon icon-star " />
          {' '}
          {t(
            'You can make your location stick to the top of the locations list by clicking the Favourite toggle'
          )}
          .
        </p>
      </Collapse>
      <Collapse title={t('Reset the application')}>
        <p>
          {t('Go to the application settings page')} 
          {' '}
          <Icon i="settings" />
          {' '}
          {t('and click on the Reset')} 
          {' '}
          <Icon i="undo" />
          {t('button')}
.
        </p>
      </Collapse>
      <ion-item>
        <p>
          {t('For more help please visit the iRecord')}
          {' '}
          <a href={`${CONFIG.site_url}forum/26`}>{t('forum')}</a>
.
        </p>
      </ion-item>
    </ion-list>
  </div>
);
