import { isValidLocation, locationToGrid, Location } from '@flumens';

// eslint-disable-next-line import-x/prefer-default-export
export const printLocation = (location: Location) => {
  if (!isValidLocation(location)) return '';

  if (location.gridref) {
    let { accuracy } = location;

    // cannot be odd
    if (Number.isFinite(accuracy) && accuracy! % 2 !== 0) {
      // should not be less than 2
      accuracy = accuracy === 1 ? accuracy + 1 : accuracy! - 1;
    } else if (accuracy === 0) {
      accuracy = 2;
    }

    // check if location is within UK
    let prettyLocation = locationToGrid(location);
    if (!prettyLocation) {
      prettyLocation = `${parseFloat(location.latitude as any).toFixed(
        4
      )}, ${parseFloat(location.longitude as any).toFixed(4)}`;
    }

    return prettyLocation;
  }

  return `${parseFloat(location.latitude as any).toFixed(4)}, ${parseFloat(
    location.longitude as any
  ).toFixed(4)}`;
};
