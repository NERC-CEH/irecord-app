import validate from '../validate';

describe('Validate', function () {
  it('should detect correct email', function () {
    expect(validate.email('test@test.com')).to.be.true;
    expect(validate.email('testtest.com')).to.be.false;
    expect(validate.email('test@test')).to.be.false;
  });
});
