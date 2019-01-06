import Indicia from 'indicia';
import { UserModel } from '../user_model';
import ext from '../user_model_statistics_ext';

const { _fetchStatsSpecies, syncStats } = ext;

describe('User statistics extension', () => {
  it('has functions', () => {
    expect(syncStats).to.be.a('function');
    expect(_fetchStatsSpecies).to.be.a('function');
  });

  it('should have attributes', () => {
    const userModel = new UserModel();

    const stats = userModel.get('statistics');
    expect(stats).to.be.an('object');
    expect(stats.species instanceof Array).to.be.true;
  });

  describe('_fetchStatsSpecies', () => {
    let reportRunStub;
    beforeEach(() => {
      reportRunStub = sinon.stub(Indicia.Report.prototype, 'run');
    });
    afterEach(() => {
      reportRunStub.restore();
    });

    it('should return statistics', done => {
      const stub = [1, 2, 3];
      const user = new UserModel();
      reportRunStub.resolves({ data: { records: stub } });
      user
        ._fetchStatsSpecies()
        .then(stats => {
          expect(stats).to.eql(stub);
          done();
        })
        .catch(done);
    });

    it('should return statistics when report is badly formatted', done => {
      const stub = [1, 2, 3];
      const user = new UserModel();
      reportRunStub.resolves({ data: stub });
      user
        ._fetchStatsSpecies()
        .then(stats => {
          expect(stats).to.eql(stub);
          done();
        })
        .catch(done);
    });

    it('should return err if no statistics array received', done => {
      const user = new UserModel();
      reportRunStub.resolves({ data: {} });
      user._fetchStatsSpecies().catch(e => {
        expect(e.message).to.eql('Error while retrieving stats response.');
        done();
      });
    });
  });
});
