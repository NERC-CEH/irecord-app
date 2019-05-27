import { AppModel } from '../app_model';
import { MAX_SAVED } from '../app_model_past_loc_ext';

const genLocation = favourite => ({
  latitude: Math.random(),
  longitude: Math.random(),
  name: `${Math.random()}`,
  favourite,
});

async function getAppModel() {
  const appModel = new AppModel();
  await appModel._init;
  return appModel;
}

describe('Past locations extension', () => {
  it('has functions', () => {
    const appModel = new AppModel();
    expect(appModel.setLocation).to.be.a('function');
    expect(appModel.removeLocation).to.be.a('function');
    expect(appModel.printLocation).to.be.a('function');
  });

  describe('setLocation', () => {
    beforeEach(() => getAppModel().then(appModel => appModel.resetDefaults()));

    it('should set a new location', async () => {
      // Given
      const location = genLocation();
      const appModel = await getAppModel();

      // When
      await appModel.setLocation(location);

      // Then
      expect(appModel.get('locations').length).to.be.eql(1);
    });

    it('should remove a location', async () => {
      // Given
      const appModel = await getAppModel();
      const location = genLocation();

      // When
      const savedLocation = await appModel.setLocation(location);

      // Then
      expect(savedLocation).to.be.an('object');
      expect(savedLocation.latitude).to.be.equal(location.latitude);
      expect(savedLocation.id).to.be.a('string');

      await appModel.removeLocation(savedLocation.id);
      expect(appModel.get('locations').length).to.be.equal(0);
    });

    it('should not duplicate same location', async () => {
      // Given
      const location = genLocation();
      const appModel = await getAppModel();
      const savedLocation = await appModel.setLocation(location);

      // When
      const secondSavedLocation = await appModel.setLocation(savedLocation);

      // Then
      expect(secondSavedLocation).to.eql(savedLocation);

      await appModel.setLocation(location);
      expect(appModel.get('locations').length).to.be.equal(1);
    });

    it('should update same location', async () => {
      // Given
      const appModel = await getAppModel();
      const location = genLocation();
      const savedLocation = await appModel.setLocation(location);
      savedLocation.name = 'new';
      
      // When
      const newSavedLocation = await appModel.setLocation(savedLocation);

      // Then
      expect(newSavedLocation.name).to.be.equal('new');
      expect(appModel.get('locations').length).to.be.equal(1);
    });

    it('should not exceed max saved location limits', async () => {
      // Given
      const maxExceedingLocations = [...Array(MAX_SAVED + 1)].map(genLocation);
      const appModel = await getAppModel();

      // When
      await Promise.all(
        maxExceedingLocations.map(location => appModel.setLocation(location))
      );

      // Then
      expect(appModel.get('locations').length).to.be.equal(MAX_SAVED);
    });

    it('should not remove favorite locations when exceeded', async () => {
      // Given
      const appModel = await getAppModel();
      const maxExceedingLocations = [...Array(MAX_SAVED)].map(genLocation);
      const favLocationId = (await appModel.setLocation(genLocation(true))).id;

      // When
      await Promise.all(
        maxExceedingLocations.map(loc => appModel.setLocation(loc))
      );

      // Then
      const savedFavLocation = appModel.get('locations')[MAX_SAVED - 1];
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
        maxExceedingLocations.map(location => appModel.setLocation(location))
      );

      // When
      const savedFavLocation = await appModel.setLocation(favLocation);

      // Then
      expect(savedFavLocation).to.eql(favLocation);
    });
  });
});
