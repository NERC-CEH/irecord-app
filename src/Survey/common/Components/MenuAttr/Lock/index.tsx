import { useRef } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  lockOpenOutline,
  lockClosedOutline,
  chevronForwardOutline,
  chevronDownOutline,
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useToast } from '@flumens';
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
import MenuAttr from '..';
import './styles.scss';

type Props = {
  model: Sample | Occurrence;
  attr: string;
  children: any;
};

const Lock = ({ model, attr, children }: Props) => {
  const toast = useToast();

  let value = (model.data as any)[attr];
  const survey = model.getSurvey();
  if (!value && survey.attrs?.[attr]?.menuProps?.getLock) {
    value = survey.attrs[attr].menuProps?.getLock?.(model);
  }

  const allowLocking = !!value;

  const sliderRef = useRef<any>(null);

  if (model.isDisabled) return <>{children}</>;

  const isLocked = appModel.isAttrLocked(model, attr);
  const toggleLockWrap = async () => {
    const isOpen = sliderRef.current.firstChild.style.transform;
    if (!isOpen) return;

    sliderRef.current.close(); // needs to be after the openness check

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    if (isLocked) {
      appModel.unsetAttrLock(model, attr);
      return;
    }

    if (value) {
      appModel.setAttrLock(model, attr, value);

      toast.success(
        'The attribute value was locked and will be pre-filled for subsequent records.',
        {
          color: 'secondary',
          position: 'bottom',
        }
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
};

export type LockConfig = {
  /**
   * For custom locked value checks. Useful for aggregated attrs like number + ranges.
   */
  isLocked?: (model: Sample | Occurrence) => any;
  /**
   * For custom locked value getting. Useful for aggregated attrs like number + ranges.
   */
  getLock?: (model: Sample | Occurrence) => any;
  /**
   * For custom locked value unsetting. Useful for aggregated attrs like number + ranges.
   */
  setLock?: (model: Sample | Occurrence, attr: string, value?: any) => any;
  /**
   * For custom locked value removal. Useful for aggregated attrs like number + ranges.
   */
  unsetLock?: (model: Sample | Occurrence, attr: string) => any;
};

export type MenuAttrWithLockProps = {
  model: Sample | Occurrence;
  attr: string;
  itemProps?: any;
  onChange?: any;
};

export const WithLock = observer(
  ({
    model,
    attr,
    itemProps: itemPropsProp,
    ...other
  }: MenuAttrWithLockProps) => {
    const isLocked = appModel.isAttrLocked(model, attr);

    // eslint-disable-next-line no-unused-expressions
    (model.data as any)[attr]; // force rerender on val change

    const onChange = (newValue: any) => {
      if (!isLocked) return;

      if (!newValue) {
        appModel.unsetAttrLock(model, attr);
        return;
      }

      appModel.setAttrLock(model, attr, newValue);
    };

    const itemProps = {
      ...itemPropsProp,

      // chevronForwardOutline - 'undefined' doesn't work in this case, why?
      detailIcon: isLocked ? lockClosedOutline : chevronForwardOutline,
    };

    if (attr === 'date') {
      itemProps.inputProps = {
        ...itemProps.inputProps,
        accordionProps: {
          toggleIcon: isLocked ? lockClosedOutline : chevronDownOutline,
        },
      };
    }

    return (
      <Lock model={model} attr={attr}>
        <MenuAttr
          model={model}
          attr={attr}
          onChange={onChange}
          itemProps={itemProps}
          {...other}
        />
      </Lock>
    );
  }
);

export default observer(Lock);
