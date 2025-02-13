import { observer } from 'mobx-react';
import { InfoBackgroundMessage } from '@flumens';
import appModel, { Attrs } from 'models/app';

interface Props {
  name?: keyof Attrs;
  children: any;
  className?: string;
  skipTranslation?: boolean;
}

const Message = ({ name, children, ...props }: Props) => {
  if (name && !appModel.attrs[name]) {
    return null;
  }

  const hideMessage = () => {
    (appModel.attrs as any)[name as any] = false;
    return {};
  };

  const onHide = name ? hideMessage : undefined;

  return (
    <InfoBackgroundMessage onHide={onHide} {...props}>
      {children}
    </InfoBackgroundMessage>
  );
};

export default observer(Message);
