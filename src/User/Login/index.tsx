import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TypeOf } from 'zod';
import { useToast, useLoader, Page, Header, device } from '@flumens';
import { NavContext } from '@ionic/react';
import userModel, { UserModel } from 'models/user';
import Main from './Main';

type Details = TypeOf<typeof UserModel.loginSchema>;

const LoginController = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const { t } = useTranslation();

  const onSuccessReturn = () => {
    const { email } = userModel.data;

    toast.success(t('Successfully logged in as: {{email}}', { email }), {
      skipTranslation: true,
    });

    navigate('/home/surveys', 'root');
  };

  async function onLogin({ email, password }: Details) {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    await loader.show('Please wait...');

    try {
      await userModel.logIn(email.trim(), password);

      onSuccessReturn();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
      console.error(err);
    }

    loader.hide();
  }

  return (
    <Page id="user-login">
      <Header className="ion-no-border [&>ion-toolbar]:[--background:transparent]!" />
      <Main onSubmit={onLogin} />
    </Page>
  );
};

export default LoginController;
