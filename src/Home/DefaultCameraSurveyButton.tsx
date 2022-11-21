import { FC, useState } from 'react';
import { cameraOutline } from 'ionicons/icons';
import defaultSurveyConfig from 'Survey/Default/config';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import Media from 'models/media';
import userModel from 'models/user';
import appModel from 'models/app';
import getPhotoFromCustomCamera from 'Survey/common/Components/PhotoPicker/customCamera';
import {
  captureImage,
  ImageCropper,
  useToast,
  saveFile,
  deleteFile,
  device,
} from '@flumens';
import savedSamples from 'models/savedSamples';
import { Capacitor } from '@capacitor/core';
import { IonIcon, IonLabel, isPlatform } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import config from 'common/config';

type URL = string;

const identify = (imageModel: Media) => {
  const { useSpeciesImageClassifier } = appModel.attrs;
  if (useSpeciesImageClassifier && device.isOnline && userModel.isLoggedIn()) {
    const processError = (error: any) =>
      !error.isHandled && console.error(error); // don't toast this to user
    imageModel.identify().catch(processError);
  }
};

const DefaultCameraSurveyButton: FC = () => {
  const [editImage, setEditImage] = useState<Media>();
  const toast = useToast();

  async function onClick() {
    try {
      const photoURLs = await captureImage({
        getPhoto: getPhotoFromCustomCamera,
      });
      if (!photoURLs.length) return;

      const getImageModel = async (imageURL: URL) =>
        Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(imageURL) : imageURL,
          config.dataPath
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
    const newImageModel = await Media.getImageModel(savedURL, config.dataPath);
    Object.assign(image?.attrs, { ...newImageModel.attrs, species: null });

    setEditImage(undefined);

    const sample = await (defaultSurveyConfig as any).createWithPhoto(
      Sample,
      Occurrence,
      {
        image: newImageModel,
      }
    );

    await sample.save();

    // add to main collection
    savedSamples.push(sample);
    identify(sample.occurrences[0].media[0]);
  };

  const onCancelEdit = () => setEditImage(undefined);

  return (
    <>
      {/* https://github.com/ionic-team/ionic-framework/issues/22511 */}
      <div className="on-click-container" onClick={onClick}>
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
