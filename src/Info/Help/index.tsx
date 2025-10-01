import {
  settingsOutline,
  arrowUndoOutline,
  personOutline,
  personAddOutline,
  menuOutline,
  createOutline,
  addOutline,
  trashOutline,
  lockClosedOutline,
  lockOpenOutline,
  peopleOutline,
  logOutOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Page, Collapse, Header, Main } from '@flumens';
import { IonList, IonIcon, IonItem } from '@ionic/react';
import CONFIG from 'common/config';
import ai1Pic from './ai_1.png';
import ai2Pic from './ai_2.png';
import ai3Pic from './ai_3.png';
import './styles.scss';
import deleteRecordImage from './swipe_record.png';
import verified1Pic from './verified_1.png';
import verified2Pic from './verified_2.png';
import verified3Pic from './verified_3.png';

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
            <div className="my-2">
              <T>
                <p>
                  Start off by tapping the plus{' '}
                  <IonIcon
                    icon={addOutline}
                    className="-mb-1 rounded-full bg-primary-600 text-white"
                    size="small"
                  />{' '}
                  button on the home page. This gives you four options:
                </p>
                <h4 className="mb-2 mt-4 font-bold">
                  Add a record without a photo
                </h4>
                <p>
                  Tap here to add your record. You will first be asked to give
                  the name of the species you are recording, and then you can
                  add the other record information.
                </p>
                <h4 className="mb-2 mt-4 font-bold">
                  Take a new photo of the species
                </h4>
                <p>
                  Tap here to start a new record by adding a photo first, and
                  then completing the species name and other details. The app
                  provides image recognition that may be able to help suggest an
                  identification for your species photo – once your photo has
                  been added you can tap on it to see the suggested
                  identifications. It is also possible to add extra photos of
                  your species.
                </p>
                <h4 className="mb-2 mt-4 font-bold">
                  Select multiple photos to add to a single record
                </h4>
                <p>
                  Tap here to select multiple photos from your gallery and add
                  them to a single record. In this case the image recognition
                  will provide a single suggested identification based on all
                  the photos – tap on any one photo to see the suggestions, or
                  tap on the “Species missing” button. Once you have agreed an
                  ID and added the other details you can save the record with
                  all the photos attached.
                </p>
                <h4 className="mb-2 mt-4 font-bold">Show other surveys</h4>
                <p>
                  Tap here to see the other survey options in the app. These
                  allow you to add a list of records from the same site on the
                  same date. Currently there are three options:
                </p>
                <ul className="my-2 list-disc pl-4">
                  <li>
                    Plant List Survey (e.g. to record a list of species in a
                    grid square)
                  </li>
                  <li>
                    Moth List Survey (e.g. for recording moths at a moth trap)
                  </li>
                  <li>
                    Species List Survey (e.g. for recording a range of different
                    species on one date)
                  </li>
                </ul>

                <p>
                  Records in the list will be linked to the overall location for
                  the survey. For the Plant List and Species List surveys you
                  can choose to “Geolocate list entries”. If you switch that on,
                  the app will add a precise GPS location to each individual
                  record in your list. Be careful not to leave this switched on
                  if you are adding records from a different location (e.g. if
                  you leave your survey site and then want to add more records
                  after you have arrive home).
                </p>
              </T>
            </div>
          </Collapse>

          <Collapse title="Image recognition">
            <div className="my-2">
              <T>
                <p>
                  If you have added a photo to your record, the app will offer
                  suggestions about the identification (ID), using automatic
                  image recognition.
                </p>
                <p>
                  After uploading a photo, check the thumbnail to see if it
                  shows a coloured circle indicating the probability of a
                  suggested ID. This uses ‘traffic light’ colours to suggest how
                  confident the app is about the suggested ID:
                </p>
                <ul className="my-2">
                  <li>
                    <div className="-mb-1 inline-block size-4 rounded-full bg-success" />{' '}
                    = high confidence
                  </li>
                  <li>
                    <div className="-mb-1 inline-block size-4 rounded-full bg-warning-400" />{' '}
                    = medium confidence
                  </li>
                  <li>
                    <div className="-mb-1 inline-block size-4 rounded-full bg-danger" />{' '}
                    = low confidence
                  </li>
                </ul>

                <p>
                  If you have already suggested an ID, and the image recognition
                  suggests a different ID, a small red warning circle will be
                  displayed – open the thumbnail or edit the species name to see
                  the alternative ID suggestion.
                </p>
                <p>
                  Example of an ID that the image recognition agrees with, and
                  has high confidence:
                </p>
                <img src={ai1Pic} alt="" className="mx-auto block" />
                <p className="bg-success text-center text-white">
                  Identification agreed, with high confidence
                </p>
                <img src={ai2Pic} alt="" className="mx-auto block" />
                <p className="bg-danger text-center text-white">
                  ! Alternative Identification suggested
                </p>
                <p>
                  When you open up the thumbnail image you can tap on the
                  “Suggestions” button to see the suggested ID, and you can then
                  tap on “Select” to set the identification for your record.
                </p>
                <img src={ai3Pic} alt="" className="mx-auto block" />
              </T>
            </div>
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
          <Collapse title="Respond to a queried record">
            <div className="my-2">
              <T>
                <p>
                  The records that you upload from the app may be checked by a
                  verifier. If a verifier queries one of your app records, the
                  next time you open the app you will see a message to let you
                  know:
                </p>
                <img src={verified1Pic} alt="" className="mx-auto my-2 block" />
                <p>
                  Tap on “See Records” to see the records that have been queried
                  – they will be shown with a question mark:
                </p>
                <img src={verified2Pic} alt="" className="mx-auto my-2 block" />
              </T>
              <p>
                <T>
                  Tap on a queried record to get a link to that record via the
                  iRecord website. If you go to the website you will be able to
                  see what the query is, and to add a reply or edit your record
                  if required:
                </T>
              </p>
              <img src={verified3Pic} alt="" className="mx-auto my-2 block" />
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
            <div className="my-2">
              <T>
                <p>
                  To send records to a specific activity you can select it in
                  the Activities <IonIcon icon={peopleOutline} size="small" />{' '}
                  page. Activities you have already joined can be seen in “My
                  Activities”. To join an Activity for the first time search for
                  it in “All Activities”.
                </p>
                <p>
                  Make sure you remember to change your Activity setting if you
                  want to add a record that is not linked to an activity. To do
                  this, set the My Activity page to “Not linked to any
                  activity”.
                </p>
              </T>
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
                <span className="location-favourite icon icon-star" />{' '}
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
