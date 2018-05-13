import Indicia from 'indicia';
import { UserModel } from '../user_model';
import ext from '../user_model_statistics_ext';

const { _fetchStatsSpecies, resetStats, syncStats } = ext;

describe('User statistics extension', () => {
  it('has functions', () => {
    expect(resetStats).to.be.a('function');
    expect(syncStats).to.be.a('function');
    expect(_fetchStatsSpecies).to.be.a('function');
  });

  it('should have attributes', () => {
    const userModel = new UserModel();

    const stats = userModel.get('statistics');
    expect(stats).to.be.an('object');
    expect(stats.species).to.be.an('array');
  });

  describe('_fetchStatsSpecies', () => {
    let reportRunStub;
    beforeEach(() => {
      reportRunStub = sinon.stub(Indicia.Report.prototype, 'run');
    });
    afterEach(() => {
      reportRunStub.restore();
    });

    it('should return err if no statistics data array received', done => {
      const user = new UserModel();
      reportRunStub.resolves({});
      user._fetchStatsSpecies().catch(e => {
        expect(e.message).to.eql('Error while retrieving stats response.');
        done();
      });
    });

    it('should not return err if data is an object with count=0', done => {
      const user = new UserModel();
      reportRunStub.resolves({ data: { count: 0 } });
      user
        ._fetchStatsSpecies()
        .then(() => done())
        .catch(done);
    });
  });
});
