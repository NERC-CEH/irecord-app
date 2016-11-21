import API from '../controller';

describe('Activities Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a save method', () => {
    expect(API.save).to.be.a('function');
  });

  it('should have a refreshActivities method', () => {
    expect(API.refreshActivities).to.be.a('function');
  });
});
