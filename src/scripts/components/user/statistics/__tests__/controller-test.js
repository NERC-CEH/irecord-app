import API from '../controller';

describe('Activities Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a refreshStats method', () => {
    expect(API.refreshStats).to.be.a('function');
  });
});
