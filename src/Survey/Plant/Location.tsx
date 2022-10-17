import { FC } from 'react';
import {
  ModelLocation as ModelLocationOrig,
  useToast,
  checkGridType,
  gridrefAccuracy,
} from '@flumens';
import savedSamples from 'models/savedSamples';
import Sample from 'models/sample';
import appModel from 'models/app';
import config from 'common/config';

/**
 * Updates child sample locations to match the parent (survey) sample.
 * @param sample
 */
function updateChildrenLocations(sample: Sample) {
  sample.samples.forEach((subSample: Sample) => {
    const location = JSON.parse(JSON.stringify(sample.attrs.location));
    delete location.name;
    // eslint-disable-next-line no-param-reassign
    subSample.attrs.location = location;
  });
}

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
    if (newLocation.latitude) {
      let { gridSquareUnit } = sample.metadata;
      if (!checkGridType(newLocation, gridSquareUnit)) {
        // check if the grid unit has been changed and it matches the new unit
        // or this is the first time we are setting a location
        gridSquareUnit = appModel.attrs.gridSquareUnit;
        if (!checkGridType(newLocation, gridSquareUnit)) {
          const prettyName = gridrefAccuracy[gridSquareUnit].label;

          toast.warn(`Selected location should be a ${prettyName}`, {
            position: 'bottom',
          });
          return Promise.resolve();
        }
      }

      // we don't need the GPS running and overwriting the selected location
      if (model.isGPSRunning()) {
        model.stopGPS();
      }

      // extend old location to preserve its previous attributes like name or id
      const oldLocation = model.attrs.location || {};
      // eslint-disable-next-line no-param-reassign
      model.attrs.location = { ...oldLocation, ...newLocation };

      updateChildrenLocations(model);
    }

    if (newLocation.name) {
      Object.assign(model.attrs.location, { name: newLocation.name });
    }

    return model.save();
  };

  return (
    <ModelLocationOrig
      model={model} // eslint-disable-line
      mapProviderOptions={config.map}
      useGridRef
      useGridMap
      suggestLocations={savedSamples.map(getLocation)}
      onLocationNameChange={ModelLocationOrig.utils.onLocationNameChange}
      namePlaceholder="Site name eg nearby village"
      onGPSClick={ModelLocationOrig.utils.onGPSClick}
      backButtonProps={{ text: 'Back' }}
      setLocation={setLocation}
      {...otherProps}
    />
  );
};

export default ModelLocation;
