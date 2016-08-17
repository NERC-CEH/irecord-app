import _ from 'lodash';
import { UserModel } from '../user_model';

describe('User statistics extension', () => {
  it('has functions', () => {
    const userModel = new UserModel();
    expect(userModel.resetStats).to.be.a('function');
    expect(userModel.syncStats).to.be.a('function');
    expect(userModel.fetchStatsSpecies).to.be.a('function');
  });

  it('should have attributes', () => {
    const userModel = new UserModel();

    const stats = userModel.get('statistics');
    expect(stats).to.be.an('object');
    expect(stats.records).to.be.a('number');
    expect(stats.species).to.be.an('array');
  });

});