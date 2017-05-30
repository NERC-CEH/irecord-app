import API from '../controller';

describe('Surveys List Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
  it('should check if survey location accuracy is good enough', () => {
    //todo
    // const sample = new Sample();
    // expect(API.isSurveyLocationSet(sample)).to.be.false;
    // sample.set('location', {
    //   gridref: 'TQ1212',
    // });
    // expect(API.isSurveyLocationSet(sample)).to.be.true;
  });
});
