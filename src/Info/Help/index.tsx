import { FC } from 'react';
import {
  settingsOutline,
  arrowUndoOutline,
  personOutline,
  personAddOutline,
  menuOutline,
  createOutline,
  addOutline,
  trashOutline,
  cameraOutline,
  lockClosedOutline,
  lockOpenOutline,
  peopleOutline,
  logOutOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Page, Collapse, Header, Main } from '@flumens';
import { IonList, IonItemDivider, IonIcon, IonItem } from '@ionic/react';
import CONFIG from 'common/config';
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
            <div>
              <p>
                <T>There are two ways to start a record</T>.
              </p>
              <br />
              <p>
                <b>
                  <T>Taking a photo</T>
                </b>
              </p>
              <br />
              <p>
                <T>
                  Press the camera button{' '}
                  <IonIcon icon={cameraOutline} size="small" /> in the home page
                  header. This will prompt you to select the photo source:
                  camera or gallery. Once you have picked a photo, the app will
                  create a new record without any species associated with it.
                </T>
              </p>
              <br />
              <p>
                <b>
                  <T>Selecting species</T>
                </b>
              </p>
              <br />
              <p>
                <T>
                  Please press the plus{' '}
                  <IonIcon icon={addOutline} size="small" /> button in the home
                  page. This will bring you to the taxa search page. After
                  selecting the species, open the record (either by opening it
                  directly from the taxa search page using the edit button{' '}
                  <span className="icon edit" /> beside the species name or
                  through the home-list page) and fill in the details of the
                  sighting, like location, date, number seen etc.
                </T>
              </p>
              <br />
              <p>
                <T>
                  When finished, press the Upload button in the record's page
                  header.
                </T>
              </p>
            </div>
          </Collapse>

          <Collapse title="Adding lists of records - surveying">
            <div>
              <p>
                <T>
                  You can record lists of species. Long-pressing the green plus
                  button in the home page will show more advanced recording
                  options.
                </T>
              </p>
            </div>
          </Collapse>

          <Collapse title="Searching for species">
            <div>
              <p>
                <T>
                  For quicker searching of the taxa you can use different
                  shortcuts.
                  <br />
                  <br />
                  For <i>Puffinus baroli:</i>
                  <br />
                  <br />
                  <i>puffinus ba</i>
                  <br />
                  <i>puffinus .oli</i>
                  <br />
                  <i>pubar</i> (2+3 characters)
                  <br />
                  <i>baroli</i>
                </T>
              </p>
            </div>
          </Collapse>

          <Collapse title="Adding lists of records - surveying">
            <T>
              You can record lists of species. Long-pressing the green plus
              button in the home page will show more advanced recording options.
            </T>
          </Collapse>

          <Collapse title="Sync. with ORKS">
            <div>
              <p>
                <T>
                  All your saved records will be shown on the home page. By
                  default a record is in <i>draft</i> mode until it is set for
                  upload. While it is in <i>draft</i> mode the application will
                  not synchronise your record with the database.
                </T>
              </p>
              <br />
              <p>
                <T>
                  To set it for upload, open the record and press the Upload
                  button in the header. The application will try to submit your
                  record once there is a good network connection. If the record
                  has reached the database, it will be moved to the Uploaded
                  list in the Home page (see Uploaded tab).
                </T>
              </p>
              <br />
              <p>
                <T>
                  Once it has successfully reached the database the record
                  becomes unavailable for new edits. To further edit it please
                  use the <a href="https://orks.org.uk">ORKS Website</a>.
                </T>
              </p>
              <br />
              <p>
                <T>
                  <b>Note:</b> you have to be signed in to your ORKS account and
                  have a network connection, for the records to be automatically
                  synchronised in the background.
                </T>
              </p>
            </div>
          </Collapse>
          <Collapse title="Delete a record">
            <div>
              <p>
                <T>
                  To delete a record, swipe it left in the Home page and click
                  the delete <IonIcon icon={trashOutline} size="small" />{' '}
                  button.
                </T>
                <br />
                <img
                  src={deleteRecordImage}
                  style={{ width: '80%', margin: '20px' }}
                />
              </p>
              <br />
              <p>
                <T>
                  You can also remove all the locally saved records that have
                  been successfully synchronised with the database. This will
                  leave the records in the database untouched. To do that go to
                  settings page <IonIcon icon={settingsOutline} size="small" />{' '}
                  and click <b>Remove All Saved</b>{' '}
                  <IonIcon icon={trashOutline} size="small" /> button.
                </T>
              </p>
            </div>
          </Collapse>
          <Collapse title="Lock an attribute">
            <div>
              <p>
                <T>
                  You can lock record attributes like date, location, number
                  etc, which will preserve your current attribute value for the
                  subsequently added records.
                </T>
              </p>
              <br />
              <p>
                <T>
                  To lock an attribute click on the lock{' '}
                  <IonIcon icon={lockClosedOutline} size="small" /> button in
                  the attribute edit page header. This will change the symbol to
                  locked <IonIcon icon={lockOpenOutline} size="small" /> both on
                  the button and next to the attribute.
                </T>
              </p>
              <br />
              <p>
                <T>
                  <b>Note:</b> For a GPS-sourced location, only the location
                  name can be locked, not the GPS value. As you move about, the
                  GPS value will change. This will allow recording of different
                  GPS values within an named area while keeping the location
                  name the same. You can lock a location if it is selected using
                  a map or entered manually.
                </T>
              </p>
            </div>
          </Collapse>
        </div>

        <IonItemDivider>
          <T>User</T>
        </IonItemDivider>

        <div className="rounded">
          <Collapse title="Sign in/out or register">
            <div>
              <p>
                <T>
                  To login, open the main menu page{' '}
                  <IonIcon icon={menuOutline} size="small" />, click Login{' '}
                  <IonIcon icon={personOutline} size="small" /> or Register{' '}
                  <IonIcon icon={personAddOutline} size="small" /> buttons and
                  follow the instructions.
                </T>
              </p>
              <br />
              <p>
                <T>
                  To logout, visit the main menu page{' '}
                  <IonIcon icon={menuOutline} size="small" /> and click the
                  logout <IonIcon icon={logOutOutline} size="small" /> button
                </T>
              </p>
              <br />
              <p>
                <T>
                  <b>Note:</b> after registering a new account you must verify
                  your email address by clicking on a verification link sent to
                  your email.
                </T>
              </p>
            </div>
          </Collapse>
          <Collapse title="Groups">
            <div>
              <p>
                <T>
                  To send records to a specific group you can select it in the
                  Groups page.
                </T>
              </p>
              <br />
              <p>
                <T>
                  <b>Note:</b> only the groups that allow this mobile app
                  records and only the ones that you have joined on the ORKS
                  website will be available to select
                </T>
              </p>
            </div>
          </Collapse>{' '}
        </div>

        <IonItemDivider>
          <T>Other</T>
        </IonItemDivider>
        <div className="rounded">
          <Collapse title="Manage saved locations">
            <div>
              <p>
                <T>
                  You can manage your saved locations both on any record's
                  location page and from the settings{' '}
                  <IonIcon icon={settingsOutline} size="small" /> page.
                </T>

                <T>
                  Swipe a location left and click edit{' '}
                  <IonIcon icon={createOutline} size="small" /> or delete
                  <IonIcon icon={trashOutline} size="small" /> buttons.
                </T>
              </p>
              <br />
              <p>
                <span className="location-favourite icon icon-star " />{' '}
                <T>
                  You can make your location stick to the top of the locations
                  list by clicking the Favourite toggle.
                </T>
              </p>
            </div>
          </Collapse>
          <Collapse title="Reset the application">
            <div>
              <T>
                Go to the application settings page{' '}
                <IonIcon icon={settingsOutline} size="small" /> and click on the
                Reset <IonIcon icon={arrowUndoOutline} size="small" /> button.
              </T>
            </div>
          </Collapse>
          <IonItem>
            <div>
              <T>
                For more help please visit the iRecord{' '}
                <a href={`${CONFIG.backend.url}/forum/36`}>forum</a> Or drop us
                an
                <a href="mailto:orks%40cornwallwildlifetrust.gov.uk"> email</a>.
              </T>
            </div>
          </IonItem>
        </div>
      </IonList>
    </Main>
  </Page>
);

export default Help;
