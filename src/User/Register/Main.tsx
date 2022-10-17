import { FC, useState } from 'react';
import { IonIcon, IonButton, IonList, IonRouterLink } from '@ionic/react';
import {
  personOutline,
  mailOutline,
  keyOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { AnySchema } from 'yup';
import { Formik, Form } from 'formik';
import { Main, InputWithValidation } from '@flumens';
import config from 'common/config';

type Props = {
  onSubmit: any;
  schema: AnySchema;
};

const RegisterMain: FC<Props> = ({ onSubmit, schema }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const registrationForm = (props: any) => (
    <Form>
      <IonList lines="full">
        <div className="rounded">
          <InputWithValidation
            name="firstName"
            placeholder="First name"
            icon={personOutline}
            type="text"
            autocomplete="off"
            {...props}
          />
          <InputWithValidation
            name="secondName"
            placeholder="Last name"
            icon={personOutline}
            type="text"
            autocomplete="off"
            {...props}
          />
          <InputWithValidation
            name="email"
            placeholder="Email"
            icon={mailOutline}
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

        <div className="terms-info-text">
          <T>
            By clicking Sign Up, you agree to our{' '}
            <IonRouterLink href={`${config.backend.url}/privacy-notice`}>
              Privacy Policy
            </IonRouterLink>{' '}
            and{' '}
            <IonRouterLink href={`${config.backend.url}/terms-of-use`}>
              Terms and Conditions
            </IonRouterLink>
          </T>
        </div>
      </IonList>

      {/** https://github.com/formium/formik/issues/1418 */}
      <input type="submit" style={{ display: 'none' }} />
      <IonButton
        color={props.isValid ? 'primary' : 'medium'}
        type="submit"
        expand="block"
      >
        <T>Sign Up</T>
      </IonButton>
    </Form>
  );

  return (
    <Main>
      <h1>
        <T>Create a free account</T>
      </h1>

      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{
          firstName: '',
          secondName: '',
          email: '',
          password: '',
        }}
        validateOnMount
      >
        {registrationForm}
      </Formik>
    </Main>
  );
};

export default RegisterMain;
