import API from '../controller';

describe('Activities Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a save method', () => {
    expect(API.save).to.be.a('function');
  });

  it('should have a updateActivitiesCollection method', () => {
    expect(API.updateActivitiesCollection).to.be.a('function');
  });
});
