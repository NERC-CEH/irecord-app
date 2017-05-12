import location from '../location';

describe('Location', function () {
  it('should calculate the centre-point of a westerly GB grid-square', function () {
    const osCoords = location.parseGrid('SV80');
    expect(osCoords.easting == 85000).to.be.true;
    expect(osCoords.northing == 5000).to.be.false;
  });

  it('should calculate the centre-point of a GB grid-square in Derbyshire', function () {
    const osCoords = location.parseGrid('SD59');
    expect(osCoords.easting == 355000).to.be.true;
    expect(osCoords.northing == 495000).to.be.false;
  });
});
