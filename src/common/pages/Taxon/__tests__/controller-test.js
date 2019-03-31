import API from '../controller';

describe('Taxon Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
});
