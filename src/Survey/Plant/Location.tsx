import {
  useToast,
  checkGridType,
  gridrefAccuracy,
  isValidLocation,
  locationToGrid,
} from '@flumens';
import appModel from 'models/app';
import Sample from 'models/sample';
import ModelLocation, {
  setModelLocation as setLocation,
} from 'Survey/common/Components/ModelLocation';

/**
 * Updates child sample locations to match the parent (survey) sample.
 * @param sample
 */
function updateChildrenLocations(sample: Sample) {
  sample.samples.forEach((subSample: Sample) => {
    const location = JSON.parse(JSON.stringify(sample.attrs.location));
    delete location.name;
    // eslint-disable-next-line no-param-reassign
    Object.assign(subSample.attrs.location, location);
  });
}

type Props = {
  sample: Sample;
  subSample?: Sample;
};

const ModelGridLocation = ({ sample, subSample }: Props) => {
  const toast = useToast();

  const model = subSample || sample;

  const setLocationWithGridCheck = (_: any, newLocation: any) => {
    if (!isValidLocation(newLocation)) return;

    let { gridSquareUnit } = sample.metadata;
    if (!checkGridType(newLocation, gridSquareUnit)) {
      // check if the grid unit has been changed and it matches the new unit
      // or this is the first time we are setting a location
      gridSquareUnit = appModel.attrs.gridSquareUnit;

      const isFromMap = newLocation.source === 'map';
      if (isFromMap) {
        const accuracy = gridSquareUnit === 'monad' ? 500 : 1000; // tetrad otherwise
        const gridref = locationToGrid({ ...newLocation, accuracy });
        newLocation.gridref = gridref; // eslint-disable-line no-param-reassign
        newLocation.accuracy = accuracy; // eslint-disable-line no-param-reassign
      }

      if (!checkGridType(newLocation, gridSquareUnit)) {
        const prettyName = gridrefAccuracy[gridSquareUnit].label;

        toast.warn(`Selected location should be a ${prettyName}`, {
          position: 'bottom',
        });
        return;
      }
    }

    setLocation(model, newLocation);

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
