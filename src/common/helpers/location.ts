import { isValidLocation, locationToGrid, type Location } from '@flumens';

export const hasCoordinates = (
  location?: Partial<Location>
): location is Location => isValidLocation(location as Location);

export const getGridRefSystem = (gridref?: string | null) =>
  /^[A-Z]\d/i.test(gridref || '') ? ('OSIE' as const) : ('OSGB' as const);

export const printLocation = (location: Partial<Location>) => {
  if (!hasCoordinates(location)) return '';

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
      prettyLocation = `${Number(location.latitude).toFixed(4)}, ${Number(
        location.longitude
      ).toFixed(4)}`;
    }

    return prettyLocation;
  }

  return `${Number(location.latitude).toFixed(4)}, ${Number(
    location.longitude
  ).toFixed(4)}`;
};
