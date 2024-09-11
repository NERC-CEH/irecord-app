import { useToast, locationToGrid } from '@flumens';
import Sample from 'models/sample';
import ModelLocation, {
  setModelLocation as setLocation,
} from 'Survey/common/Components/ModelLocation';

type Props = {
  sample: Sample;
  subSample?: Sample;
};

const ModelGridOccurrenceLocation = ({ sample, subSample }: Props) => {
  const toast = useToast();
  const model = subSample || sample;

  const setLocationWithGridCheck = (_: any, newLocation: any) => {
    const { gridref: parentGridref, accuracy } =
      model.parent?.attrs?.location || {};
    if (!parentGridref) {
      toast.warn(`Parent location must be selected first.`, {
        position: 'bottom',
      });
      return;
    }

    const gridCoords = locationToGrid(newLocation);
    const gridWithParentAcc = locationToGrid({ ...newLocation, accuracy });
    const isWithinParent = parentGridref === gridWithParentAcc;
    const isAccurateEnough =
      newLocation?.gridref?.length >= parentGridref.length;
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
