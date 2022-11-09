import { FC } from 'react';
import { Gallery, useToast } from '@flumens';
import Media from 'models/media';
import { useUserStatusCheck } from 'models/user';
import { observer } from 'mobx-react';
import ImageTitle from './ImageTitle';
import ImageFooter from './ImageFooter';

type Props = {
  items: Media[];
  showGallery: number;
  onClose: () => boolean;
  onCrop: any;
  onSpeciesSelect: any;
};

const Footer = ({ children }: any) => (
  <div className="footer-container">{children}</div>
);

const GalleryComponent: FC<Props> = ({
  items,
  showGallery,
  onClose,
  onCrop,
  onSpeciesSelect,
}) => {
  const toast = useToast();
  const checkUserStatus = useUserStatusCheck();

  const getItem = (image: Media) => {
    const identifyImage = async () => {
      onClose();

      const isUserOK = await checkUserStatus();
      if (!isUserOK) return;

      image.identify().catch(toast.error);
    };

    const onSpeciesSelectWrap = (...args: any) => {
      onSpeciesSelect(...args);
      onClose();
    };

    return {
      src: image.getURL(),
      footer: (
        <ImageFooter
          image={image}
          identifyImage={identifyImage}
          onCrop={onCrop}
          onSpeciesSelect={onSpeciesSelectWrap}
        />
      ),
      title: <ImageTitle image={image} />,
    };
  };

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
