/** ****************************************************************************
 * Loader view with a spinner for async and other components.
 **************************************************************************** */
import React from 'react';
import { IonSpinner } from '@ionic/react';
import './styles.scss';

export default () => (
  <div className="spinner">
    <IonSpinner class="centered" />
  </div>
);
