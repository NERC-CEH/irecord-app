import Backbone from 'backbone';
import API from '../controller';
import appModel from '../../../models/app_model';
import userModel from '../../../models/user_model';

describe('Activities Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a save method', () => {
    expect(API.save).to.be.a('function');
  });

  it('should have a refreshActivities method', () => {
    expect(API.refreshActivities).to.be.a('function');
  });
});
