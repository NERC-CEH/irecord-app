/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import Image from '../../src/common/models/media';
import Sample from '../../src/common/models/sample';
import Occurrence from '../../src/common/models/occurrence';
import defaultConfig from '../../src/Survey/Default/config';
import defaultComplexConfig from '../../src/Survey/List/config';
import savedRecords from '../../src/common/models/savedSamples';
import images from './images.json';

const location = {
  accuracy: 1,
  gridref: 'SD75',
  latitude: 54.0310862,
  longitude: -2.3106393,
  source: 'map',
  name: 'Wallingford',
};

// @ts-ignore
async function makeSample(taxon, img?) {
  const sample = await defaultConfig.create(Sample, Occurrence, taxon);

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
      taxon: {
        array_id: 12186,
        common_names: ['10-spot Ladybird'],
        found_in_name: 'common_name',
        group: 27,
        scientific_name: 'Lathyrus tuberosus',
        species_id: 3,
        synonym: 'Fyfield Pea',
        warehouse_id: 113813,
      },
    },
    images.ladybird
  );
  let sample = await defaultComplexConfig.create(Sample, Occurrence, {});
  sample.stopGPS();
  sample.attrs.location = {
    accuracy: 500,
    gridref: 'SD7959',
    latitude: 54.02656632927197,
    longitude: -2.3220393265197345,
    source: 'map',
    name: 'Cappleside',
  };
  let subSample = await defaultConfig.create(Sample, Occurrence, {
    taxon: {
      array_id: 12186,
      common_names: ['Wild Cherry'],
      found_in_name: 1,
      group: 27,
      scientific_name: 'Volucella inanis',
      species_id: 3,
      warehouse_id: 113813,
    },
  });
  subSample.stopGPS();
  subSample.occurrences[0].attrs.number = 1;
  sample.samples.push(subSample);
  subSample = await defaultConfig.create(Sample, Occurrence, {
    taxon: {
      array_id: 12186,
      common_names: ['Grey Squirrel'],
      found_in_name: 1,
      group: 27,
      scientific_name: 'Sciurus carolinensis',
      species_id: 3,
      warehouse_id: 113813,
    },
  });
  subSample.stopGPS();
  subSample.occurrences[0].attrs.number = 15;
  sample.samples.push(subSample);
  // sample.attrs.  = ['John Peterson'];
  await sample.save();
  savedRecords.push(sample);
  sample = await makeSample(
    {
      taxon: {
        probability: 0.9999999943019859,
        warehouse_id: 126090,
        scientific_name: 'Pholidoptera griseoaptera',
        group: 115,
        common_names: ['Dark Bush-cricket', 'Dark Bush Cricket'],
        found_in_name: 0,
      },
    },
    images.grasshooper
  );

  sample.attrs.date = new Date(2022, 10, 29);
  sample.occurrences[0].attrs.number = '1';
  sample.occurrences[0].attrs.comment = 'Singing in the sunny day';
  await sample.save();
  sample = await makeSample(
    {
      taxon: {
        array_id: 19501,
        species_id: 0,
        found_in_name: 0,
        warehouse_id: 89337,
        group: 73,
        scientific_name: 'Parus major',
        common_names: ['Great Tit'],
      },
    },
    images.tit
  );
  sample.metadata.taxa = 'birds';
  sample.occurrences[0].attrs.comment = 'Came very close to where we were.';
  sample.occurrences[0].attrs.identifiers = 'Flumens';
  sample.occurrences[0].attrs.stage = 'Pre-adult';
  sample.occurrences[0].attrs.number = 4;
  sample.occurrences[0].attrs.sex = 'Mixed';
  sample.occurrences[0].attrs.breeding = '01: Nesting habitat (H)';

  sample.attrs.date = new Date(2022, 10, 28);
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
      taxon: {
        probability: 0.9999082797882908,
        warehouse_id: 77755,
        scientific_name: 'Sciurus carolinensis',
        group: 150,
        common_names: ['Eastern Grey Squirrel', 'Grey Squirrel'],
        found_in_name: 0,
      },
    },
    images.squirrel
  );

  sample.occurrences[0].attrs.number = 4;
  sample.occurrences[0].stage = 'Pre-adult';
  sample.occurrences[0].sex = 'Mixed';
  sample.attrs.date = new Date();
  sample.attrs.location = {
    accuracy: 500,
    gridref: 'SP5508',
    latitude: 54.02656632927197,
    longitude: -2.3220393265197345,
    source: 'map',
    name: 'Oxford',
  };

  sample.save();

  sample = await makeSample(
    {
      taxon: {
        array_id: 23850,
        species_id: 0,
        found_in_name: 0,
        warehouse_id: 94188,
        group: 104,
        scientific_name: 'Satyrium pruni',
        common_names: ['Black Hairstreak'],
      },
    },
    images.egg
  );

  sample.occurrences[0].attrs.comment = 'Spotted laying eggs';
  sample.occurrences[0].attrs.stage = 'Egg';
  sample.occurrences[0].attrs.number = 29;
  sample.attrs.location = {
    accuracy: 1,
    gridref: 'SD75',
    latitude: 54.0310862,
    longitude: -2.3106393,
    source: 'map',
    name: 'Lancaster',
  };
  await sample.save();

  sample = await defaultComplexConfig.create(Sample, Occurrence, {});

  sample.attrs.location = {
    accuracy: 500,
    gridref: 'SD7959',
    latitude: 54.02656632927197,
    longitude: -2.3220393265197345,
    source: 'map',
    name: 'Cappleside',
  };

  subSample.stopGPS();

  subSample = await defaultConfig.create(Sample, Occurrence, {
    taxon: {
      array_id: 5716,
      species_id: 0,
      found_in_name: 0,
      warehouse_id: 171389,
      group: 73,
      scientific_name: 'Clangula hyemalis',
      common_names: ['Long-tailed Duck', 'Long-Tailed Duck'],
    },
  });

  let [occ] = (await subSample).occurrences || [];

  occ.metadata.verification = {};
  occ.metadata.verification.verification_status = 'V2';

  subSample.occurrences[0].attrs.number = 1;
  sample.samples.push(subSample);

  savedRecords.push(sample);

  sample.metadata.saved = true;
  sample.metadata.taxa = 'birds';
  sample.metadata.createdOn = 1669967944081;
  sample.metadata.syncedOn = 1669967944081;
  sample.metadata.updatedOn = 1669967944081;
  sample.save();

  subSample = await defaultConfig.create(Sample, Occurrence, {
    taxon: {
      array_id: 3704,
      species_id: 2,
      found_in_name: 1,
      warehouse_id: 247235,
      group: 73,
      scientific_name: 'Bubo bubo',
      common_names: ['Eurasian Eagle-Owl', 'Eagle Owl'],
    },
  });

  subSample.occurrences[0].attrs.number = 1;

  [occ] = (await subSample).occurrences || [];

  occ.metadata.verification = {};
  occ.metadata.verification.verification_status = 'V2';

  sample.samples.push(subSample);

  subSample = await defaultConfig.create(Sample, Occurrence, {
    taxon: {
      array_id: 12186,
      common_names: ['Great Tit'],
      found_in_name: 0,
      group: 27,
      scientific_name: 'Parus major',
      species_id: 3,
      warehouse_id: 113813,
    },
  });
  subSample.occurrences[0].attrs.number = 9;

  [occ] = (await subSample).occurrences || [];

  occ.metadata.verification = {};
  occ.metadata.verification.verification_status = 'C';
  occ.metadata.verification.verification_substatus = '3';

  sample.samples.push(subSample);

  subSample = await defaultConfig.create(Sample, Occurrence, {
    taxon: {
      array_id: 11500,
      species_id: 0,
      found_in_name: 1,
      warehouse_id: 230665,
      group: 73,
      scientific_name: 'Haliaeetus albicilla',
      common_names: ['White-tailed Eagle', 'White-tailed Eagle (Sea Eagle)'],
    },
  });
  subSample.stopGPS();
  subSample.occurrences[0].attrs.number = 2;

  [occ] = (await subSample).occurrences || [];

  occ.metadata.verification = {};
  occ.metadata.verification.verification_status = 'R';

  sample.samples.push(subSample);

  const sample2 = makeSample(
    {
      taxon: {
        array_id: 7002,
        common_names: ['Blue Tit', 'Eurasian Blue Tit'],
        found_in_name: 0,
        group: 73,
        scientific_name: 'Cyanistes caeruleus',
        species_id: 0,
        warehouse_id: 223342,
      },
    },
    images.blueTit
  );

  (await sample2).metadata.saved = true;
  // (await sample).metadata.taxa = 'birds';
  (await sample2).metadata.createdOn = 1670173930204;
  (await sample2).metadata.syncedOn = 1670173930204;
  (await sample2).metadata.updatedOn = 1670173930204;

  [occ] = (await sample2).occurrences || [];

  const image = new Image({
    attrs: {
      data: images.blueTit1,
      thumbnail: images.blueTit1,
      type: 'jpg',
    },
  });
  occ.media.push(image);

  occ.metadata.verification = {};
  occ.metadata.verification.verification_status = 'V2';

  sample.save();
}

// @ts-ignore
window.screenshotsPopulatePending = async () => {
  // wait till savedSamples is fully initialized
  // await savedRecords._init;

  // @ts-ignore
  const destroyAllSamples = savedRecords.map(sample => sample.destroy());
  await Promise.all(destroyAllSamples);

  createSamples();
};
