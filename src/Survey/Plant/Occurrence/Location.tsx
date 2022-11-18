import { FC } from 'react';
import {
  ModelLocation as ModelLocationOrig,
  useToast,
  locationToGrid,
} from '@flumens';
import { isPlatform } from '@ionic/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import savedSamples from 'models/savedSamples';
import Sample from 'models/sample';
import config from 'common/config';

const getLocation = (sample: Sample) => sample.attrs.location || {};

type Props = {
  sample: Sample;
  subSample?: Sample;
  onLocationNameChange?: any;
};

const ModelLocation: FC<Props> = ({ sample, subSample, ...otherProps }) => {
  const toast = useToast();
  const model = subSample || sample;

  const setLocation = async (newLocation: any) => {
    const { gridref: parentGridref, accuracy } =
      model.parent?.attrs?.location || {};
    if (!parentGridref)
      return toast.warn(`Parent location must be selected first.`, {
        position: 'bottom',
      });

    const gridCoords = locationToGrid(newLocation);
    const gridWithParentAcc = locationToGrid({ ...newLocation, accuracy });
    const isWithinParent = parentGridref === gridWithParentAcc;
    const isAccurateEnough = newLocation.gridref.length >= parentGridref.length;
    if (!gridCoords || !isAccurateEnough || !isWithinParent)
      return toast.warn(`Selected location should be within ${parentGridref}`, {
        position: 'bottom',
      });

    // we don't need the GPS running and overwriting the selected location
    if (model.isGPSRunning()) {
      model.stopGPS();
    }

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    const oldLocation = sample.attrs.location || {};
    model.attrs.location = { ...oldLocation, ...newLocation };

    return model.save();
  };

  async function onGPSClick() {
    try {
      await ModelLocationOrig.utils.onGPSClick(model);
    } catch (error: any) {
      toast.error(error);
    }
  }

  return (
    <ModelLocationOrig
      model={model} // eslint-disable-line
      mapProviderOptions={config.map}
      useGridRef
      useGridMap
      suggestLocations={savedSamples.map(getLocation)}
      namePlaceholder="Site name eg nearby village"
      onGPSClick={onGPSClick}
      backButtonProps={{ text: 'Back' }}
      setLocation={setLocation}
      {...otherProps}
    />
  );
};

export default ModelLocation;
