import API from '../controller';

describe('Edit Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a saveRecord method', () => {
    expect(API.saveRecord).to.be.a('function');
  });

  it('should have a photoUpload method', () => {
    expect(API.photoUpload).to.be.a('function');
  });

  it('should have a photoDelete method', () => {
    expect(API.photoDelete).to.be.a('function');
  });

  it('should have a photoSelect method', () => {
    expect(API.photoSelect).to.be.a('function');
  });
});
