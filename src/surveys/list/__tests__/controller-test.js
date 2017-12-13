import savedSamples from 'saved_samples';
import userModel from 'user_model';
import Sample from 'sample';
import complexSurveyConfig from 'common/config/surveys/complex';
import API from '../controller';

/* eslint-disable no-unused-expressions */

describe('Surveys List Controller', () => {
  let server;
  let userLogin;

  before(done => {
    server = sinon.fakeServer.create();
    server.respondImmediately = true;
    userLogin = sinon.stub(userModel, 'hasLogIn').returns(true);

    // clean up in case of trash
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  beforeEach(done => {
    // clean up in case of trash
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  after(done => {
    userLogin.reset();

    // clean up afterwards
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  afterEach(done => {
    // clean up afterwards
    savedSamples
      .fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  it('should have configs', () => {
    expect(complexSurveyConfig.default.id).to.be.a('number');
    expect(complexSurveyConfig.default.webForm).to.not.be.empty;
  });

  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should add new survey', done => {
    expect(API.addSurveySample).to.be.a('function');

    API.addSurveySample()
      .then(sample => {
        expect(sample).to.be.instanceOf(Sample);

        expect(savedSamples.length).to.be.equal(1);
        const savedSurveySample = savedSamples.at(0);
        expect(savedSurveySample)
          .to.be.an('object')
          .and.to.be.instanceOf(Sample);

        expect(savedSurveySample.metadata.complex_survey).to.be.equal(true);

        done();
      })
      .catch(err => done(err));
  });
});
