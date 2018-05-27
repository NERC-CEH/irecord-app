function waitValue(element, value) {
  browser.waitUntil(() => browser.getValue(element) === value);
}

function waitVisible(element) {
  browser.waitUntil(() => browser.isVisible(element));
}

function waitDialogHide() {
  browser.waitUntil(
    () => browser.getCssProperty('#dialog', 'display').value === 'none',
    5000
  );
}

describe('Make a record', () => {
  beforeEach(() => {
    browser.timeouts('implicit', 10000); // Wait up to 5 seconds for commands to work
  });

  it('should exit welcome screen', () => {
    expect(browser.isVisible('#exit')).to.eql(true);

    browser.click('#exit');
    expect(browser.isVisible('#samples-list-container')).to.eql(true);
  });

  it('should click new record create button', () => {
    browser.click('#create-new-btn');
    expect(browser.isVisible('#taxon')).to.eql(true);
  });

  it('should search for blackbird', () => {
    browser.setValue('#taxon', 'blackbird');
    waitVisible('#suggestions .selected');
  });

  it('should click on blackbird', () => {
    browser.click('#suggestions > ul > li.table-view-cell.selected');
    waitVisible('#samples-list-container');
    expect(browser.getText('.species')).to.eql('Blackbird');
  });

  it('should click on the newly created record', () => {
    browser.click('#samples-list-container a');
    expect(browser.isVisible('.table-view.core.inputs.no-top')).to.eql(true);
  });

  it('should try to send it and get missing data dialog', () => {
    browser.click('#sample-save-btn');
    expect(browser.getText('#dialog .dialog-header h3')).to.eql('Sorry');
  });

  it('should navigate to location page', () => {
    waitDialogHide();
    browser.click('#location-button');
    expect(browser.isVisible('#location-container')).to.eql(true);
  });

  const locationName = 'My location';
  it('should set location name', () => {
    browser.setValue('#location-name', locationName);
    waitValue('#location-name', locationName);
  });
  //
  // it('should click on a map', () => {
  //   // click centre of the map
  //   const width = browser.getElementSize('#map', 'width');
  //   const height = browser.getElementSize('#map', 'height');
  //
  //   browser.leftClick('#map', width / 2, height / 2);
  //   waitValue('#location-gridref');
  // });

  it('should set a location', () => {
    browser.setValue('#location-gridref', 'SD854240');
    waitValue('#location-gridref', 'SD854240');
    browser.click('a[data-rel="back"]');
  });

  it('should navigate back', () => {
    waitVisible('.core.inputs');

    expect(browser.getText('#location-button > span:nth-child(3)')).to.eql(
      locationName
    );
  });
});

describe('Login and send a record', () => {
  it('should click send the record and be redirected to login page', () => {
    browser.click('#sample-save-btn');
    expect(browser.isVisible('#user-name')).to.eql(true);
    expect(browser.isVisible('#user-password')).to.eql(true);
  });

  it('should click send the record and be redirected to login page', () => {
    browser.setValue('#user-name', 'test');
    browser.setValue('#user-password', 'test');
    browser.click('#login-button');

    expect(browser.isVisible('#samples-list-container')).to.eql(true);
  });

  it('should successfully submit a record', () => {
    waitVisible('.online-status.cloud');
  });
});

describe('Delete all records', () => {
  it('should delete all records', () => {
    browser.click('a[href="#info"]');
    browser.click('a[href="#settings"]');
    browser.click('#delete-all-btn');
    expect(browser.getText('#dialog .dialog-header h3')).to.eql('Remove All');

    browser.click('#dialog .btn-negative');
    waitDialogHide();
  });

  it('should navigate to main page and find no records', () => {
    browser.back();
    browser.back();
    expect(browser.isVisible('a#create-new-btn')).to.eql(true);
  });
});
