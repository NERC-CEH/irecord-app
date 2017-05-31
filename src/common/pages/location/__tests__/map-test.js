import API from '../map/main';

const OS_ZOOM_DIFF = 6;

describe('Map', () => {
  beforeEach(() => {
    API.map = {};
  });

  it('should have getMapZoom', () => {
    expect(API.getMapZoom).to.be.a('function');
  });

  it('should return WGS84 zoom', () => {
    const zoom = 5;
    API.map.getZoom = () => zoom; // spy

    const normalized = API.getMapZoom();
    expect(normalized).to.be.equal(zoom);
  });

  it('should return WGS84 zoom if OSGB map', () => {
    const zoom = 7;
    API.map.getZoom = () => zoom; // spy
    API.currentLayer = 'OS';

    const normalized = API.getMapZoom();
    expect(normalized).to.be.equal(zoom + OS_ZOOM_DIFF);
  });

  // it('should return WGS84 zoom if not within OSGB zoom levels', () => {
  //   expect(false).to.be.true;
  // });
  //
  // it('it should return WGS84 zoom if not in OS Grid Ref', () => {
  //   // for both OSGB and WGS84 maps
  //   expect(false).to.be.true;
  // });

});
