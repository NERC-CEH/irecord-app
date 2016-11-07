import API from '../controller';

describe('Location Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
});
