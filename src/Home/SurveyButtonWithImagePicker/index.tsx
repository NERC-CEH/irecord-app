import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  captureImage,
  ImageCropper,
  useToast,
  saveFile,
  deleteFile,
  device,
} from '@flumens';
import { isPlatform } from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import config from 'common/config';
import appModel from 'models/app';
import samples from 'models/collections/samples';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import defaultSurveyConfig from 'Survey/Default/config';
import SurveyButton from './SurveyButton';

type URL = string;

const SurveyButtonWithImagePicker = ({
  onPrimarySurvey,
  onListSurvey,
  onMothSurvey,
  onPlantSurvey,
}: any) => {
  const [editImage, setEditImage] = useState<Media>();
  const toast = useToast();

  const onPrimarySurveyWrap = async (images: Media[]) => {
    const sample = await defaultSurveyConfig.create({
      Sample,
      Occurrence,
      images,
    });

    await sample.save();

    // add to main collection
    samples.push(sample);

    const { useSpeciesImageClassifier } = appModel.data;
    const shouldAutoID =
      useSpeciesImageClassifier &&
      device.isOnline &&
      userModel.isLoggedIn() &&
      userModel.data.verified;
    if (shouldAutoID) {
      const processError = (error: any) =>
        !error.isHandled && console.error(error); // don't toast this to user
      sample.occurrences[0].identify().catch(processError);
    }

    onPrimarySurvey(sample.cid);
  };

  async function onClick(useCamera = false) {
    try {
      const photoURLs = await captureImage({
        camera: useCamera,
        multiple: !useCamera,
      });
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

      if (imageModels.length !== 1) {
        onPrimarySurveyWrap(imageModels);
        return;
      }

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

    const savedURL = await saveFile(imageDataURL, newFileName);

    // copy over new image values to existing model to preserve its observability
    const newImageModel: any = await Media.getImageModel(
      isPlatform('hybrid') ? Capacitor.convertFileSrc(savedURL) : savedURL,
      config.dataPath,
      true
    );
    Object.assign(image?.data, { ...newImageModel.data, species: null });

    setEditImage(undefined);

    onPrimarySurveyWrap([newImageModel]);
  };

  const onCancelEdit = () => setEditImage(undefined);

  return (
    <>
      <SurveyButton
        onPrimarySurvey={onPrimarySurvey}
        onListSurvey={onListSurvey}
        onMothSurvey={onMothSurvey}
        onPlantSurvey={onPlantSurvey}
        onCameraSurveyStart={() => onClick(true)}
        onGallerySurveyStart={() => onClick()}
      />

      <ImageCropper
        image={editImage?.getURL()}
        onDone={onDoneEdit}
        onCancel={onCancelEdit}
      >
        <InfoBackgroundMessage
          name="showPhotoCropTip"
          className="z-10 mx-auto mt-[calc(var(--ion-safe-area-top,0)+10px)] w-fit max-w-[90%]"
        >
          <b>Crop Your Photo</b>
          <ul className="list-disc pl-5 text-left">
            <li>Pinch to zoom in/out</li>
            <li>Center the species in frame</li>
            <li>Ensure good focus and lighting for best AI results</li>
          </ul>
        </InfoBackgroundMessage>
      </ImageCropper>
    </>
  );
};

export default SurveyButtonWithImagePicker;
