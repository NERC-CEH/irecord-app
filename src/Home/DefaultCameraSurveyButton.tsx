import { useState } from 'react';
import { cameraOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import {
  captureImage,
  ImageCropper,
  useToast,
  saveFile,
  deleteFile,
  device,
} from '@flumens';
import { IonIcon, IonLabel, isPlatform } from '@ionic/react';
import config from 'common/config';
import appModel from 'models/app';
import samples from 'models/collections/samples';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import defaultSurveyConfig from 'Survey/Default/config';

type URL = string;

const identify = (imageModel: Media) => {
  const { useSpeciesImageClassifier } = appModel.attrs;
  if (
    useSpeciesImageClassifier &&
    device.isOnline &&
    userModel.isLoggedIn() &&
    userModel.attrs.verified
  ) {
    const processError = (error: any) =>
      !error.isHandled && console.error(error); // don't toast this to user
    imageModel.identify().catch(processError);
  }
};

const DefaultCameraSurveyButton = () => {
  const [editImage, setEditImage] = useState<Media>();
  const toast = useToast();

  async function onClick() {
    try {
      const photoURLs = await captureImage({ camera: true });
      if (!photoURLs.length) return;

      const getImageModel = async (imageURL: URL) =>
        Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(imageURL) : imageURL,
          config.dataPath,
          true
        );
      const imageModels: Media[] = await Promise.all<any>(
        photoURLs.map(getImageModel)
      );

      setEditImage(imageModels[0]);
    } catch (e: any) {
      toast.error(e);
    }
  }

  const onDoneEdit = async (imageDataURL: URL) => {
    const image = editImage as Media;

    // overwrite existing file
    const oldFileName: string = image?.getURL().split('/').pop() as string;
    const extension = oldFileName.split('.').pop() as string;
    const newFileName = `${Date.now()}.${extension}`;

    await deleteFile(oldFileName);

    let savedURL = await saveFile(imageDataURL, newFileName);

    savedURL = isPlatform('hybrid')
      ? Capacitor.convertFileSrc(savedURL)
      : savedURL;

    // copy over new image values to existing model to preserve its observability
    const newImageModel: any = await Media.getImageModel(
      savedURL,
      config.dataPath,
      true
    );
    Object.assign(image?.attrs, { ...newImageModel.attrs, species: null });

    setEditImage(undefined);

    const sample = await defaultSurveyConfig.create({
      Sample,
      Occurrence,
      image: newImageModel,
    });

    await sample.save();

    // add to main collection
    samples.push(sample);
    identify(sample.occurrences[0].media[0]);
  };

  const onCancelEdit = () => setEditImage(undefined);

  return (
    <>
      {/* https://github.com/ionic-team/ionic-framework/issues/22511 */}
      <div className="flex flex-col" onClick={onClick}>
        <IonIcon icon={cameraOutline} />
        <IonLabel>
          <T>Photo</T>
        </IonLabel>
      </div>

      <ImageCropper
        image={editImage?.getURL()}
        onDone={onDoneEdit}
        onCancel={onCancelEdit}
      />
    </>
  );
};

export default DefaultCameraSurveyButton;
