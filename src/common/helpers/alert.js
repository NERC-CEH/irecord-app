const alertController = document.querySelector('ion-alert-controller');

export default function alert(props) {
  async function presentAlert() {
    await alertController.componentOnReady();
    const alertElement = await alertController.create(props);
    alertElement.present();
  }

  presentAlert();

  return null;
}
