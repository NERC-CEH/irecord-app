import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import './styles.scss';

// Classes used by Leaflet to position controls.
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
} as const;

const MapCustomControl = (props: MapCustomControlProps): JSX.Element | null => {
  const {
    position = 'topleft',
    containerProps,
    children,
    isDisabled,
    className,
  } = props;

  if (isDisabled) return null;

  return (
    <div className={`${POSITION_CLASSES[position]} gps-button ${className}`}>
      <div className="leaflet-control leaflet-bar" {...containerProps}>
        {children}
      </div>
    </div>
  );
};

export type MapCustomControlProps = {
  position: keyof typeof POSITION_CLASSES;
  containerProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  children: ReactNode;
  isDisabled?: boolean;
  className?: string;
};

MapCustomControl.defaultProps = {
  containerProps: {},
};

export default MapCustomControl;
