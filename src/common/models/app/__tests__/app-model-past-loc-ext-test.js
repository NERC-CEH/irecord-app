import { AppModel } from '../index';

const MAX_SAVED = 30; // use small value to speed up tests

const genLocation = favourite => ({
  latitude: Math.random() * 100,
  longitude: Math.random() * 100,
  name: `${Math.random()}`,
  favourite,
});

async function getAppModel() {
  const genericStoreMock = { find: async () => null, save: async () => null };
  const appModel = new AppModel({ cid: 'app', store: genericStoreMock });
  appModel.fetch();
  await appModel.ready;
  return appModel;
}

// eslint-disable-next-line
describe('Past locations extension', function () {
  describe('setLocation', () => {
    it('should set a new location', async () => {
      // Given
      const location = genLocation();
      const appModel = await getAppModel();

      // When
      await appModel.setLocation(location);

      // Then
      expect(appModel.attrs.locations.length).toEqual(1);
    });

    it('should remove a location', async () => {
      // Given
      const appModel = await getAppModel();
      const location = genLocation();

      // When
      await appModel.setLocation(location);

      // Then
      const [savedLocation] = appModel.attrs.locations;
      expect(savedLocation).toBeInstanceOf(Object);
      expect(savedLocation.latitude).toBe(location.latitude);
      expect(typeof savedLocation.id).toBe('number');

      await appModel.removeLocation(savedLocation.id);
      expect(appModel.attrs.locations.length).toBe(0);
    });

    it('should not duplicate same location', async () => {
      // Given
      const location = genLocation();
      const appModel = await getAppModel();
      await appModel.setLocation(location);

      // When
      await appModel.setLocation(location);

      // Then
      expect(appModel.attrs.locations.length).toBe(1);
    });

    it('should update same location', async () => {
      // Given
      const appModel = await getAppModel();
      const location = genLocation();
      await appModel.setLocation(location);
      const savedLocation = { ...location, ...{ name: 'new' } };

      // When
      await appModel.setLocation(savedLocation);

      // Then
      expect(appModel.attrs.locations[0].name).toBe('new');
      expect(appModel.attrs.locations.length).toBe(1);
    });

    it('should not exceed max saved location limits', async () => {
      // Given
      const maxExceedingLocations = Array.from(
        { length: MAX_SAVED + 1 },
        genLocation
      );

      const appModel = await getAppModel();

      // When
      await Promise.all(
        maxExceedingLocations.map(location =>
          appModel.setLocation(location, MAX_SAVED)
        )
      );

      // Then
      expect(appModel.attrs.locations.length).toBe(MAX_SAVED);
    });

    it('should not remove favourite locations when exceeded', async () => {
      // Given
      const appModel = await getAppModel();
      const maxExceedingLocations = Array.from(
        { length: MAX_SAVED },
        genLocation
      );
      await appModel.setLocation(genLocation(true));
      const favLocationId = appModel.attrs.locations[0].id;

      // When
      // eslint-disable-next-line
      for (const loc of maxExceedingLocations) {
        // eslint-disable-next-line
        await appModel.setLocation(loc, MAX_SAVED);
      }

      // Then
      const savedFavLocation = appModel.attrs.locations[MAX_SAVED - 1];
      expect(savedFavLocation.id).toEqual(favLocationId);
    });

    it('should not add a location if all current are favourites and exceeding size', async () => {
      // Given
      const appModel = await getAppModel();
      const maxExceedingLocations = Array.from({ length: MAX_SAVED }, () =>
        genLocation(true)
      );

      const favLocation = { ...genLocation(), ...{ favourite: true } };
      await Promise.all(
        maxExceedingLocations.map(location =>
          appModel.setLocation(location, MAX_SAVED)
        )
      );
      const origLocationsList = JSON.stringify(appModel.attrs.locations);

      // When
      await appModel.setLocation(favLocation, MAX_SAVED);

      // Then
      const newLocationsList = JSON.stringify(appModel.attrs.locations);
      expect(origLocationsList).toEqual(newLocationsList);
    });
  });
});
