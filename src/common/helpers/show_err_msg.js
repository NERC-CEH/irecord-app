import radio from 'radio';

export default err => {
  if (typeof err !== 'string') {
    err = 'Sorry, some problem has occurred';
  }
  radio.trigger('app:dialog:error', err);
};
