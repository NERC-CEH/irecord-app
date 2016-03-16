import userModel from '../user_model';

describe('User Model', function () {
  it('should be a Backbone model', function () {
    expect(userModel).to.be.a('Backbone.Model');
  });
});
