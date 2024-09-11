import { ReactNode } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Button } from '@flumens';

interface Props {
  children: ReactNode;
  onClick: any;
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
}

const HeaderButton = ({
  children,
  onClick,
  isInvalid,
  fill,
  color,
  className,
  skipTranslation,
}: Props) => {
  return (
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
};

export default observer(HeaderButton);
