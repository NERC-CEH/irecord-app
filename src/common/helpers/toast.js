export default async function toast(props) {
  const toastEl = document.createElement('ion-toast');

  Object.keys(props).forEach(prop => {
    toastEl[prop] = props[prop];
  });

  document.body.appendChild(toastEl);
  return toastEl.present();
}

export function message(text, duration) {
  toast({
    message: text,
    duration: duration || 3000,
  });
}

export function success(text, duration) {
  toast({
    message: text,
    duration: duration || 3000,
    color: 'success',
  });
}

export function warn(text, duration) {
  toast({
    message: text,
    duration: duration || 3000,
    color: 'warning',
  });
}

export function error(text, duration) {
  toast({
    header: t('Sorry'),
    message: text,
    duration: duration || 3000,
    color: 'danger',
  });
}
