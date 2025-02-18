/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { observer } from 'mobx-react';
import Media from 'models/media';
import ClassificationStatus from './ClassificationStatus';

type Props = {
  media: Media;
  onClick: any;
};

const Image = ({ media, onClick }: Props) => {
  return (
    <div className="img">
      <img src={media.getURL()} onClick={onClick} />

      <div className="absolute bottom-0 right-0">
        <ClassificationStatus media={media} />
      </div>
    </div>
  );
};

export default observer(Image);
