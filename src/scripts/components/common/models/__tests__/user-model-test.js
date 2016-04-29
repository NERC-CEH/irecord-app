import _ from 'lodash';
import {default as userModel, UserModel} from '../user_model';

describe('User Model', () => {

  before(() => {
    const userModel = new UserModel();
    userModel.clear();
    userModel.save();
  });

  it('has default values', () => {
    const userModel = new UserModel();
    expect(_.keys(userModel.attributes).length).to.be.equal(4);
    expect(userModel.get('name')).to.be.equal('');
    expect(userModel.get('surname')).to.be.equal('');
    expect(userModel.get('email')).to.be.equal('');
    expect(userModel.get('secret')).to.be.equal('');
  });
});
