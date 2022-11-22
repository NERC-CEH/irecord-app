import { FC } from 'react';
import CONFIG from 'common/config';
import { Page, Collapse, Header, Main } from '@flumens';
import { IonList, IonItemDivider, IonIcon, IonItem } from '@ionic/react';
import {
  settings,
  arrowUndoOutline,
  person,
  personAdd,
  menu,
  create,
  add,
  trash,
  camera,
  lockClosed,
  lockOpenOutline,
  people,
  logOut,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import './styles.scss';
import deleteRecordImage from './swipe_record.png';

const Help: FC = () => (
  <Page id="help-page">
    <Header title="Help" />
    <Main id="faq">
      <IonList lines="none">
        <IonItemDivider>
          <T>Records</T>
        </IonItemDivider>
        <div className="rounded">
          <Collapse title="How to make a new record">
            <p>
              <T>There are two ways to start a record</T>
              .
              <br />
              <br />
              <strong>
                <T>Taking a photo</T>
              </strong>
              <br />
              <T>Press the camera button</T>{' '}
              <IonIcon icon={camera} size="small" />{' '}
              <T>
                in the home page header. This will prompt you to select the
                photo source: camera or gallery. Once you have picked a photo,
                the app will create a new record without any species associated
                with it.
              </T>
              <br />
              <br />
              <strong>
                <T>Selecting species</T>
              </strong>
              <br />
              <T>Please press the plus</T> <IonIcon icon={add} size="small" />{' '}
              <T>
                button in the home page. This will bring you to the taxa search
                page. After selecting the species, open the record (either by
                opening it directly from the taxa search page using the edit
                button
              </T>
              <span className="icon edit" />{' '}
              <T>
                beside the species name or through the home-list page) and fill
                in the details of the sighting, like location, date, number seen
                etc
              </T>
              .
              <br />
              <br />
              <T>
                When finished, press the Upload button in the record's page
                header.
              </T>
            </p>
          </Collapse>

          <Collapse title="Adding lists of records - surveying">
            <p>
              <T>
                You can record lists of species. Long-pressing the green plus
                button in the home page will show more advanced recording
                options.
              </T>
            </p>
          </Collapse>
          <Collapse title="Searching for species">
            <p>
              <T>
                Type in a species name (English or scientific name, or a genus
                or family etc.).
              </T>
              <br />
              <br />
              <T>
                To find a species from its scientific name you can use
                shortcuts, e.g. to find
                <b>
                  <i> Bellis perrenis</i>
                </b>{' '}
                (Daisy) you can type:
              </T>
              <br />
              <br />
              <b>
                <i>bellis p</i>
              </b>
              <br />
              <b>
                <i>bellis .ni</i>
              </b>
              <br />
              <b>
                <i> beper </i>
              </b>{' '}
              (2 letters of genus + 3 of species)
              <br />
              <b>
                <i>perennis</i>
              </b>
              <br />
              <br />
              <T>
                Once you have added the name, you can add a photo, and the app
                will suggest an identification based on the photo
              </T>
            </p>
          </Collapse>
          <Collapse title="Sync. with iRecord">
            <p>
              <T>
                All your saved records will be shown on the home page. By
                default a record is in
              </T>{' '}
              <i>
                <T>draft</T>
              </i>{' '}
              <T>mode until it is set for upload. While it is in</T>{' '}
              <i>
                <T>draft</T>
              </i>{' '}
              <T>
                mode the application will not synchronise your record with the
                database.
              </T>
              <br />
              <br />
              <T>
                To set it for upload, open the record and press the Upload
                button in the header. The application will try to submit your
                record once there is a good network connection.
              </T>{' '}
              <T>
                If the record has reached the database, it will be moved to the
                Uploaded list in the Home page (see Uploaded tab).
              </T>
              <br />
              <br />
              <T>
                Once it has successfully reached the database the record becomes
                unavailable for new edits. To further edit it please use the
              </T>{' '}
              <a href="http://irecord.org.uk">
                <T>iRecord Website</T>
              </a>
              .
              <br />
              <br />
              <b>
                <T>Note</T>:
              </b>{' '}
              <T>
                you have to be signed in to your iRecord account and have a
                network connection, for the records to be automatically
                synchronised in the background
              </T>
              .
              <br />
            </p>
          </Collapse>
          {/* <Collapse title='Send all records</T>>
          <p>
            {t(
              'You can set all your valid draft records for upload in one go. To do that go to the settings page'
            )}
            <IonIcon icon={settings} size="small" /> 
            {' '}
            <T>and click Submit All</T>
            <IonIcon icon={send} size="small" /> 
            {' '}
            <T>button</T>
.
            {' '}
            <T>This will try to send all the valid records</T>
.
          </p>
        </Collapse> */}
          <Collapse title="Delete a record">
            <p>
              <T>
                To delete a record, swipe it left in the Home page and click the
                delete
              </T>
              <IonIcon icon={trash} size="small" /> <T>button</T>
              .
              <img
                src={deleteRecordImage}
                style={{ width: '80%', margin: '20px' }}
              />
              <br />
              <br />
              <T>
                You can also remove all the locally saved records that have been
                successfully synchronised with the database. This will leave the
                records on the database untouched. To do that go to settings
                page
              </T>
              <IonIcon icon={settings} size="small" /> <T>and click</T>{' '}
              <T>Remove All Saved</T>
              <IonIcon icon={trash} size="small" /> <T>button</T>.
            </p>
          </Collapse>
          <Collapse title="Lock an attribute">
            <p>
              <T>
                You can lock record attributes like date, location, number etc,
                which will preserve your current attribute value for the
                subsequently added records.
              </T>
              <br />
              <br />
              <T>
                To lock an attribute swipe the menu attribute item to the left
                and click on the lock
              </T>{' '}
              <IonIcon icon={lockClosed} size="small" />{' '}
              <T>button. This will change the symbol to locked</T>
              <IonIcon icon={lockOpenOutline} size="small" />{' '}
              <T>both on the button and next to the attribute</T>
              .
              <br />
              <br />
              <b>
                <T>Note</T>:
              </b>{' '}
              <T>
                For a GPS-sourced location, only the location name can be
                locked, not the GPS value. As you move about, the GPS value will
                change. This will allow recording of different GPS values within
                an named area while keeping the location name the same. You can
                lock a location if it is selected using a map or entered
                manually
              </T>
              .
            </p>
          </Collapse>
        </div>

        <IonItemDivider>
          <T>User</T>
        </IonItemDivider>

        <div className="rounded">
          <Collapse title="Sign in/out or register">
            <p>
              <T>To login, open the main menu page</T>{' '}
              <IonIcon icon={menu} size="small" />,<T>click Login</T>{' '}
              <IonIcon icon={person} size="small" />
              <T>or Register</T> <IonIcon icon={personAdd} size="small" />
              <T>buttons and follow the instructions</T>
              .
              <br />
              <br />
              <T>To logout, visit the main menu page</T>{' '}
              <IonIcon icon={menu} size="small" />
              <T>and click the logout</T> <IonIcon icon={logOut} size="small" />{' '}
              <T>button</T>
              .
              <br />
              <br />
              <b>
                <T>Note</T>:
              </b>{' '}
              <T>
                after registering a new account you must verify your email
                address by clicking on a verification link sent to your email
              </T>
              .
            </p>
          </Collapse>
          <Collapse title="Activities">
            <p>
              <T>
                To send records to a specific activity you can select it in the
                Activities page.
              </T>
              <IonIcon icon={people} size="small" />
              <br />
              <br />
              <b>
                <T>Note</T>:
              </b>{' '}
              <T>
                only the activities that allow this mobile app records and only
                the ones that you have joined on the iRecord website will be
                available to select
              </T>
              .
            </p>
          </Collapse>
        </div>

        <IonItemDivider>
          <T>Other</T>
        </IonItemDivider>
        <div className="rounded">
          <Collapse title="Manage saved locations">
            <p>
              <T>
                You can manage your saved locations both on any record's
                location page and from the settings page.
              </T>
              <IonIcon icon={settings} size="small" />
              <T>Swipe a location left and click edit</T>
              <IonIcon icon={create} size="small" /> <T>or delete</T>
              <IonIcon icon={trash} size="small" /> <T>buttons</T>
              .
              <br />
              <br />
              <span className="location-favourite icon icon-star " />{' '}
              <T>
                You can make your location stick to the top of the locations
                list by clicking the Favourite toggle
              </T>
              .
            </p>
          </Collapse>
          <Collapse title="Reset the application">
            <p>
              <T>Go to the application settings page</T>{' '}
              <IonIcon icon={settings} size="small" />{' '}
              <T>and click on the Reset</T>{' '}
              <IonIcon icon={arrowUndoOutline} size="small" />
              <T>button</T>.
            </p>
          </Collapse>
          <IonItem>
            <p>
              <T>For more help please visit the iRecord</T>{' '}
              <a href={`${CONFIG.backend.url}forum/26`}>
                <T>forum</T>
              </a>
              .
            </p>
          </IonItem>
        </div>
      </IonList>
    </Main>
  </Page>
);

export default Help;
