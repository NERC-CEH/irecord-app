import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Page, useAlert, useLoader, useToast } from '@flumens';
import appModel from 'models/app';
import userModel from 'models/user';
import Main from './Main';

const useConfirmationDialog = () => {
  const alert = useAlert();

  const showConfirmationDialog = (callback: any) => {
    alert({
      header: 'Logout',
      message: (
        <T>
          Are you sure you want to logout?
          <br />
          <br />
          Your pending and uploaded <b>surveys will not be deleted </b> from
          this device.
        </T>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => callback(),
        },
      ],
    });
  };

  return showConfirmationDialog;
};

const Controller = () => {
  const showLogoutConfirmationDialog = useConfirmationDialog();
  const toast = useToast();
  const loader = useLoader();

  function logOut() {
    console.log('Info:Menu: logging out.');
    const resetWrap = async () => {
      userModel.logOut();
    };
    showLogoutConfirmationDialog(resetWrap);
  }

  const checkActivation = async () => {
    await loader.show('Please wait...');
    try {
      await userModel.checkActivation();
      if (!userModel.data.verified) {
        toast.warn('The user has not been activated or is blocked.');
      }
    } catch (err: any) {
      toast.error(err);
    }
    loader.hide();
  };

  const resendVerificationEmail = async () => {
    await loader.show('Please wait...');
    try {
      await userModel.resendVerificationEmail();
      toast.success(
        'A new verification email was successfully sent now. If you did not receive the email, then check your Spam or Junk email folders.'
      );
    } catch (err: any) {
      toast.error(err);
    }
    loader.hide();
  };

  return (
    <Page id="home-menu">
      <Main
        user={userModel.data}
        appModel={appModel}
        isLoggedIn={userModel.isLoggedIn()}
        logOut={logOut}
        refreshAccount={checkActivation}
        resendVerificationEmail={resendVerificationEmail}
      />
    </Page>
  );
};

export default observer(Controller);
