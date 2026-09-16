import {
  useToast,
  checkGridType,
  gridrefAccuracy,
  locationToGrid,
  useSample,
  type Location,
} from '@flumens';
import { hasCoordinates } from 'common/helpers/location';
import appModel from 'models/app';
import Sample from 'models/sample';
import ModelLocation, {
  setModelLocation as setLocation,
} from 'Survey/common/Components/ModelLocation';

/**
 * Updates child sample locations to match the parent (survey) sample.
 * @param sample
 */
export function updateChildrenLocations(sample: Sample) {
  sample.samples.forEach(subSample => {
    const location = structuredClone(sample.data.location);
    Object.assign(subSample.data, {
      enteredSrefSystem: sample.data.enteredSrefSystem,
      location: { ...subSample.data.location, ...location },
    });
  });
}

const ModelGridLocation = () => {
  const toast = useToast();

  const { sample, subSample } = useSample<Sample>();

  if (!sample) return null;
  const model = subSample || sample;

  const setLocationWithGridCheck = (
    _: Sample,
    newLocation: Partial<Location>
  ) => {
    if (!hasCoordinates(newLocation)) return;
    const location = newLocation;

    let { gridSquareUnit } = sample.metadata;
    if (!checkGridType(location, gridSquareUnit)) {
      // check if the grid unit has been changed and it matches the new unit
      // or this is the first time we are setting a location
      gridSquareUnit = appModel.data.gridSquareUnit;

      if (location.source === 'map') {
        const accuracy = gridSquareUnit === 'monad' ? 500 : 1000; // tetrad otherwise
        location.gridref = locationToGrid({ ...location, accuracy });
        location.accuracy = accuracy;
      }

      if (!checkGridType(location, gridSquareUnit)) {
        const prettyName = gridrefAccuracy[gridSquareUnit].label;

        toast.warn(`Selected location should be a ${prettyName}`, {
          position: 'bottom',
        });
        return;
      }
    }

    setLocation(model, location);

    updateChildrenLocations(model);

    model.save();
  };

  return (
    <ModelLocation
      sample={sample}
      subSample={subSample}
      skipPastLocations
      setLocation={setLocationWithGridCheck}
    />
  );
};

export default ModelGridLocation;
