/** ****************************************************************************
 * Loader view with a spinner for async and other components.
 **************************************************************************** */
import React from 'react';
import Device from 'helpers/device';
import '../styles/loading.scss';

// on Android the spinner is distorted, so requires manual OS check
export default () => (
  <ion-spinner class="centered" name={Device.isIOS() ? 'lines' : 'dots'} />
);
