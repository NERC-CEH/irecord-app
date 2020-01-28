import GridRefUtils from 'bigu';
import LocHelp from 'helpers/location';
import StringHelp from 'helpers/string';
import Log from 'helpers/log';

const LATLONG_REGEX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/g; // eslint-disable-line

export function onManualGridrefChange(e) {
  Log('Location:Controller: executing onManualGridrefChange.');
  const { sample } = this.state;
  const gridref = e.target.value.replace(/\s+/g, '').toUpperCase();

  // const location = this._getCurrentLocation();
  // const latlong = `${location.latitude}, ${location.longitude}`;
  // if (value === location.gridref || value === latlong) {
  //   return; // gridref hasn't changed meaningfully
  // }

  const empty = gridref === '';
  const validGridRef = LocHelp.isValidGridRef(gridref);
  const validLatLong = gridref.match(LATLONG_REGEX);
  if (!empty && !validGridRef && !validLatLong) {
    // TODO: INVALIDATE GR
    return;
  }
  // TODO: VALIDATE GR

  const normalizedGridref = gridref.replace(/\s/g, '').toUpperCase();

  if (gridref !== '') {
    const location = {};
    // check if it is in GB land and not in the sea
    if (LocHelp.isValidGridRef(normalizedGridref)) {
      // GB Grid Reference
      const parsedGridRef = GridRefUtils.GridRefParser.factory(
        normalizedGridref
      );

      location.source = 'gridref';
      location.gridref = parsedGridRef.preciseGridRef;
      location.accuracy = parsedGridRef.length / 2; // radius rather than square dimension

      const latLng = parsedGridRef.osRef.to_latLng();

      location.latitude = latLng.lat;
      location.longitude = latLng.lng;

      this.setLocation(location);
    } else if (gridref.match(LATLONG_REGEX)) {
      // Lat Long
      location.source = 'gridref';
      location.accuracy = 1;
      const latitude = parseFloat(gridref.split(',')[0]);
      location.latitude = parseFloat(latitude);
      const longitude = parseFloat(gridref.split(',')[1]);
      location.longitude = parseFloat(longitude);

      this.setLocation(location);
    } else {
      // invalid
      // App.trigger('gridref:form:data:invalid', { gridref: 'invalid' });
    }
  } else {
    const location = sample.attrs.location || {};
    delete location.source;
    location.gridref = '';
    location.latitude = null;
    location.longitude = null;
    location.accuracy = null;

    this.setLocation(location);
  }
}

export function onLocationNameChange(e) {
  const locationName = e.target.value;

  const { sample } = this.state;

  if (!locationName || typeof locationName !== 'string') {
    return;
  }

  const escapedName = StringHelp.escape(locationName);
  const location = sample.attrs.location || {};
  location.name = escapedName;

  // TODO:
  // // check if we need custom location setting functionality
  // if (locationSetFunc) {
  //   locationSetFunc(sample, location);
  //   return;
  // }

  sample.attrs.location = location;
  sample.save();
}

export function onGPSClick() {
  const { sample } = this.state;
  // turn off if running
  if (sample.isGPSRunning()) {
    sample.stopGPS();
  } else {
    sample.startGPS();
  }
}
