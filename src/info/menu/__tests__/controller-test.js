import API from '../controller';

describe('Info Menu Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
});
