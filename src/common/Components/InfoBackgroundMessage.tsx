import { observer } from 'mobx-react';
import { InfoBackgroundMessage } from '@flumens';
import appModel, { Data } from 'models/app';

interface Props {
  name?: keyof Data;
  children: any;
  className?: string;
  skipTranslation?: boolean;
}

const Message = ({ name, children, ...props }: Props) => {
  if (name && !appModel.data[name]) {
    return null;
  }

  const hideMessage = () => {
    (appModel.data as any)[name as any] = false;
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
