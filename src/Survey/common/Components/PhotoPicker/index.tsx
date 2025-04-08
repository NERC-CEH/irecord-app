import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import {
  PhotoPicker,
  ImageCropper,
  captureImage,
  device,
  useToast,
  saveFile,
  deleteFile,
} from '@flumens';
import { isPlatform, useIonActionSheet } from '@ionic/react';
import config from 'common/config';
import appModel from 'models/app';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import GalleryWithClassification from './GalleryWithClassification';
import ImageWithClassification from './ImageWithClassification';
import './styles.scss';

type URL = string;

export function usePromptImageSource() {
  const { t } = useTranslation();
  const [presentActionSheet] = useIonActionSheet();

  const promptImageSource = (resolve: any) => {
    presentActionSheet({
      buttons: [
        { text: t('Gallery'), handler: () => resolve(false) },
        { text: t('Camera'), handler: () => resolve(true) },
        { text: t('Cancel'), role: 'cancel', handler: () => resolve(null) },
      ],
      header: t('Choose a method to upload a photo'),
    });
  };
  const promptImageSourceWrap = () =>
    new Promise<boolean | null>(promptImageSource);

  return promptImageSourceWrap;
}

type Props = {
  model: Sample | Occurrence;
  disableClassifier?: boolean;
  allowToCrop?: boolean;
};

const useOnBackButton = (onCancelEdit: () => void, editImage?: Media) => {
  const hideModal = () => {
    const disableHardwareBackButton = (event: any) => {
      // eslint-disable-next-line
      event.detail.register(100, (processNextHandler: any) => {
        if (!editImage) {
          processNextHandler();
          return null;
        }

        onCancelEdit();
      });
    };

    // eslint-disable-next-line
    document.addEventListener('ionBackButton', disableHardwareBackButton);
    // eslint-disable-next-line
    const removeEventListener = () =>
      document.removeEventListener('ionBackButton', disableHardwareBackButton);
    return removeEventListener;
  };

  useEffect(hideModal, [editImage]);
};

const AppPhotoPicker = ({
  model,
  allowToCrop = true,
  disableClassifier = false,
}: Props) => {
  const [editImage, setEditImage] = useState<Media>();
  const toast = useToast();

  const { useSpeciesImageClassifier } = appModel.data;
  const useClassifier = !disableClassifier && useSpeciesImageClassifier;

  const identifySpecies = () => {
    if (!(model instanceof Occurrence)) return;

    // must reset to avoid getting into mixed state where media has changed but not the classifier results
    model.updateMachineInvolvement();

    if (
      !model.media.length ||
      !useClassifier ||
      !device.isOnline ||
      !userModel.isLoggedIn() ||
      !userModel.data.verified
    )
      return;

    const processError = (error: any) =>
      !error.isHandled && console.error(error); // don't toast this to user
    model.identify().catch(processError);
  };

  async function onAdd(shouldUseCamera: boolean) {
    try {
      const photoURLs = await captureImage(
        shouldUseCamera ? { camera: true } : { multiple: true }
      );
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

      const canEdit = imageModels.length === 1;
      if (canEdit) {
        setEditImage(imageModels[0]);
        // don't identify until editing is over
        return;
      }

      model.media.push(...imageModels);
      model.save();

      identifySpecies();
    } catch (e: any) {
      toast.error(e);
    }
  }

  const onRemove = async (m: any) => {
    await m.destroy();
    identifySpecies();
  };

  const onDoneEdit = async (imageDataURL: URL) => {
    const image = editImage as Media;

    // overwrite existing file
    const oldFileName: string = image?.getURL().split('/').pop() as string;
    const extension = oldFileName.split('.').pop() as string;
    const newFileName = `${Date.now()}.${extension}`;

    await deleteFile(oldFileName);

    const savedURL = await saveFile(imageDataURL, newFileName);

    // copy over new image values to existing model to preserve its observability
    const newImageModel = await Media.getImageModel(
      isPlatform('hybrid') ? Capacitor.convertFileSrc(savedURL) : savedURL,
      config.dataPath,
      true
    );
    Object.assign(image?.data, { ...newImageModel.data, species: null });

    if (!image.parent) {
      // came straight from camera rather than editing existing
      model.media.push(image);
    }

    model.save();

    setEditImage(undefined);

    identifySpecies();
  };

  const onCancelEdit = () => setEditImage(undefined);

  const onCropExisting = (media: Media) => {
    if (model.isDisabled) return;

    setEditImage(media);
  };

  const allowToEdit = allowToCrop && !model.isDisabled;

  useOnBackButton(onCancelEdit, editImage);

  const onSpeciesSelect = (taxon: any) => model.setTaxon(taxon);

  const { isDisabled } = model;
  if (isDisabled && !model.media.length) return null;

  return (
    <>
      <PhotoPicker
        className="with-cropper"
        onAdd={onAdd}
        value={model.media}
        Image={useClassifier ? ImageWithClassification : undefined}
        Gallery={useClassifier ? GalleryWithClassification : undefined}
        galleryProps={{
          onCrop: onCropExisting,
          onSpeciesSelect,
          isDisabled,
          onDelete: onRemove,
          onIdentify: identifySpecies,
        }}
        isDisabled={isDisabled}
      />

      {allowToEdit && (
        <ImageCropper
          image={editImage?.getURL()}
          onDone={onDoneEdit}
          onCancel={onCancelEdit}
        />
      )}
    </>
  );
};

export default AppPhotoPicker;
