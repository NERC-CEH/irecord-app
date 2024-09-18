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
import { IonList, IonIcon, IonItem } from '@ionic/react';
import CONFIG from 'common/config';
import imageRecognitionAgreeImg from './image_recognition_agree.jpg';
import imageRecognitionDisagreeImg from './image_recognition_disagree.jpg';
import suggestionsImg from './image_recognition_suggestions.jpg';
import './styles.scss';
import deleteRecordImage from './swipe_record.png';

const Help = () => (
  <Page id="help-page">
    <Header title="Help" />
    <Main id="faq">
      <IonList lines="none" className="mb-3">
        <h3 className="list-title">
          <T>Records</T>
        </h3>
        <div className="rounded-list">
          <Collapse title="How to make a new record">
            <div>
              <p>
                <T>There are two ways to start a record</T>.
              </p>
              <p>
                <h4 className="my-2 font-bold">
                  <T>Taking a photo</T>
                </h4>
              </p>
              <p>
                <T>
                  Press the camera button{' '}
                  <IonIcon icon={cameraOutline} size="small" /> in the home page
                  header. This will prompt you to select the photo source:
                  camera or gallery. Once you have picked a photo, the app will
                  create a new record without any species associated with it.
                </T>
              </p>
              <p>
                <h4 className="my-2 font-bold">
                  <T>Selecting species</T>
                </h4>
              </p>
              <p>
                <T>
                  Please press the plus{' '}
                  <IonIcon
                    icon={addOutline}
                    className="rounded-full bg-primary-600 text-white"
                    size="small"
                  />{' '}
                  button in the home page. This will bring you to the taxa
                  search page. After selecting the species, open the record
                  (either by opening it directly from the taxa search page using
                  the edit button <span className="icon edit" /> beside the
                  species name or through the home-list page) and fill in the
                  details of the sighting, like location, date, number seen etc.
                </T>
              </p>
              <p>
                <T>
                  When finished, press the Upload button in the record's page
                  header.
                </T>
              </p>
            </div>
          </Collapse>

          <Collapse title="Image recognition">
            <div>
              <p>
                <T>
                  If you have added a photo to your record, the app will offer
                  suggestions about the identification, using automatic image
                  recognition.
                </T>
              </p>

              <ul>
                <li>
                  <T>
                    If you add a record using the plus button, you will be asked
                    to add a species name to your record first. You can then add
                    one or more photos, and the app will tell you if it agrees
                    with the species name. If not it may suggest a different
                    identification.
                  </T>
                </li>

                <li>
                  <T>
                    If you add a record using the photo button, you can add a
                    photo first, and the app will be able to suggest an
                    identification. You can then go on to use the suggested
                    species name if you agree with it, or add your own
                    identification instead.
                  </T>
                </li>
              </ul>

              <p>
                <T>
                  After uploading the photo, check the thumbnail to see if it
                  shows a percentage indicating the probability of a suggested
                  identification. If a different identification is being
                  suggested a small red warning circle will be displayed – open
                  the thumbnail to see alternative identification suggestions.
                </T>
              </p>

              <div className="image-classifier">
                <img src={imageRecognitionAgreeImg} />
                <h3 className="agree">
                  <T>Identification agreed</T>
                </h3>

                <img src={imageRecognitionDisagreeImg} />
                <h3 className="disagree">
                  <T>Alternative Identification suggested</T>
                </h3>
              </div>

              <p>
                <T>
                  When you open up the thumbnail image you can tap on any of the
                  alternative suggestions shown, and that will set the
                  identification for your record.
                </T>
              </p>

              <img src={suggestionsImg} />

              <p>
                <T>
                  The image recognition process can be very helpful, but it
                  doesn’t get it right every time! Check what is being suggested
                  before making your final decision, and if you think the app
                  suggestion is wrong feel free to stick to your own
                  identification.
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
          <Collapse title="Searching for species">
            <div>
              <p>
                <T>
                  Type in a species name - English or scientific name, or a
                  genus or family etc.
                </T>
              </p>
              <p>
                <T>
                  To find a species from its scientific name you can use
                  shortcuts, e.g. to find <i>Bellis perrenis</i> (Daisy) you can
                  type:
                </T>
              </p>
              <p>
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
                <T>(2 letters of genus + 3 of species)</T>
                <br />
                <b>
                  <i>perennis</i>
                </b>
              </p>
              <p>
                <T>
                  Once you have added the name, you can add a photo and the app
                  will suggest an identification based on the photo.
                </T>
              </p>
            </div>
          </Collapse>
          <Collapse title="Sync. with iRecord">
            <div>
              <p>
                <T>
                  All your saved records will be shown on the home page. By
                  default a record is in <i>draft</i> mode until it is set for
                  upload. While it is in <i>draft</i> mode the application will
                  not synchronise your record with the database.
                </T>
              </p>
              <p>
                <T>
                  To set it for upload, open the record and press the Upload
                  button in the header. The application will try to submit your
                  record once there is a good network connection. If the record
                  has reached the database, it will be moved to the Uploaded
                  list in the Home page (see Uploaded tab).
                </T>
              </p>
              <p>
                <T>
                  Once it has successfully reached the database the record
                  becomes unavailable for new edits. To further edit it please
                  use the <a href="http://irecord.org.uk">iRecord Website</a>.
                </T>
              </p>
              <p className="mt-2">
                <T>
                  <b>Note:</b> you have to be signed in to your iRecord account
                  and have a network connection, for the records to be
                  automatically synchronised in the background.
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
                <img
                  src={deleteRecordImage}
                  style={{ width: '80%', margin: '20px' }}
                />
              </p>
              <p>
                <T>
                  You can also remove all the locally saved records that have
                  been successfully synchronised with the database. This will
                  leave the records in the database untouched. To do that go to
                  settings page <IonIcon icon={settingsOutline} size="small" />{' '}
                  and click <b>Remove Uploaded Surveys</b>{' '}
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
                  subsequently added records
                </T>
                .
              </p>
              <p>
                <T>
                  To lock an attribute swipe the menu attribute item to the left
                  and click on the lock{' '}
                  <IonIcon icon={lockClosedOutline} size="small" /> button. This
                  will change the symbol to locked{' '}
                  <IonIcon icon={lockOpenOutline} size="small" /> both on the
                  button and next to the attribute.
                </T>
              </p>
              <p className="mt-2">
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

        <h3 className="list-title">
          <T>User</T>
        </h3>

        <div className="rounded-list">
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
              <p>
                <T>
                  To logout, visit the main menu page{' '}
                  <IonIcon icon={menuOutline} size="small" /> and click the
                  logout <IonIcon icon={logOutOutline} size="small" /> button
                </T>
              </p>
              <p className="mt-2">
                <T>
                  <b>Note:</b> after registering a new account you must verify
                  your email address by clicking on a verification link sent to
                  your email.
                </T>
              </p>
            </div>
          </Collapse>
          <Collapse title="Verification of your records">
            <div>
              <p>
                <T>
                  When you add a record to the app and then upload it to
                  iRecord, it may be checked by one of the expert verifiers who
                  volunteer on behalf of the national or local wildlife
                  recording schemes. If that happens you will see notifications
                  in the app to tell you that the record has been accepted or
                  not.
                </T>
              </p>
              <p>
                <T>
                  Some verifiers may have added additional comments or queries
                  to your records, and at the moment these are not available
                  within the app, so you may wish to log on to the iRecord
                  website and view your records and notifications there.
                </T>
              </p>
              <p>
                <T>
                  If you do not wish to see the notifications in the app you can
                  tick the box for “Do not show again”, but if you do this the
                  notifications will become unavailable unless you reset the app
                  settings or reinstall the app.
                </T>
              </p>
              <p>
                <T>
                  For more information about the record checking process see{' '}
                  <a href="https://irecord.org.uk/records-verified">
                    Verification: what, who and why
                  </a>{' '}
                  on the iRecord website.
                </T>
              </p>
            </div>
          </Collapse>{' '}
          <Collapse title="Activities">
            <div>
              <p>
                <T>
                  To send records to a specific activity you can select it in
                  the Activities <IonIcon icon={peopleOutline} size="small" />{' '}
                  page.
                </T>
              </p>
              <p className="mt-2">
                <T>
                  <b>Note:</b> only the activities that allow this mobile app
                  records and only the ones that you have joined on the iRecord
                  website will be available to select.
                </T>
              </p>
            </div>
          </Collapse>
        </div>

        <h3 className="list-title">
          <T>Other</T>
        </h3>
        <div className="rounded-list">
          <Collapse title="Manage saved locations">
            <div>
              <p>
                <T>
                  You can manage your saved locations both on any record's
                  location page and from the settings{' '}
                  <IonIcon icon={settingsOutline} size="small" /> page
                </T>
                .{' '}
                <T>
                  Swipe a location left and click edit{' '}
                  <IonIcon icon={createOutline} size="small" /> or delete
                  <IonIcon icon={trashOutline} size="small" /> buttons.
                </T>
              </p>
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
            <div className="pt-3">
              <T>
                For more help please visit the iRecord{' '}
                <a href={`${CONFIG.backend.url}/forum/36`}>forum</a>.
              </T>
            </div>
          </IonItem>
        </div>
      </IonList>
    </Main>
  </Page>
);

export default Help;
