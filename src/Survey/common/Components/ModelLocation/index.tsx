import { useState, type Dispatch, type SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import type { MapMouseEvent } from 'react-map-gl/mapbox';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  MapHeader,
  MapSettingsPanel,
  Page,
  Main,
  RadioInput,
  textToLocation,
  mapEventToLocation,
  toggleGPS,
  isValidLocation,
  useToast,
  type Location,
  type RadioOption,
  useSample,
} from '@flumens';
import { isPlatform } from '@ionic/core';
import { useIonViewWillLeave, type InputCustomEvent } from '@ionic/react';
import config from 'common/config';
import { getGridRefSystem, hasCoordinates } from 'common/helpers/location';
import locationNameIcon from 'common/images/location-name.svg';
import appModel from 'models/app';
import Sample, { getEmptyLocation } from 'models/sample';
import { hasGPSPermissions } from 'helpers/GPS';
import LeafletMap from './LeafletMap';
import osMapIcon from './LeafletMap/osMapIcon.png';
import MapboxMap from './MapboxMap';
import satelliteMapIcon from './MapboxMap/satelliteMapIcon.png';
import standardMapIcon from './MapboxMap/standardMapIcon.png';
import PastLocationsPanel from './PastLocations';
import './styles.scss';

export const setModelLocation = async (
  model: Sample,
  newLocation: Partial<Location>
) => {
  if (model.isGPSRunning()) model.stopGPS(); // we don't need the GPS running and overwriting the selected location

  const isFromMap = newLocation?.source === 'map';
  isPlatform('hybrid') &&
    isFromMap &&
    Haptics.impact({ style: ImpactStyle.Light });

  if (!model.data.location) Object.assign(model.data, { location: {} });
  const location = model.data.location!;

  Object.assign(
    location,
    getEmptyLocation(), // overwrite core location values
    newLocation
  );

  const usesGridRefSystem =
    model.data.enteredSrefSystem === 'OSGB' ||
    model.data.enteredSrefSystem === 'OSIE';

  if (usesGridRefSystem) {
    Object.assign(model.data, {
      enteredSrefSystem: getGridRefSystem(newLocation.gridref),
    });
  }

  model.save();

  if (!hasCoordinates(newLocation)) return;
  appModel.setLocation({
    ...(model.data.location as Location),
    name: model.data.locationName,
  });
};

type Styles = 'satellite' | 'os' | 'os_explorer';
export const useMapStyles = (): [
  Styles,
  Dispatch<SetStateAction<Styles>>,
  RadioOption[],
] => {
  const layers: RadioOption[] = [
    {
      value: 'Map Type',
      isPlaceholder: true,
    },
    {
      label: 'Satellite',
      value: 'satellite',
      prefix: <img src={satelliteMapIcon} className="-m-3 size-10" />,
    },
    {
      label: 'Ordnance Survey',
      value: 'os',
      prefix: <img src={standardMapIcon} className="-m-3 size-10" />,
    },
    {
      label: 'Ordnance Survey (Explorer)',
      value: 'os_explorer',
      prefix: <img src={osMapIcon} className="-m-3 size-10" />,
    },
  ];

  const [currentLayer, setCurrentLayer] = useState<Styles>('satellite');

  return [currentLayer, setCurrentLayer, layers];
};

type Props = {
  sample?: Sample;
  subSample?: Sample;
  setLocation?: (model: Sample, location: Partial<Location>) => void;
  skipLocationName?: boolean;
  skipPastLocations?: boolean;
};

const ModelLocationMap = ({
  sample: sampleProp,
  subSample: subSampleProp,
  setLocation = setModelLocation,
  skipLocationName,
  skipPastLocations,
}: Props) => {
  const { sample, subSample } = useSample<Sample>({
    sample: sampleProp,
    subSample: subSampleProp,
  });

  const model = subSample! || sample!;

  const location = model.data.location || {};
  const mapLocation = { ...location, geocoded: model.metadata.geocoded };
  const parentLocation = model.parent?.data.location;

  const onManuallyTypedLocationChange = (event: InputCustomEvent) => {
    const value = String(event.detail.value || '');
    if (!value) {
      setLocation(model, {});
      return;
    }

    const newLocation = textToLocation(value);
    if (!isValidLocation(newLocation)) return;

    setLocation(model, newLocation as Location);
  };

  const onLocationNameChange = ({
    name,
    geocoded: newGeocoded,
  }: {
    name: string;
    geocoded?: { center: [number, number] };
  }) => {
    model.metadata.geocoded = newGeocoded;
    model.data.locationName = name;
    model.save();
  };

  const [showSettings, setShowSettings] = useState(false);
  const onCloseSettings = () => setShowSettings(false);
  const onLayersClick = () => setShowSettings(!showSettings);

  const [currentStyle, setCurrentStyle, styles] = useMapStyles();
  const onStyleChange = (newLayer: string) => {
    if (
      newLayer !== 'satellite' &&
      newLayer !== 'os' &&
      newLayer !== 'os_explorer'
    )
      return;

    setCurrentStyle(newLayer);
    setShowSettings(false);
  };

  const onMapClick = (event: MapMouseEvent) =>
    setLocation(model, mapEventToLocation(event));

  const toast = useToast();
  const onGPSClick = async () => {
    const hasPermissions = await hasGPSPermissions();
    if (!hasPermissions) {
      toast.warn('Location services are not enabled');
      return;
    }

    toggleGPS(model);
  };

  const [showPastLocations, setShowPastLocations] = useState(false);
  const onPastLocationsClick = () => setShowPastLocations(!showPastLocations);

  const fixOpenPastLocationsOnPageLeave = () => setShowPastLocations(false);
  useIonViewWillLeave(fixOpenPastLocationsOnPageLeave);

  const fixOpenSettingsOnPageLeave = () => setShowSettings(false);
  useIonViewWillLeave(fixOpenSettingsOnPageLeave);

  const isMapboxMap = currentStyle !== 'os_explorer';

  const childLocations = model.samples
    .map(child => child.data.location)
    .filter((childLocation): childLocation is Location =>
      hasCoordinates(childLocation)
    );

  return (
    <Page id="model-location">
      <MapHeader>
        <MapHeader.Location
          location={location as Location}
          onChange={onManuallyTypedLocationChange}
          backButtonProps={{ text: t('Back') }}
          useGridRef
        />
        {!skipLocationName && (
          <MapHeader.LocationName
            onChange={onLocationNameChange}
            value={model.data.locationName}
            icon={locationNameIcon}
            placeholder="Site name eg nearby village"
            suggestions={appModel.data.locations || []}
            geocodingParams={{
              access_token: config.map.mapboxApiKey,
              types: 'locality,place,district,neighborhood,region,postcode',
              country: 'GB',
            }}
          />
        )}
      </MapHeader>

      <Main>
        {isMapboxMap && (
          <MapboxMap
            location={mapLocation}
            parentLocation={parentLocation}
            childLocations={childLocations}
            isDisabled={model.isDisabled}
            onMapClick={onMapClick}
            onGPSClick={onGPSClick}
            currentStyle={currentStyle}
            onLayersClick={onLayersClick}
            onPastLocationsClick={!skipPastLocations && onPastLocationsClick}
            isLocating={model.isGPSRunning()}
          />
        )}

        {!isMapboxMap && (
          <LeafletMap
            model={model}
            location={mapLocation}
            childLocations={childLocations}
            setLocation={setLocation}
            onGPSClick={onGPSClick}
            onLayersClick={onLayersClick}
            onPastLocationsClick={!skipPastLocations && onPastLocationsClick}
          />
        )}

        <MapSettingsPanel isOpen={showSettings} onClose={onCloseSettings}>
          <RadioInput
            options={styles}
            onChange={onStyleChange}
            value={currentStyle}
            className="no-padding"
          />
        </MapSettingsPanel>

        <PastLocationsPanel
          isOpen={showPastLocations}
          model={model}
          onClose={() => setShowPastLocations(false)}
        />
      </Main>
    </Page>
  );
};

ModelLocationMap.WithoutName = (props: Props) => (
  <ModelLocationMap {...props} skipLocationName />
);

export default observer(ModelLocationMap);
