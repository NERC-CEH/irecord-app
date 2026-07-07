import { Fragment } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { useRouteMatch } from 'react-router';
import {
  Attr,
  MenuAttrItem,
  MenuAttrItemProps,
  AttrProps,
  Toggle,
  getRelativeDate,
  BlockT,
  Block,
} from '@flumens';
import { IonIcon, IonItem } from '@ionic/react';
import { capitalize } from 'common/helpers/string';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { AttrConfig } from 'Survey/common/config';
import { WithLock, LockConfig } from './Lock';
import './styles.scss';

function parseValue(value: any, parse: any, model: Sample | Occurrence) {
  // process value with custom parser, even if value is empty
  if (typeof parse === 'function') return parse(value, model);

  if (!value) return null;

  if (parse === 'date') return getRelativeDate(value);
  if (value instanceof Array) return value.join(', ');

  return value;
}

type Props = {
  attr: AttrConfig | BlockT;
  model: Sample | Occurrence;
  onChange?: any;
  itemProps?: any;
  className?: string;
};

export type Config = Omit<MenuAttrItemProps, 'type'> &
  LockConfig & {
    type?: string;
    parse?: (value: any, model: Sample | Occurrence) => any;
    get?: (model: Sample | Occurrence) => any;
    set?: (value: any, model: Sample | Occurrence) => any;
    attrProps?: Partial<AttrProps>;
    skipValueTranslation?: boolean;
  };

const MenuAttr = ({ attr, model, onChange, itemProps, className }: Props) => {
  const match = useRouteMatch();

  const { id } = attr;

  const { isDisabled } = model;

  if ('type' in attr) {
    return (
      <IonItem className="[--border-style:none] [--inner-padding-end:0] [--padding-start:0] [&>div]:w-full">
        <Block record={model.data} block={attr} isDisabled={isDisabled} />
      </IonItem>
    );
  }

  const menuProps: Config = 'menuProps' in attr ? (attr.menuProps as any) : {};
  const {
    label: labelProp,
    icon,
    required,
    parse,
    type,
    get,
    set,
    skipValueTranslation,
  } = menuProps;
  const valueRaw = (model.data as any)[id];
  const value = parseValue(valueRaw, parse, model);
  const label = labelProp || capitalize(id);

  if (isDisabled && !value) return null;

  if (type === 'toggle') {
    const onAttrToggle = (checked: boolean) => {
      if (set) {
        set(checked, model);
      } else {
        // eslint-disable-next-line no-param-reassign
        (model.data as any)[id] = checked;
      }

      onChange?.(checked);
      return model.save();
    };

    // eslint-disable-next-line no-param-reassign
    delete itemProps?.routerLink;

    return (
      <IonItem className="[--border-style:none] [--inner-padding-end:0] [--padding-start:0]">
        <Toggle
          isSelected={get ? get(model) : value}
          className="w-full"
          label={label}
          prefix={<IonIcon src={icon as string} className="size-6" />}
          onChange={onAttrToggle}
          isDisabled={isDisabled}
          {...itemProps}
        />
      </IonItem>
    );
  }

  if (menuProps.attrProps) {
    // date attr needs wrapper because of the sliding options overlap
    const Wrapper = id === 'date' ? IonItem : Fragment;

    return (
      <Wrapper className={clsx('attr-wrapper', className)}>
        <Attr
          model={model}
          attr={id}
          onChange={onChange}
          {...(menuProps.attrProps as Omit<AttrProps, 'model' | 'attr'>)}
          {...itemProps}
          inputProps={{
            ...menuProps.attrProps?.inputProps,
            ...itemProps?.inputProps,
            disabled: isDisabled,
          }}
        />
      </Wrapper>
    );
  }

  return (
    <MenuAttrItem
      routerLink={`${match.url}/${id}`}
      disabled={isDisabled}
      value={value}
      label={label}
      icon={icon}
      skipValueTranslation={skipValueTranslation}
      required={required}
      className={className}
      {...itemProps}
    />
  );
};

MenuAttr.WithLock = WithLock;

export default observer(MenuAttr);
