import { useContext } from 'react';
import { Trans as T } from 'react-i18next';
import { TypeOf } from 'zod';
import { useToast, useLoader, Page, Header, device, useAlert } from '@flumens';
import { NavContext } from '@ionic/react';
import userModel, { UserModel } from 'models/user';
import Main from './Main';

type Details = TypeOf<typeof UserModel.loginSchema>;

const LoginController = () => {
  const { navigate } = useContext(NavContext);
  const alert = useAlert();

  const toast = useToast();
  const loader = useLoader();

  const onSuccess = () => {
    navigate('/home/menu', 'root');
  };

  async function onSubmit(details: Details) {
    const { email } = details;
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }
    await loader.show('Please wait...');

    try {
      await userModel.resetPassword(email.trim());
      alert({
        header: "We've sent an email to you",
        message: (
          <T>
            Click the link in the email to reset your password. If you don't see
            the email, check other places like your junk, spam or other folders.
          </T>
        ),
        buttons: [
          {
            text: 'OK, got it',
            role: 'cancel',
            handler: onSuccess,
          },
        ],
      });
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  }

  return (
    <Page id="user-reset">
      <Header className="ion-no-border [&>ion-toolbar]:[--background:transparent]" />
      <Main onSubmit={onSubmit} />
    </Page>
  );
};

export default LoginController;
