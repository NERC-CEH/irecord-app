import { FC, useState } from 'react';
import { IonIcon, IonButton, IonList } from '@ionic/react';
import { Link } from 'react-router-dom';

import {
  keyOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { AnySchema } from 'yup';
import { Formik, Form } from 'formik';
import { Main, InputWithValidation } from '@flumens';

type Props = {
  schema: AnySchema;
  onSubmit: any;
};

const LoginMain: FC<Props> = ({ schema, onSubmit }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const loginForm = (props: any) => (
    <Form>
      <IonList lines="full">
        <div className="rounded">
          <InputWithValidation
            name="email"
            placeholder="Email"
            icon={personOutline}
            type="email"
            autocomplete="off"
            {...props}
          />
          <InputWithValidation
            name="password"
            placeholder="Password"
            icon={keyOutline}
            type={showPassword ? 'text' : 'password'}
            autocomplete="off"
            {...props}
          >
            <IonButton slot="end" onClick={togglePassword} fill="clear">
              <IonIcon
                icon={showPassword ? eyeOutline : eyeOffOutline}
                className="faint"
                size="small"
              />
            </IonButton>
          </InputWithValidation>
        </div>

        <Link to="/user/reset" className="password-forgot-button">
          <T>Forgot password?</T>
        </Link>
      </IonList>

      {/** https://github.com/formium/formik/issues/1418 */}
      <input type="submit" style={{ display: 'none' }} />
      <IonButton
        color={props.isValid ? 'primary' : 'medium'}
        type="submit"
        expand="block"
      >
        <T>Sign In</T>
      </IonButton>

      <div className="signup-button">
        <T>I don't have an account</T>.{' '}
        <Link to="/user/register">
          <T>Sign Up</T>
        </Link>
      </div>
    </Form>
  );

  return (
    <Main>
      <h1>
        <T>Welcome back</T>
      </h1>
      <h2>
        <T>Sign in to your account to start</T>
      </h2>

      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{ email: '', password: '' }}
        validateOnMount
      >
        {loginForm}
      </Formik>
    </Main>
  );
};

export default LoginMain;
