const loadingController = document.querySelector('ion-loading-controller');
let loadingElement;

async function showLoader(props) {
  await loadingController.componentOnReady();
  loadingElement = await loadingController.create(props);
  loadingElement.present();
}

function hideLoader() {
  loadingElement && loadingElement.dismiss();
}

export default {
  show: showLoader,
  hide: hideLoader,
};
