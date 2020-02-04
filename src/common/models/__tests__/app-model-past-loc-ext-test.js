import { AppModel } from '../app_model';

const MAX_SAVED = 30; // use small value to speed up tests

const genLocation = favourite => ({
  latitude: Math.random() * 100,
  longitude: Math.random() * 100,
  name: `${Math.random()}`,
  favourite,
});

async function getAppModel() {
  const appModel = new AppModel();
  await appModel._init;
  return appModel;
}

// eslint-disable-next-line
describe('Past locations extension', function() {
  this.timeout(5000);

  describe('setLocation', () => {
    beforeEach(() => getAppModel().then(appModel => appModel.resetDefaults()));

    it('should set a new location', async () => {
      // Given
      const location = genLocation();
      const appModel = await getAppModel();

      // When
      await appModel.setLocation(location);

      // Then
      expect(appModel.attrs.locations.length).to.be.eql(1);
    });

    it('should remove a location', async () => {
      // Given
      const appModel = await getAppModel();
      const location = genLocation();

      // When
      await appModel.setLocation(location);

      // Then
      const [savedLocation] = appModel.attrs.locations;
      expect(savedLocation).to.be.an('object');
      expect(savedLocation.latitude).to.be.equal(location.latitude);
      expect(savedLocation.id).to.be.a('number');

      await appModel.removeLocation(savedLocation.id);
      expect(appModel.attrs.locations.length).to.be.equal(0);
    });

    it('should not duplicate same location', async () => {
      // Given
      const location = genLocation();
      const appModel = await getAppModel();
      await appModel.setLocation(location);

      // When
      await appModel.setLocation(location);

      // Then
      expect(appModel.attrs.locations.length).to.be.equal(1);
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
      expect(appModel.attrs.locations[0].name).to.be.equal('new');
      expect(appModel.attrs.locations.length).to.be.equal(1);
    });

    it('should not exceed max saved location limits', async () => {
      // Given
      const maxExceedingLocations = [...Array(MAX_SAVED + 1)].map(genLocation);
      const appModel = await getAppModel();

      // When
      await Promise.all(
        maxExceedingLocations.map(location =>
          appModel.setLocation(location, MAX_SAVED)
        )
      );

      // Then
      expect(appModel.attrs.locations.length).to.be.equal(MAX_SAVED);
    });

    it('should not remove favorite locations when exceeded', async () => {
      // Given
      const appModel = await getAppModel();
      const maxExceedingLocations = [...Array(MAX_SAVED)].map(genLocation);
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
      expect(savedFavLocation.id).to.eql(favLocationId);
    });

    it('should not add a location if all current are favorites and exceeding size', async () => {
      // Given
      const appModel = await getAppModel();
      const maxExceedingLocations = [...Array(MAX_SAVED)].map(() =>
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
      expect(origLocationsList).to.eql(newLocationsList);
    });
  });
});
