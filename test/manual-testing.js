/** ********************************************************************
 * Manual testing functions.
 *********************************************************************/
import appModel from 'components/common/app_model';
import recordManager from 'components/common/record_manager';
import Sample from 'components/common/sample';
import Occurrence from 'components/common/occurrence';
import Morel from 'morel';

const testing = {};

/**
 * Reset All Records Status
 */
testing.resetRecordsStatus = function () {
  recordManager.getAll((getError, recordsCollection) => {
    if (getError) {
      App.regions.dialog.error(getError);
      return;
    }
    recordsCollection.forEach((record) => {
      record.metadata.saved = false;
      record.metadata.server_on = null;
      record.metadata.synced_on = null;
      record.metadata.updated_on = null;
      record.save();
    });
  });
};

/**
 * Add a Dummy Record.
 */
testing.addDummyRecord = function (count = 0, imageData, testID) {
  if (!imageData) {
    // create random image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(1000, 1000); //px

    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = (Math.random() * 100).toFixed(0);
      imgData.data[i + 1] = (Math.random() * 100).toFixed(0);
      imgData.data[i + 2] = (Math.random() * 100).toFixed(0);
      imgData.data[i + 3] = 105;
    }
    ctx.putImageData(imgData, 0, 0);
    imageData = canvas.toDataURL('jpeg');
  }

  if (!testID) {
    testID = (Math.random() * 10).toFixed(0);
  }

  const image = new Morel.Image({
    data: imageData,
    type: 'image/png',
  });

  const sampleTestID = `test ${testID} - ${count}`;

  // create occurrence
  const occurrence = new Occurrence({
    taxon: {
      array_id: 12186,
      common_name: "Tuberous Pea",
      found_in_name: "common_name",
      group: 27,
      scientific_name: "Lathyrus tuberosus",
      species_id: 3,
      synonym: "Fyfield Pea",
      warehouse_id: 113813,
    },
    comment: sampleTestID,
  });
  occurrence.images.set(image);

  // create sample
  const sample = new Sample({
    date: new Date(),
    location_type: 'latlon',
    location: {
      accuracy: 1,
      gridref: "SD75",
      latitude: 54.0310862,
      longitude: -2.3106393,
      name: sampleTestID,
      source: "map",
    },
  }, {
    occurrences: [occurrence],
  });

  // append locked attributes
  appModel.appendAttrLocks(sample);

  recordManager.set(sample, (saveErr) => {
    if (saveErr) {
      console.error(saveErr);
      return;
    }

    if (--count) {
      console.log(`Adding: ${count}`);
      testing.addDummyRecord(count, imageData, testID);
    } else {
      console.log('Finished Adding');
    }
  });
};

window.testing = testing;