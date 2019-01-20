import { AppModel } from 'app_model';

/* eslint-disable no-unused-expressions */
function initAppModel() {
  const appModel = new AppModel();
  return appModel._init.then(() => appModel);
}

describe('App Model', () => {
  before(() =>
    initAppModel().then(appModel => {
      appModel.resetDefaults();
    })
  );

  it('has default values', () => {
    const appModel = new AppModel();
    console.log(Object.keys(appModel.attrs));
    expect(appModel.attrs).to.have.all.keys([
      'showWelcome',
      'language',
      'locations',
      'attrLocks',
      'autosync',
      'useGridRef',
      'useGridMap',
      'useExperiments',
      'useTraining',
      'useGridNotifications',
      'gridSquareUnit',
      'feedbackGiven',
      'taxonGroupFilters',
      'searchNamesOnly',
    ]);

    // should set the exact value checks in the modules requiring them
    expect(appModel.get('showWelcome')).to.be.equal(true);
    expect(appModel.get('locations') instanceof Array).to.be.true;
    expect(appModel.get('attrLocks'))
      .to.be.an('object')
      .and.has.all.keys('general', 'complex');
    expect(appModel.get('autosync')).to.be.equal(true);
    expect(appModel.get('useGridRef')).to.be.equal(true);
    expect(appModel.get('useGridMap')).to.be.equal(true);
    expect(appModel.get('gridSquareUnit')).to.be.equal('monad');
  });

  describe('Activities support', () => {
    function getRandActivity() {
      const activity = {
        id: (Math.random() * 100).toFixed(0),
        name: '',
        description: '',
        type: '',
        activity_from_date: '2015-01-01',
        activity_to_date: '2020-01-01',
      };
      return activity;
    }

    it('should remove expired activity lock', () => initAppModel()
        .then(appModel => {
          const activity = getRandActivity();
          activity.activity_to_date = '2000-01-01';
          appModel.setAttrLock('smp:activity', activity);
          appModel.save();
          expect(appModel.getAttrLock('smp:activity')).to.be.an('object');
        })
        .then(initAppModel)
        .then(appModel => {
          expect(appModel.getAttrLock('smp:ctivity')).to.be.undefined;
        }));
  });
});
