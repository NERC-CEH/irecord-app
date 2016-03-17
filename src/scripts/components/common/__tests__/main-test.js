import userModel from '../user_model';
import Backbone from 'backbone';

describe('User Model', function () {
  it('should be a Backbone model', function () {
    expect(userModel instanceof Backbone.Model).to.be.true;
  });
});
