import Sample from 'sample';
import Occurrence from 'occurrence';
import Image from 'common/models/image';
import ImageHelp from 'helpers/image';
import Factory from '../model_factory';

describe('Model Factory', () => {
  describe('createSample', () => {
    let _getPlantSampleStub;
    let _getGeneralSampleStub;
    beforeEach(() => {
      _getPlantSampleStub = sinon.stub(Factory, '_getPlantSample').resolves();
      _getGeneralSampleStub = sinon
        .stub(Factory, '_getGeneralSample')
        .resolves();
    });

    afterEach(() => {
      _getPlantSampleStub.restore();
      _getGeneralSampleStub.restore();
    });

    it('should reject if no survey provided', done => {
      Factory.createSample()
        .catch(err => {
          expect(err.message).to.eql('Survey options are missing.');
          done();
        })
        .catch(done);
    });
    it('should return _getPlantSample if survey is plant', done => {
      Factory.createSample('plant')
        .then(() => {
          expect(_getPlantSampleStub.calledOnce).to.eql(true);
          done();
        })
        .catch(done);
    });
    it('should return _getGeneralSample if survey is general', done => {
      Factory.createSample('general')
        .then(() => {
          expect(_getGeneralSampleStub.calledOnce).to.eql(true);
          done();
        })
        .catch(done);
    });
  });
  describe('_getGeneralSample', () => {
    let sampleSetTaxonSpy;
    before(() => {
      sampleSetTaxonSpy = sinon.spy(Sample.prototype, 'setTaxon');
    });
    after(() => {
      sampleSetTaxonSpy.restore();
    });
    it('should return a promise', () => {
      expect(Factory._getGeneralSample()).to.be.instanceOf(Promise);
    });

    it('should call sample.setTaxon', () => {
      Factory._getGeneralSample(null, { group: 1 });
      expect(sampleSetTaxonSpy.called).to.be.equal(true);
    });
    it('should add image if passed', done => {
      const image = new Image();
      Factory._getGeneralSample(image, { group: 1 })
        .then(sample => {
          expect(sample.getOccurrence().getMedia()).to.eql(image);
          done();
        })
        .catch(done);
    });
  });
  describe('appendAttrLocks', () => {
    it('should exist', () => {
      expect(Factory._appendAttrLocks).to.be.a('function');
    });

    it('should append locks', () => {
      const sample = new Sample();
      sample.addOccurrence(new Occurrence());

      const comment = 'my comment';
      Factory._appendAttrLocks(sample, {
        'smp:comment': comment,
        'occ:comment': comment,
      });
      expect(sample.get('comment')).to.eql(comment);
      expect(sample.getOccurrence().get('comment')).to.eql(comment);
    });

    it('should not append locks if no value exists', () => {
      const sample = new Sample();
      sample.addOccurrence(new Occurrence());

      Factory._appendAttrLocks(sample, { 'smp:comment': null });
      expect(sample.get('comment')).to.eql(undefined);
    });

    it('should not append locks if value equals temporary "true" flag', () => {
      const sample = new Sample();
      sample.addOccurrence(new Occurrence());

      Factory._appendAttrLocks(sample, { 'smp:comment': true });
      expect(sample.get('comment')).to.eql(undefined);
    });
  });
  describe('createSampleWithPhoto', () => {
    let getImageModelStub;
    let createSampleStub;
    beforeEach(() => {
      createSampleStub = sinon.stub(Factory, 'createSample').resolves();
      getImageModelStub = sinon.stub(ImageHelp, 'getImageModel').resolves();
    });
    afterEach(() => {
      getImageModelStub.restore();
      createSampleStub.restore();
    });

    it('should call ImageHelp.getImageModel', done => {
      Factory.createSampleWithPhoto()
        .then(() => {
          expect(getImageModelStub.calledOnce).to.eql(true);
          done();
        })
        .catch(done);
    });

    it('should return call to createSample', done => {
      createSampleStub.resolves('sample1');
      Factory.createSampleWithPhoto()
        .then(sample => {
          expect(sample).to.eql('sample1');
          done();
        })
        .catch(done);
    });
  });
});
