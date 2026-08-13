import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { BlockT, Block } from '@flumens';
import { OnChange } from '@flumens/tailwind/dist/components/Block';
import { IonIcon, IonItem } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { WithLock } from './Lock';
import './styles.scss';

export type Props = {
  block: BlockT;
  model: Sample | Occurrence;
  onChange?: OnChange;
  link?: string;
  linkIcon?: string;
};

const MenuAttr = ({ block, model, link, linkIcon, onChange }: Props) => {
  const match = useRouteMatch();

  const { id } = block;

  const { isDisabled } = model;

  if (!('type' in block)) throw new Error('MenuAttr: attr must be BlockT');

  const pageLinkIcon = linkIcon ? (
    <IonIcon src={linkIcon} className="lock size-6 pr-2 opacity-25" />
  ) : undefined;

  const basePath = !link?.endsWith(`/${id}`)
    ? ''
    : link.slice(match.url.length, -id.length - 1);

  return (
    <IonItem className="border-ion-none pe-ion-i-0 ps-ion-0 [&>div]:w-full">
      <Block
        record={model.data}
        block={block}
        isDisabled={isDisabled}
        basePath={basePath}
        onChange={onChange}
        pageLinkIcon={pageLinkIcon}
      />
    </IonItem>
  );
};

MenuAttr.WithLock = WithLock;

export default observer(MenuAttr);
