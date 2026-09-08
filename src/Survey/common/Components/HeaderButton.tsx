import type { ComponentProps, ReactNode } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Button } from '@flumens';

type Props = {
  children: ReactNode;
  onClick: ComponentProps<typeof Button>['onPress'];
  isInvalid?: boolean;
  className?: string;
  fill?: 'outline' | 'solid' | 'clear';
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'danger'
    | 'success'
    | 'warning';
  skipTranslation?: boolean;
};

const HeaderButton = ({
  children,
  onClick,
  isInvalid,
  fill,
  color,
  className,
  skipTranslation,
}: Props) => (
  <Button
    onPress={onClick}
    color={color || (!isInvalid ? 'primary' : undefined)}
    fill={fill}
    className={clsx(
      'max-w-28 whitespace-nowrap px-4 py-1 text-base',
      isInvalid && 'opacity-50',
      className
    )}
    skipTranslation={skipTranslation}
  >
    {children}
  </Button>
);

export default observer(HeaderButton);
