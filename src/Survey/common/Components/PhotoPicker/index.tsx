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
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import config from 'common/config';
import appModel from 'models/app';
import Media from 'models/media';
import Occurrence, { type Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import GalleryWithClassification from './GalleryWithClassification';
import ImageWithClassification from './ImageWithClassification';
import './styles.scss';

type URL = string;

export function usePromptImageSource() {
  const { t } = useTranslation();
  const [presentActionSheet] = useIonActionSheet();

  const promptImageSource = (resolve: (value: boolean | null) => void) => {
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
    const disableHardwareBackButton = (event: Event) => {
      (
        event as CustomEvent<{
          register: (
            priority: number,
            handler: (processNextHandler: () => void) => void
          ) => void;
        }>
      ).detail.register(100, processNextHandler => {
        if (!editImage) {
          processNextHandler();
          return;
        }

        onCancelEdit();
      });
    };
    document.addEventListener('ionBackButton', disableHardwareBackButton);

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

  const identifySpecies = (manualTrigger = false) => {
    if (!(model instanceof Occurrence)) return;

    // must reset to avoid getting into mixed state where media has changed but not the classifier results
    model.updateMachineInvolvement();

    if (
      !model.media.length ||
      !useClassifier ||
      !userModel.isLoggedIn() ||
      !userModel.data.verified
    )
      return;

    if (manualTrigger && !device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    model
      .identify()
      .catch(error =>
        manualTrigger
          ? toast.error(error instanceof Error ? error : String(error))
          : console.error(error)
      );
  };

  async function onAdd(shouldUseCamera: boolean) {
    try {
      const photoURLs = await captureImage(
        shouldUseCamera ? { camera: true } : { multiple: true }
      );
      if (!photoURLs.length) return;

      const getImageModel = async (imageURL: URL) =>
        (await Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(imageURL) : imageURL,
          config.dataPath,
          true
        )) as Media;
      const imageModels = await Promise.all(photoURLs.map(getImageModel));

      const canEdit = imageModels.length === 1;
      if (canEdit) {
        setEditImage(imageModels[0]);
        // don't identify until editing is over
        return;
      }

      model.media.push(...imageModels);
      model.save();

      identifySpecies();
    } catch (error) {
      toast.error(error instanceof Error ? error : String(error));
    }
  }

  const onRemove = async (media: Media) => {
    await media.destroy();
    identifySpecies();
  };

  const onDoneEdit = async (imageDataURL: URL) => {
    if (!editImage) return;
    const image = editImage;

    // overwrite existing file
    const oldFileName = image.getURL().split('/').pop();
    if (!oldFileName) throw new Error('Image filename is missing.');
    const extension = oldFileName.split('.').pop() || 'jpg';
    const newFileName = `${Date.now()}.${extension}`;

    await deleteFile(oldFileName);

    const savedURL = await saveFile(imageDataURL, newFileName);

    // copy over new image values to existing model to preserve its observability
    const newImageModel = (await Media.getImageModel(
      isPlatform('hybrid') ? Capacitor.convertFileSrc(savedURL) : savedURL,
      config.dataPath,
      true
    )) as Media;
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

  const onSpeciesSelect = (taxon: Taxon) => model.setTaxon(taxon);

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
        onRemove={onRemove}
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
        >
          <InfoBackgroundMessage
            name="showPhotoCropTip"
            className="z-10 mx-auto mt-[calc(var(--ion-safe-area-top,0)+10px)] w-fit max-w-[90%]"
          >
            <b>Crop Your Photo</b>
            <ul className="list-disc pl-5 text-left">
              <li>Pinch to zoom in/out</li>
              <li>Center the species in frame</li>
              <li>
                For best results from image recognition, we advise cropping in
                closely to the species you want to identify
              </li>
              <li>
                Where possible, ensure your image is in focus and well lit
              </li>
            </ul>
          </InfoBackgroundMessage>
        </ImageCropper>
      )}
    </>
  );
};

export default AppPhotoPicker;
