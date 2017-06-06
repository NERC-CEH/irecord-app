import location from '../location';

describe('Location', () => {
  it('should calculate the centre-point of a westerly GB grid-square', () => {
    const osCoords = location.parseGrid('SV80');
    expect(osCoords.x == 85000).to.be.true;
    expect(osCoords.y == 5000).to.be.true;
  });

  it('should calculate the centre-point of a GB grid-square in Derbyshire', () => {
    const osCoords = location.parseGrid('SD59');
    expect(osCoords.x == 355000).to.be.true;
    expect(osCoords.y == 495000).to.be.true;
  });

  it('should be mindful of location accuracy', () => {
    let gridRef = location.locationToGrid({
      latitude: 52.24394,
      longitude: -3,
      accuracy: 1,
    });

    expect(gridRef).to.equal('SO31816111');
    gridRef = location.locationToGrid({
      latitude: 52.24394,
      longitude: -3,
      accuracy: 5,
    });
    expect(gridRef).to.equal('SO318611');
  });
});
