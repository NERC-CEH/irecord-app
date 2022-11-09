import { FC, useState, useEffect } from 'react';
import {
  PhotoPicker,
  ImageCropper,
  captureImage,
  device,
  useToast,
  saveFile,
  deleteFile,
} from '@flumens';
import { isPlatform } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import Media from 'models/media';
import Sample from 'models/sample';
import appModel from 'models/app';
import userModel from 'models/user';
import Occurrence from 'models/occurrence';
import config from 'common/config';
import GalleryWithClassification from './GalleryWithClassification';
import ImageWithClassification from './ImageWithClassification';
import getPhotoFromCustomCamera from './customCamera';
import './styles.scss';

type URL = string;

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

const AppPhotoPicker: FC<Props> = ({
  model,
  allowToCrop = true,
  disableClassifier = false,
}) => {
  const [editImage, setEditImage] = useState<Media>();
  const toast = useToast();

  const { useSpeciesImageClassifier } = appModel.attrs;
  const useClassifier = !disableClassifier && useSpeciesImageClassifier;

  const identify = (imageModel: Media) => {
    if (useClassifier && device.isOnline && userModel.isLoggedIn()) {
      imageModel.identify().catch(console.error); // don't toast this to user
    }
  };

  async function onAddNew(shouldUseCamera: boolean) {
    try {
      const photoURLs = await captureImage(
        shouldUseCamera
          ? { getPhoto: getPhotoFromCustomCamera }
          : { multiple: true }
      );
      if (!photoURLs.length) return;

      const getImageModel = async (imageURL: URL) =>
        Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(imageURL) : imageURL,
          config.dataPath
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

      imageModels.map(identify);
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

    if (!image.parent) {
      // came straight from camera rather than editing existing
      model.media.push(image);
    }

    model.save();

    setEditImage(undefined);

    identify(image);
  };

  const onCancelEdit = () => setEditImage(undefined);

  const onCropExisting = (media: Media) => {
    if (model.isDisabled()) return;

    setEditImage(media);
  };

  const allowToEdit = allowToCrop && !model.isDisabled();

  useOnBackButton(onCancelEdit, editImage);

  const onSpeciesSelect = (taxon: any) => {
    // eslint-disable-next-line no-param-reassign
    (model as Occurrence).attrs.taxon = taxon;
    model.save(); // for some reason needs manual save here.
  };

  const isDisabled = model.isDisabled();
  if (isDisabled && !model.media.length) return null;

  return (
    <>
      <PhotoPicker
        className="with-cropper"
        onAddNew={onAddNew}
        model={model}
        Image={useClassifier ? ImageWithClassification : undefined}
        Gallery={useClassifier ? GalleryWithClassification : undefined}
        galleryProps={{ onCrop: onCropExisting, onSpeciesSelect }}
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
