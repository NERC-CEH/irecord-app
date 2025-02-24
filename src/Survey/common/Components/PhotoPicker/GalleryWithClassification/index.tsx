import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Gallery } from '@flumens';
import Media from 'models/media';
import ImageFooter from './ImageFooter';

type Props = {
  items: Media[];
  showGallery: number;
  onClose: () => boolean;
  onCrop: any;
  onDelete: any;
  onIdentify: any;
  onSpeciesSelect: any;
  isDisabled: boolean;
};

const Footer = ({ children }: any) => (
  <div className="fixed bottom-0 w-full pb-[26px]">{children}</div>
);

const GalleryComponent = ({
  items,
  showGallery,
  onClose,
  onCrop,
  onDelete,
  onSpeciesSelect,
  onIdentify,
  isDisabled,
}: Props) => {
  const getItem = (image: Media) => {
    const onSpeciesSelectWrap = (...args: any) => {
      if (isDisabled) return;

      onSpeciesSelect(...args);
      onClose();
    };

    return {
      src: image.getURL(),
      footer: (
        <ImageFooter
          image={image}
          identifySpecies={onIdentify}
          onCrop={onCrop}
          onDelete={onDelete}
          onSpeciesSelect={onSpeciesSelectWrap}
        />
      ),
    };
  };

  const closeGalleryIfDeletedLastPhoto = () => {
    if (Number.isFinite(showGallery) && !items.length) onClose();
  };
  useEffect(closeGalleryIfDeletedLastPhoto, [items.length]);

  return (
    <Gallery
      isOpen={Number.isFinite(showGallery)}
      items={items.map(getItem)}
      initialSlide={showGallery}
      onClose={onClose}
      Footer={Footer}
    />
  );
};

export default observer(GalleryComponent);
