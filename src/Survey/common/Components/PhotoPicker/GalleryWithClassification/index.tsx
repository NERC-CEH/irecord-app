import { useEffect, type ReactNode } from 'react';
import { observer } from 'mobx-react';
import { Gallery } from '@flumens';
import Media from 'models/media';
import type { Taxon } from 'models/occurrence';
import ImageFooter from './ImageFooter';

type Props = {
  items: Media[];
  showGallery: number;
  onClose: () => boolean;
  onCrop: (media: Media) => void;
  onDelete: (media: Media) => void | Promise<void>;
  onIdentify: (manualTrigger?: boolean) => void;
  onSpeciesSelect: (taxon: Taxon) => void;
  isDisabled: boolean;
};

const Footer = ({ children }: { children?: ReactNode }) => (
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
    const onSpeciesSelectWrap = (taxon: Taxon) => {
      if (isDisabled) return;

      onSpeciesSelect(taxon);
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
