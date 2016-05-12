import API from '../controller';

describe('Attr Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a onLockClick method', () => {
    expect(API.onLockClick).to.be.a('function');
  });
});
