import { observer } from 'mobx-react';
import {
  InfoBackgroundMessage,
  type InfoMessageProps,
  type PickByType,
} from '@flumens';
import appModel, { type Data } from 'models/app';

type Props = InfoMessageProps & {
  name?: keyof PickByType<Data, boolean>;
};

const Message = ({ name, children, ...props }: Props) => {
  if (name && !appModel.data[name]) return null;

  // eslint-disable-next-line no-return-assign
  const onHide = name ? () => (appModel.data[name] = false) : undefined;

  return (
    <InfoBackgroundMessage onHide={onHide} {...props}>
      {children}
    </InfoBackgroundMessage>
  );
};

export default observer(Message);
