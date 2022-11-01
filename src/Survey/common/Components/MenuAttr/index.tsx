import { FC, Fragment } from 'react';
import { useRouteMatch } from 'react-router';
import { IonItem } from '@ionic/react';
import {
  Attr,
  MenuAttrItem,
  MenuAttrToggle,
  date as dateHelp,
  MenuAttrItemProps,
  AttrProps,
} from '@flumens';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { WithLock, LockConfig, MenuAttrWithLockProps } from './Lock';
import './styles.scss';

function parseValue(value: any, parse: any, model: Sample | Occurrence) {
  // process value with custom parser, even if value is empty
  if (typeof parse === 'function') {
    return parse(value, model);
  }

  if (!value) return null;

  if (parse === 'date') {
    return dateHelp.print(value);
  }

  if (value instanceof Array) {
    return value.join(', ');
  }

  return value;
}

const capitalize = (s: string) =>
  typeof s !== 'string' ? '' : s.charAt(0).toUpperCase() + s.slice(1);

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
  };

const MenuAttr: FC<Props> & { WithLock: FC<MenuAttrWithLockProps> } = ({
  attr,
  model,
  onChange,
  itemProps,
  className,
}) => {
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
  } = menuProps;
  const valueRaw = metadata
    ? (model.metadata as any)[attr]
    : (model.attrs as any)[attr];
  const value = parseValue(valueRaw, parse, model);
  const isDisabled = model.isDisabled();

  const link = `${match.url}/${attr}`;

  const label = labelProp || capitalize(attr);

  if (type === 'toggle') {
    const onAttrToggle = (checked: boolean) => {
      if (set) {
        set(checked, model);
      } else {
        // eslint-disable-next-line no-param-reassign
        (model.attrs as any)[attr] = checked;
      }

      onChange && onChange(checked);
      return model.save();
    };

    // eslint-disable-next-line no-param-reassign
    delete itemProps?.routerLink;

    return (
      <MenuAttrToggle
        value={get ? get(model) : value}
        label={label}
        icon={icon}
        onChange={onAttrToggle}
        disabled={isDisabled}
        {...itemProps}
      />
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

  if (isDisabled && !value) return null;

  return (
    <MenuAttrItem
      routerLink={link}
      disabled={isDisabled}
      value={value}
      label={label}
      icon={icon}
      required={required}
      className={className}
      {...itemProps}
    />
  );
};

MenuAttr.WithLock = WithLock;

export default observer(MenuAttr);
