import savedRecords from 'saved_samples';
import defaultConfig from 'common/config/surveys/default';
import defaultComplexConfig from 'common/config/surveys/complex/default';
import Image from 'common/models/image';
import Sample from 'sample';
import Occurrence from 'occurrence';
import images from './images.json';

const location = {
  accuracy: 1,
  gridref: 'SD75',
  latitude: 54.0310862,
  longitude: -2.3106393,
  source: 'map',
  name: 'Wallingford',
};

async function makeSample(taxon, img) {
  const sample = await defaultConfig.create(
    Sample,
    Occurrence,
    null,
    taxon
  );

  sample.stopGPS();
  sample.attrs.location = { ...location };

  const [occ] = sample.occurrences;
  occ.attrs.stage = 'Adult';
  occ.attrs.number = '2-5';

  if (img) {
    const image = new Image({
      attrs: {
        data: img,
        thumbnail: img,
        type: 'jpg',
      },
    });
    occ.media.push(image);
  }

  await sample.save();

  savedRecords.push(sample);
  return sample;
}

/**
 * A helper util to set up dummy records for capturing screenshots.
 */
async function createSamples() {
  makeSample(
    {
      array_id: 12186,
      common_name: '10-spot Ladybird',
      found_in_name: 'common_name',
      group: 27,
      scientific_name: 'Lathyrus tuberosus',
      species_id: 3,
      synonym: 'Fyfield Pea',
      warehouse_id: 113813,
    },
    images.ladybird
  );

  let sample = await defaultComplexConfig.create(Sample, Occurrence);
  sample.stopGPS();
  sample.attrs.location = {
    accuracy: 500,
    gridref: 'SD7959',
    latitude: 54.02656632927197,
    longitude: -2.3220393265197345,
    source: 'map',
    name: 'Cappleside',
  };
  let subSample = await defaultConfig.create(Sample, Occurrence, null, {
    array_id: 12186,
    common_name: 'Wild Cherry',
    found_in_name: 'common_name',
    group: 27,
    scientific_name: 'Volucella inanis',
    species_id: 3,
    warehouse_id: 113813,
  });
  subSample.stopGPS();
  subSample.occurrences[0].attrs.number = 1;
  sample.samples.push(subSample);

  subSample = await defaultConfig.create(Sample, Occurrence, null, {
    array_id: 12186,
    common_name: 'Grey Squirrel',
    found_in_name: 'common_name',
    group: 27,
    scientific_name: 'Sciurus carolinensis',
    species_id: 3,
    warehouse_id: 113813,
  });
  subSample.stopGPS();
  subSample.occurrences[0].attrs.number = 15;
  sample.samples.push(subSample);

  sample.attrs.recorders = ['John Peterson'];
  await sample.save();
  savedRecords.push(sample);

  sample = await makeSample({
    array_id: 12186,
    common_name: 'Wild Cherry',
    found_in_name: 'common_name',
    group: 27,
    scientific_name: 'Volucella inanis',
    species_id: 3,
    warehouse_id: 113813,
  });
  sample.attrs.date = new Date(2018, 4, 11);

  sample.occurrences[0].attrs.number = '1';
  await sample.save();

  sample = await makeSample(
    {
      array_id: 12186,
      common_name: 'Great Tit',
      found_in_name: 'common_name',
      group: 27,
      scientific_name: 'Parus major',
      species_id: 3,
      warehouse_id: 113813,
    },
    images.tit
  );
  sample.occurrences[0].attrs.comment = 'Came very close to where we were.';
  sample.attrs.date = new Date(2019, 4, 11);
  sample.attrs.location = {
    accuracy: 7,
    gridref: 'SD483663',
    latitude: 54.0902,
    longitude: -2.7918,
    name: 'Lancaster',
    source: 'map',
  };
  await sample.save();

  sample = await makeSample(
    {
      array_id: 12186,
      common_name: 'Grey Squirrel',
      found_in_name: 'common_name',
      group: 27,
      scientific_name: 'Sciurus carolinensis',
      species_id: 3,
      warehouse_id: 113813,
    },
    images.squirrel
  );
  sample.occurrences[0].attrs.comment = 'Came very close to where we were.';
  sample.attrs.date = new Date(2019, 4, 11);
  sample.attrs.location = {
    accuracy: 500,
    gridref: 'SD7959',
    latitude: 54.02656632927197,
    longitude: -2.3220393265197345,
    source: 'map',
    name: 'Cappleside',
  };
  await sample.save();

  sample = await makeSample(
    {
      array_id: 12186,
      found_in_name: 'scientific_name',
      group: 27,
      scientific_name: 'Arion',
      species_id: 3,
      warehouse_id: 113813,
    },
    images.slug
  );
  sample.occurrences[0].attrs.comment = 'Came very close to where we were.';
  sample.attrs.location = {
    accuracy: 1,
    gridref: 'SD75',
    latitude: 54.0310862,
    longitude: -2.3106393,
    source: 'map',
    name: 'Lancaster',
  };
  await sample.save();
}

window.screenshotsPopulate = async () => {
  // wait till savedSamples is fully initialized
  await savedRecords._init;

  const destroyAllSamples = savedRecords.map(sample => sample.destroy());
  await Promise.all(destroyAllSamples);

  createSamples(savedRecords);
};

window.screenshotsPopulate();
