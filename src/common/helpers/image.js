import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/react';

async function getImageMeta(url) {
  const promiseWrap = (resolve, reject) => {
    const img = new window.Image();
    const res = () => resolve(img);
    const rej = () => reject();
    img.onload = res;
    img.onerror = rej;
    img.src = url;
  };

  return new Promise(promiseWrap);
}

const Image = {
  /**
   * Gets a fileEntry of the selected image from the camera or gallery.
   * If none selected then fileEntry is empty.
   * @param options
   * @returns {Promise}
   */
  async getImage(options = {}) {
    const defaultCameraOptions = {
      quality: 40,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      saveToGallery: true,
      webUseInput: true,
      correctOrientation: true,
    };

    const cameraOptions = { ...defaultCameraOptions, ...options };

    let file;
    try {
      file = await Camera.getPhoto(cameraOptions);
    } catch (e) {
      return null;
    }

    const name = `${Date.now()}.jpeg`;

    if (!isPlatform('hybrid')) {
      return file.webPath;
    }

    await Filesystem.copy({
      from: file.path,
      to: name,
      toDirectory: Directory.Data,
    });

    const { uri } = await Filesystem.stat({
      path: name,
      directory: Directory.Data,
    });

    return uri;
  },

  /**
   * Create new record with a photo
   */
  async getImageModel(ImageModel, imageURL, dataDirPath) {
    if (!imageURL) {
      throw new Error('File not found while creating image model.');
    }

    let width;
    let height;
    let data;

    if (isPlatform('hybrid')) {
      imageURL = Capacitor.convertFileSrc(imageURL); // eslint-disable-line
      const imageMetaData = await getImageMeta(imageURL);

      width = imageMetaData.width;
      height = imageMetaData.height;
      data = imageURL.split('/').pop();
    } else {
      [data, , width, height] = await ImageModel.getDataURI(imageURL);
    }

    const imageModel = new ImageModel({
      attrs: {
        data,
        type: 'jpeg',
        width,
        height,
        path: dataDirPath,
      },
    });

    return imageModel;
  },
};

export { Image as default };
