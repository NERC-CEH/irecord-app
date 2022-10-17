import { FC, useContext } from 'react';
import userModel from 'models/user';
import { NavContext } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { Page, Header, device, useAlert, useLoader, useToast } from '@flumens';
import Main from './Main';
import './styles.scss';

export type Details = {
  password: string;
  email: string;
};

const ResetController: FC = () => {
  const context = useContext(NavContext);
  const alert = useAlert();
  const toast = useToast();
  const loader = useLoader();

  const onSuccess = () => {
    context.navigate('/home/menu', 'root');
  };

  async function onSubmit(details: Details) {
    const { email } = details;
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }
    await loader.show('Please wait...');

    try {
      await userModel.reset(email.trim());
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
      <Header className="ion-no-border" defaultHref="/user/login" />
      <Main schema={userModel.resetSchema} onSubmit={onSubmit} />
    </Page>
  );
};

export default ResetController;
