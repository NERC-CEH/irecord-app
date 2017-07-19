const fs = require('fs');
const jsonTranslator = require('./scripts/_json_translator');
const commonNameMaker = require('./scripts/_makeCommonNameMap');

/**
 * Transform species.csv to json
 * @param data
 * @param callback
 */
function transform2JSON(data, outputFileName, callback) {
  // transform
  console.log('Transforming to JSON...');
  jsonTranslator(data, (err, jsonData) => {
    // write it to file
    console.log(`Writing ./${outputFileName}.data.json`);
    fs.writeFile(`./${outputFileName}.data.json`,
      JSON.stringify(jsonData),
      null,
      writeErr => callback(writeErr, jsonData)
    );
  });
}

/**
 * Create common name map.
 */
function makeCommonNameMap(data, outputFileName, callback) {
  // make the map
  console.log('Building name map...');
  const mapData = commonNameMaker(data);

  // write it to file
  console.log(`Writing ./${outputFileName}.data.json`);
  fs.writeFile(
    `./${outputFileName}.data.json`,
    JSON.stringify(mapData),
    writeErr => callback(writeErr, mapData)
  );
}


// read the CSV file
fs.readFile('./species.csv', 'utf8', (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  // transform
  transform2JSON(data, 'species', (transformErr, jsonData) => {
    if (transformErr) {
      console.log(transformErr);
      return;
    }

    // make the name map
    makeCommonNameMap(jsonData, 'species_names', (mapErr) => {
      if (mapErr) {
        console.log(mapErr);
        return;
      }

      console.log('Done!');
    });
  });
});

