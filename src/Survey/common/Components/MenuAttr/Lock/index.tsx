import { useRef } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  lockOpenOutline,
  lockClosedOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { BlockT, useToast } from '@flumens';
import {
  OnChange,
  onChange as onChangeOrig,
} from '@flumens/tailwind/dist/components/Block';
import {
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  isPlatform,
} from '@ionic/react';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import MenuAttr, { Props as MenuAttrProps } from '..';
import './styles.scss';
import { LockConfig } from './types';

type Props = {
  survey: string;
  taxa?: string;
  model: Sample | Occurrence;
  children: any;
  block: BlockT & { lock?: LockConfig };
} & MenuAttrProps;

const Lock = observer(({ survey, taxa, model, block, children }: Props) => {
  const toast = useToast();

  let value = (model.data as any)[block.id];
  if (!value && block.lock?.get) {
    value = block.lock?.get?.({ record: model.data, block, survey, taxa });
  }

  const allowLocking = !!value;

  const sliderRef = useRef<any>(null);

  if (model.isDisabled) return <>{children}</>;

  const type = model instanceof Sample ? 'smp' : 'occ';

  let isLocked = appModel.locks.isLocked(survey, taxa, type, block.id, value);
  if (block.lock?.isLocked) {
    isLocked = block.lock?.isLocked?.({
      record: model.data,
      block,
      survey,
      taxa,
    });
  }

  const toggleLockWrap = async () => {
    const isOpen = sliderRef.current.classList.contains(
      'item-sliding-active-slide'
    );
    if (!isOpen) return;

    sliderRef.current.close(); // needs to be after the openness check

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    if (isLocked) {
      if (block.lock?.unset) {
        block.lock?.unset?.({ record: model.data, block, survey, taxa });
        return;
      }

      appModel.locks.unset(survey, taxa, type, block.id);
      return;
    }

    if (value) {
      if (block.lock?.set) {
        block.lock?.set?.({ record: model.data, block, value, survey, taxa });
        return;
      }

      appModel.locks.set(survey, taxa, type, block.id, value);

      toast.success(
        'The attribute value was locked and will be pre-filled for subsequent records.',
        { color: 'secondary', position: 'bottom' }
      );
    }
  };

  return (
    <IonItemSliding
      ref={sliderRef}
      className={clsx(
        'menu-attr-item',
        'menu-attr-item-lock',
        isLocked && 'locked'
      )}
      disabled={!allowLocking}
    >
      {children}

      <IonItemOptions side="end">
        <IonItemOption
          className={clsx('lock', isLocked && 'locked')}
          color="secondary"
          onClick={toggleLockWrap}
        >
          <IonIcon icon={isLocked ? lockOpenOutline : lockClosedOutline} />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
});

export type MenuAttrWithLockProps = {
  survey: string;
  model: Sample | Occurrence;
  block: BlockT & { lock?: LockConfig };
  taxa?: string;
  link?: string;
  onChange?: OnChange;
};

export const WithLock = observer(
  ({
    survey,
    taxa,
    model,
    block,
    onChange: onChangeProp,
    ...other
  }: MenuAttrWithLockProps) => {
    const { id } = block;

    const type = model instanceof Sample ? 'smp' : 'occ';
    const currentVal = (model.data as any)[id];
    let isLocked = appModel.locks.isLocked(survey, taxa, type, id, currentVal);
    if (block.lock?.isLocked) {
      isLocked = block.lock?.isLocked?.({
        record: model.data,
        block,
        survey,
        taxa,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (model.data as any)[id]; // force rerender on val change

    const onChange = (...args: Parameters<typeof onChangeOrig>) => {
      onChangeProp ? onChangeProp(...args) : onChangeOrig(...args);

      if (!isLocked) return;

      const newValue = args[0];
      if (!newValue) {
        appModel.locks.unset(survey, taxa, type, id);
        return;
      }

      appModel.locks.set(survey, taxa, type, id, newValue);
    };

    return (
      <Lock model={model} block={block} survey={survey} taxa={taxa}>
        <MenuAttr
          model={model}
          block={block}
          onChange={onChange}
          linkIcon={isLocked ? lockClosedOutline : chevronForwardOutline}
          {...other}
        />
      </Lock>
    );
  }
);

export default Lock;
