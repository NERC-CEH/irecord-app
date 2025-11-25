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
} from '@flumens';
import { IonIcon, IonItem } from '@ionic/react';
import { capitalize } from 'common/helpers/string';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { WithLock, LockConfig } from './Lock';
import './styles.scss';

function parseValue(value: any, parse: any, model: Sample | Occurrence) {
  // process value with custom parser, even if value is empty
  if (typeof parse === 'function') {
    return parse(value, model);
  }

  if (!value) return null;

  if (parse === 'date') {
    return getRelativeDate(value);
  }

  if (value instanceof Array) {
    return value.join(', ');
  }

  return value;
}

type Props = {
  attr: string;
  model: Sample | Occurrence;
  onChange?: any;
  itemProps?: any;
  className?: string;
};

export type Config = Omit<MenuAttrItemProps, 'type'> &
  LockConfig & {
    metadata?: boolean;
    type?: string;
    parse?: (value: any, model: Sample | Occurrence) => any;
    get?: (model: Sample | Occurrence) => any;
    set?: (value: any, model: Sample | Occurrence) => any;
    attrProps?: Partial<AttrProps>;
    skipValueTranslation?: boolean;
  };

const MenuAttr = ({ attr, model, onChange, itemProps, className }: Props) => {
  const match = useRouteMatch();

  const survey = model.getSurvey();
  const menuProps: Config = survey.attrs?.[attr].menuProps || {};
  const {
    label: labelProp,
    icon,
    required,
    metadata,
    parse,
    type,
    get,
    set,
    skipValueTranslation,
  } = menuProps;
  const valueRaw = metadata
    ? (model.metadata as any)[attr]
    : (model.data as any)[attr];
  const value = parseValue(valueRaw, parse, model);
  const { isDisabled } = model;

  const link = `${match.url}/${attr}`;

  const label = labelProp || capitalize(attr);

  if (isDisabled && !value) return null;

  if (type === 'toggle') {
    const onAttrToggle = (checked: boolean) => {
      if (set) {
        set(checked, model);
      } else {
        // eslint-disable-next-line no-param-reassign
        (model.data as any)[attr] = checked;
      }

      onChange && onChange(checked);
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
    const Wrapper = attr === 'date' ? IonItem : Fragment;

    return (
      <Wrapper className={clsx('attr-wrapper', className)}>
        <Attr
          model={model}
          attr={attr}
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
      routerLink={link}
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
