import API from '../controller';

describe('Survey Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
});
