import Sample from 'sample';
import Occurrence from 'occurrence';
import CONFIG from 'config';
import serverResponses from './server_responses.js';

function getRandomSample(occurrence) {
  if (!occurrence) {
    occurrence = new Occurrence({ // eslint-disable-line
      taxon: { warehouse_id: 166205 },
    });
  }

  const sample = new Sample(
    {
      location: {
        latitude: 12.12,
        longitude: -0.23,
        name: 'automatic test',
      },
    },
    {
      occurrences: [occurrence],
    }
  );

  return sample;
}

function generateSampleResponse(server, type, data) {
  const SAMPLE_POST_URL = `${CONFIG.indicia.host}/api/v0.1/samples`;

  switch (type) {
    case 'OK':
      server.respondWith((req) => {
        let model = data;
        if (typeof data === 'function') {
          const submission = JSON.parse(req.requestBody.get('submission'));
          model = data(submission.external_key);
        }

        req.respond.apply(req, serverResponses(type, { // eslint-disable-line
            cid: model.cid, // eslint-disable-line
            occurrence_cid: model.getOccurrence().cid, // eslint-disable-line
          }) // eslint-disable-line
        );
      });
      break;

    case 'OK_SUBSAMPLE':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type, {
          cid: data.cid,
          subsample_cid: data.getSample().cid,
          occurrence_cid: data.getSample().getOccurrence().cid,
        }),
      );
      break;

    case 'DUPLICATE':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type, {
          occurrence_cid: data.getOccurrence().cid, // eslint-disable-line
          cid: data.cid, // eslint-disable-line
        }), // eslint-disable-line
      );
      break;

    case 'ERR':
      server.respondWith(
        'POST',
        SAMPLE_POST_URL,
        serverResponses(type),
      );
      break;
    default:

  }
}

export {
  getRandomSample,
  generateSampleResponse,
};
