import API from '../controller';

describe('Show Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
});
