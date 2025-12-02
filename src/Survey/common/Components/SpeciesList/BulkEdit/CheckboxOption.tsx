/* eslint-disable no-param-reassign */
import { checkmarkOutline } from 'ionicons/icons';
import { Checkbox } from 'react-aria-components';
import { IonIcon } from '@ionic/react';

type Props = {
  value: string;
};

function Option(props: Props) {
  return (
    <Checkbox
      {...props}
      className="px-5 h-full items-center flex border-r-neutral-100 border-r"
    >
      {({ isSelected }) => (
        <div className="flex  items-center justify-center size-7 border-neutral-200 border rounded-full">
          {isSelected && (
            <IonIcon
              icon={checkmarkOutline}
              className="absolute stroke-2! size-6! transition-[opacity] duration-200 opacity-100"
            />
          )}
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle r="45" cx="50" cy="50" fill="none" />
          </svg>
        </div>
      )}
    </Checkbox>
  );
}

export default Option;
