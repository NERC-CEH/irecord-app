import savedSamples from 'saved_samples';
import userModel from 'user_model';
import Sample from 'sample';
import CONFIG from 'config';
import API from '../controller';

/* eslint-disable no-unused-expressions */

const PLANT_SURVEY_ID = CONFIG.indicia.surveys.plant.survey_id;
const PLANT_SURVEY_INPUT_FORM = CONFIG.indicia.surveys.plant.input_form;
describe('Surveys List Controller', () => {
  let server;
  let userLogin;

  before((done) => {
    server = sinon.fakeServer.create();
    server.respondImmediately = true;
    userLogin = sinon.stub(userModel, 'hasLogIn').returns(true);

    // clean up in case of trash
    savedSamples.fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  beforeEach((done) => {
    // clean up in case of trash
    savedSamples.fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  after((done) => {
    userLogin.reset();

    // clean up afterwards
    savedSamples.fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  afterEach((done) => {
    // clean up afterwards
    savedSamples.fetch()
      .then(() => savedSamples.destroy())
      .then(() => done());
  });

  it('should have configs', () => {
    expect(PLANT_SURVEY_ID).to.be.a('number');
    expect(PLANT_SURVEY_INPUT_FORM).to.not.be.empty;
  });

  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should add new survey', (done) => {
    expect(API.addSurveySample).to.be.a('function');

    API.addSurveySample()
      .then((sample) => {
        expect(sample).to.be.instanceOf(Sample);

        expect(savedSamples.length).to.be.equal(1);
        const savedSurveySample = savedSamples.at(0);
        expect(savedSurveySample).to.be.an('object')
          .and.to.be.instanceOf(Sample);

        expect(savedSurveySample.metadata.survey)
          .to.be.equal('plant');
        expect(savedSurveySample.metadata.complex_survey)
          .to.be.equal(true);

        done();
      })
      .catch(err => done(err));
  });
});
