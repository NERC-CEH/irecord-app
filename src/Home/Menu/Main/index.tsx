import { observer } from 'mobx-react';
import {
  settingsOutline,
  exitOutline,
  personOutline,
  personAddOutline,
  lockClosedOutline,
  heartOutline,
  helpBuoyOutline,
  thumbsUpOutline,
  informationCircleOutline,
  openOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, InfoMessage } from '@flumens';
import { IonIcon, IonList, IonItem, IonButton } from '@ionic/react';
import config from 'common/config';
import { AppModel } from 'models/app';
import appLogo from './logo.svg';
import './styles.scss';

// const shouldShowFeedback = (appModel: AppModel, isLoggedIn: boolean) => {
//   if (appModel.attrs.feedbackGiven) {
//     return false;
//   }

//   if (appModel.attrs.useTraining) {
//     return false;
//   }

//   if (!isLoggedIn) {
//     return false;
//   }

//   return samples.length > 5;
// };

type Props = {
  logOut: any;
  refreshAccount: any;
  resendVerificationEmail: any;
  isLoggedIn: boolean;
  user: any;
  appModel: AppModel;
};

const MenuMain = ({
  isLoggedIn,
  user,
  logOut,
  appModel,
  refreshAccount,
  resendVerificationEmail,
}: Props) => {
  const lang = appModel.attrs.language;

  const isNotVerified = user.verified === false; // verified is undefined in old versions
  const userEmail = user.email;

  // const onFeedbackDone = () => {
  //   // eslint-disable-next-line no-param-reassign
  //   appModel.attrs.feedbackGiven = true;
  //   appModel.save();
  // };

  // const showFeedback = shouldShowFeedback(appModel, isLoggedIn);

  return (
    <Main className="app-menu">
      <img src={appLogo} alt="app logo" />

      <IonList lines="full" className="mb-4">
        {/* {showFeedback && (
          <div className="rounded-list">
            <UserFeedbackRequest
              email={config.feedbackEmail}
              onFeedbackDone={onFeedbackDone}
            />
          </div>
        )} */}

        <h3 className="list-title">
          <T>User</T>
        </h3>
        <div className="rounded-list">
          {isLoggedIn && (
            <IonItem detail id="logout-button" onClick={logOut}>
              <IonIcon icon={exitOutline} size="small" slot="start" />
              <T>Logout</T>
              {': '}
              {user.firstName} {user.secondName}
            </IonItem>
          )}

          {isLoggedIn && isNotVerified && (
            <InfoMessage className="verification-warning">
              Looks like your <b>{{ userEmail } as any}</b> email hasn't been
              verified yet.
              <div>
                <IonButton fill="outline" onClick={refreshAccount}>
                  Refresh
                </IonButton>
                <IonButton fill="clear" onClick={resendVerificationEmail}>
                  Resend Email
                </IonButton>
              </div>
            </InfoMessage>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/login" detail>
              <IonIcon icon={personOutline} size="small" slot="start" />
              <T>Login</T>
            </IonItem>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/register" detail>
              <IonIcon icon={personAddOutline} size="small" slot="start" />
              <T>Register</T>
            </IonItem>
          )}
        </div>

        <h3 className="list-title">
          <T>Info</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/info/about" detail>
            <IonIcon
              icon={informationCircleOutline}
              size="small"
              slot="start"
            />
            <T>About</T>
          </IonItem>

          <IonItem routerLink="/info/help" detail>
            <IonIcon icon={helpBuoyOutline} size="small" slot="start" />
            <T>Help</T>
          </IonItem>
          <IonItem routerLink="/info/brc-approved" detail>
            <IonIcon icon={thumbsUpOutline} size="small" slot="start" />
            <T>BRC Approved</T>
          </IonItem>

          <IonItem routerLink="/info/credits" detail>
            <IonIcon icon={heartOutline} size="small" slot="start" />
            <T>Credits</T>
          </IonItem>

          <IonItem
            href={`${config.backend.url}/privacy-notice?lang=${lang}`}
            target="_blank"
            detail
            detailIcon={openOutline}
          >
            <IonIcon icon={lockClosedOutline} size="small" slot="start" />
            <T>Privacy Policy</T>
          </IonItem>
        </div>

        <h3 className="list-title">
          <T>App</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/menu" detail>
            <IonIcon icon={settingsOutline} size="small" slot="start" />
            <T>Settings</T>
          </IonItem>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(MenuMain);
