import API from '../map/main';

describe('Map', () => {
  it('should have getNormalZoom', () => {
    expect(API.getNormalZoom).to.be.a('function');
  });

  it('should return WGS84 zoom', () => {
    // expect(false).to.be.true;
  });

  it('should return WGS84 zoom if OSGB map', () => {
    // expect(false).to.be.true;
  });

  it('should return WGS84 zoom if not within OSGB zoom levels', () => {
    // expect(false).to.be.true;
  });

  it('it should return WGS84 zoom if not in OS Grid Ref', () => {
    // for both OSGB and WGS84 maps
    // expect(false).to.be.true;
  });

});
