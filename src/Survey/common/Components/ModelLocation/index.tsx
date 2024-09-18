/* eslint-disable no-restricted-syntax */
import { useState } from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
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
  Location,
  RadioOption,
} from '@flumens';
import { isPlatform } from '@ionic/core';
import { useIonViewWillLeave } from '@ionic/react';
import config from 'common/config';
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
  newLocation: Location
) => {
  if (model.isGPSRunning()) model.stopGPS(); // we don't need the GPS running and overwriting the selected location

  const isFromMap = newLocation?.source === 'map';
  isPlatform('hybrid') &&
    isFromMap &&
    Haptics.impact({ style: ImpactStyle.Light });

  Object.assign(
    model.attrs.location, // carry over name, geocoded etc
    getEmptyLocation(), // overwrite core location values
    newLocation
  );

  model.save();

  if (!isValidLocation(newLocation)) return;
  appModel.setLocation(model.attrs.location);
};

type Styles = 'satellite' | 'os' | 'os_explorer';
export const useMapStyles = (): [Styles, any, RadioOption[]] => {
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
  subSample?: any;
  sample: any;
  setLocation?: any;
  skipLocationName?: boolean;
  skipPastLocations?: boolean;
};

const ModelLocationMap = ({
  subSample,
  sample,
  setLocation = setModelLocation,
  skipLocationName,
  skipPastLocations,
}: Props) => {
  const model = subSample || sample;
  const isDisabled = model.isDisabled();
  const location = model.attrs.location || {};
  const parentLocation = model.parent?.attrs.location;

  const onManuallyTypedLocationChange = (e: any) => {
    const value = e?.target?.value;
    if (!value) {
      setLocation(model, {});
      return;
    }

    const newLocation = textToLocation(value);
    if (!isValidLocation(newLocation)) return;

    setLocation(model, newLocation);
  };

  const onLocationNameChange = ({ name, geocoded }: any) => {
    model.attrs.location = { ...model.attrs.location, name, geocoded };
  };

  const [showSettings, setShowSettings] = useState(false);
  const onCloseSettings = () => setShowSettings(false);
  const onLayersClick = () => setShowSettings(!showSettings);

  const [currentStyle, setCurrentStyle, styles] = useMapStyles();
  const onStyleChange = (newLayer: string) => {
    setCurrentStyle(newLayer);
    setShowSettings(false);
  };

  const onMapClick = (e: any) => setLocation(model, mapEventToLocation(e));

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

  const getSampleLocation = (smp: Sample) => smp.attrs.location;
  const childLocations =
    model?.samples?.map(getSampleLocation).filter(isValidLocation) || [];

  return (
    <Page id="model-location">
      <MapHeader>
        <MapHeader.Location
          location={location}
          onChange={onManuallyTypedLocationChange}
          backButtonProps={{ text: t('Back') }}
          useGridRef
        />
        {!skipLocationName && (
          <MapHeader.LocationName
            onChange={onLocationNameChange}
            value={location.name}
            icon={locationNameIcon}
            placeholder="Site name eg nearby village"
            suggestions={appModel.attrs.locations || []}
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
            location={location}
            parentLocation={parentLocation}
            childLocations={childLocations}
            isDisabled={isDisabled}
            onMapClick={onMapClick}
            onGPSClick={onGPSClick}
            currentStyle={currentStyle}
            onLayersClick={onLayersClick}
            onPastLocationsClick={!skipPastLocations && onPastLocationsClick}
            isLocating={model.gps.locating}
          />
        )}

        {!isMapboxMap && (
          <LeafletMap
            model={model}
            location={location}
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

(ModelLocationMap as any).WithoutName = (props: Props) => (
  <ModelLocationMap {...props} skipLocationName />
);

export default observer(ModelLocationMap);
