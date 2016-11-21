import API from '../controller';

describe('Menu Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
});
