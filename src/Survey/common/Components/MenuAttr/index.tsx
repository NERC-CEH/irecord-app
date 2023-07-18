import { FC } from 'react';
import {
  MenuAttrItemFromModel,
  MenuAttrItemFromModelProps,
  MenuAttrItemFromModelMenuProps,
} from '@flumens';
import { WithLock, LockConfig, MenuAttrWithLockProps } from './Lock';
import './styles.scss';

export type Config = MenuAttrItemFromModelMenuProps & LockConfig;

type A = FC<MenuAttrItemFromModelProps> & {
  WithLock: FC<MenuAttrWithLockProps>;
};

const MenuAttr: A = MenuAttrItemFromModel as any;

MenuAttr.WithLock = WithLock;

export default MenuAttr;
