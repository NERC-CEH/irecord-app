import { GalleryPhoto } from '@capacitor/camera';
import { isPlatform } from '@ionic/react';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { getObjectURL } from '@flumens';
import './styles.scss';

/**
 * Uses Camera Preview plugin to pick an image using the camera.
 */
export default async function getPhotoFromPreview(): Promise<GalleryPhoto | null> {
  const getPhoto = (resolve: any) => {
    const container = document.createElement('div');
    container.setAttribute('id', 'camera-container');
    document.body.appendChild(container);

    const root = document.getElementById('root');
    root?.setAttribute('style', 'display:none');

    const cameraFocusFrame = document.createElement('div');
    cameraFocusFrame.setAttribute('id', 'camera-focus-frame');
    container.appendChild(cameraFocusFrame);

    const cameraButton = document.createElement('button');
    cameraButton.classList.add('camera-button');

    async function cleanUp() {
      await CameraPreview.stop();
      document.body.removeChild(container);

      root?.removeAttribute('style');

      // cameraButton.removeEventListener('click', takePhoto);
      // cancelButton.removeEventListener('click', cleanUp);
    }

    const takePhoto = async () => {
      const cameraPreviewPictureOptions = {
        quality: 50,
      };

      const result = await CameraPreview.capture(cameraPreviewPictureOptions);

      const path = isPlatform('hybrid') ? result.value : '';
      const webPath = !isPlatform('hybrid')
        ? getObjectURL(`data:image/png;base64,${result.value}`)
        : '';

      // TODO: save to file

      cleanUp();
      resolve({ webPath, path, format: 'jpeg' });
    };
    cameraButton.addEventListener('click', takePhoto);
    container.appendChild(cameraButton);

    const cancelCamera = async () => {
      cleanUp();
      resolve(null);
    };
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', cancelCamera);
    container.appendChild(cancelButton);

    // eslint-disable-next-line @getify/proper-arrows/name
    (async () => {
      const cameraPreviewOptions = {
        position: 'rear',
        paddingBottom: 80,
        parent: 'camera-container',
        storeToFile: true,
        toBack: true,
        disableAudio: true,
        enableZoom: true,
        rotateWhenOrientationChanged: false,
      };
      await CameraPreview.start(cameraPreviewOptions);
      if (isPlatform('hybrid'))
        container?.setAttribute('style', 'background:none'); // make the camera visible
    })();
  };

  return new Promise(getPhoto);
}
