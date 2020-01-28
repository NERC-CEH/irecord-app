const controller = document.querySelector('ion-action-sheet-controller');

export default function show(props) {
  async function present() {
    await controller.componentOnReady();
    const alertElement = await controller.create(props);
    alertElement.present();
  }

  present();

  return null;
}
