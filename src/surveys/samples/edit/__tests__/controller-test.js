import API from '../controller';

/* eslint-disable no-unused-expressions */

describe('Surveys Sample List Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should check if survey location accuracy is good enough', () => {
    expect(API.isSurveyLocationSet).to.be.a('function');
  });
});
