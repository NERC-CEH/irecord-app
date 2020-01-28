import React from 'react';
import PropTypes from 'prop-types';
import { IonButton, IonList } from '@ionic/react';
import AppMain from 'Components/Main';
import { person } from 'ionicons/icons';
import { Formik, Form } from 'formik';
import InputWithValidation from 'Components/InputWithValidation';

const Component = ({ onSubmit, schema }) => {
  return (
    <AppMain id="reset-page">
      <div className="info-message">
        <p>
          {t(
            'Enter your username or email address to request a password reset.'
          )}
        </p>
      </div>
      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{}}
        render={props => (
          <Form>
            <IonList lines="full">
              <InputWithValidation
                name="name"
                placeholder={t('Username or email')}
                icon={person}
                type="text"
                {...props}
              />
            </IonList>

            <IonButton color="primary" type="submit" expand="block">
              {t('Reset')}
            </IonButton>
          </Form>
        )}
      />
    </AppMain>
  );
};

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Component;
