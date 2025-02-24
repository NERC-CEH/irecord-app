/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { observer } from 'mobx-react';
import Occurrence from 'common/models/occurrence';
import Media from 'models/media';
import ClassificationStatus from './ClassificationStatus';

type Props = {
  media: Media;
  onClick: any;
};

const Image = ({ media, onClick }: Props) => {
  let classifierStatus = null;

  if (media.parent instanceof Occurrence) {
    classifierStatus = (
      <div className="absolute bottom-0 right-0">
        <ClassificationStatus occurrence={media.parent} />
      </div>
    );
  }

  return (
    <div className="img">
      <img src={media.getURL()} onClick={onClick} />

      {classifierStatus}
    </div>
  );
};

export default observer(Image);
