import { FC } from 'react';
import { Circle } from 'react-leaflet';
import { Square } from '../../esResponse.d';

interface Props {
  square: Square;
  fillOpacity: number;
}

// const Marker: FC<Props> = ({ square }) => {
const Marker: FC<Props> = ({ square, fillOpacity }) => {
  const location = square.key.split(' ');
  const latitude = parseFloat(location[1]);
  const longititude = parseFloat(location[0]);

  const radius = (square.size / 2) * 0.8; // 20% for padding

  return (
    <Circle
      center={[latitude, longititude]}
      radius={radius}
      fillOpacity={fillOpacity}
    />
  );
};

export default Marker;
