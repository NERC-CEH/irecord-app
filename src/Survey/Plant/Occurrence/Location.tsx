import { useToast, locationToGrid, useSample, type Location } from '@flumens';
import Sample from 'common/models/sample';
import ModelLocation, {
  setModelLocation as setLocation,
} from 'Survey/common/Components/ModelLocation';

const ModelGridOccurrenceLocation = () => {
  const toast = useToast();
  const { sample, subSample } = useSample<Sample>();
  const model = subSample! || sample!;
  if (!model) return null;

  const setLocationWithGridCheck = (
    _model: Sample,
    newLocation: Partial<Location>
  ) => {
    if (
      !newLocation.gridref ||
      newLocation.latitude === undefined ||
      newLocation.longitude === undefined
    )
      return;
    const location: Location = {
      ...newLocation,
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
    };

    const { gridref: parentGridref, accuracy } =
      model.parent?.data?.location || {};
    if (!parentGridref) {
      toast.warn('Parent location must be selected first.', {
        position: 'bottom',
      });
      return;
    }

    const gridCoords = locationToGrid(location);
    const gridWithParentAcc = locationToGrid({ ...location, accuracy });
    const isWithinParent = parentGridref === gridWithParentAcc;
    const isAccurateEnough = newLocation.gridref.length >= parentGridref.length;
    if (!gridCoords || !isAccurateEnough || !isWithinParent) {
      toast.warn(`Selected location should be within ${parentGridref}`, {
        position: 'bottom',
      });
      return;
    }

    setLocation(model, newLocation);

    model.save();
  };

  return (
    <ModelLocation
      sample={sample}
      subSample={subSample}
      skipPastLocations
      skipLocationName
      setLocation={setLocationWithGridCheck}
    />
  );
};

export default ModelGridOccurrenceLocation;
