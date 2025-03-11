/* eslint-disable no-param-reassign */

/* eslint-disable camelcase */
import { observable, set } from 'mobx';
import axios, { AxiosRequestConfig } from 'axios';
import { ElasticOccurrence, device, isAxiosNetworkError } from '@flumens';
import CONFIG from 'common/config';
import { matchAppSurveys } from 'common/services/ES';
import { AppModel } from 'models/app';
import SavedSamplesProps from 'models/collections/samples';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { UserModel } from 'models/user';

interface Hit {
  _source: ElasticOccurrence;
}

export type Verification = {
  timestamp: number | null;
  updated: Occurrence[];
};

const SQL_TO_ES_LAG = 15 * 60 * 1000; // 15mins
const SYNC_WAIT = SQL_TO_ES_LAG;

const getRecordsQuery = (timestamp: any) => {
  const lastFetchTime = new Date(timestamp - SQL_TO_ES_LAG);

  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
  });

  const timeFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    timeStyle: 'medium',
  });

  // format to 2020-02-21
  const date = dateFormat.format(lastFetchTime).split('/').reverse().join('-');

  // format to 08:37:55
  const time = timeFormat.format(lastFetchTime);
  const formattedTimestamp = `${date} ${time}`;

  return JSON.stringify({
    size: 1000, // fetch only 1k of the last created. Note, not updated_on, since we mostly care for any last user uploaded records.
    query: {
      bool: {
        must: [
          matchAppSurveys,

          {
            bool: {
              should: [
                {
                  match_phrase: {
                    'identification.query': 'Q',
                  },
                },
                {
                  match_phrase: {
                    'identification.verification_status': 'C',
                  },
                },
                {
                  match_phrase: {
                    'identification.verification_status': 'V',
                  },
                },
                {
                  match_phrase: {
                    'identification.verification_status': 'R',
                  },
                },
              ],
            },
          },
          {
            range: {
              'metadata.updated_on': {
                gte: formattedTimestamp,
              },
            },
          },
        ],
      },
    },
    sort: [
      {
        'metadata.created_on': {
          order: 'desc',
        },
      },
    ],
  });
};

type UpdatedSamples = Record<string, Hit>;

async function fetchUpdatedRemoteSamples(userModel: UserModel, timestamp: any) {
  console.log('SavedSamples: pulling remote verified surveys');

  const samples: UpdatedSamples = {};

  const options: AxiosRequestConfig = {
    method: 'post',
    url: CONFIG.backend.occurrenceServiceURL,
    headers: {
      authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    timeout: 80000,
    data: getRecordsQuery(timestamp),
  };

  let data;
  try {
    const res = await axios(options);
    data = res.data;
  } catch (error: any) {
    if (isAxiosNetworkError(error)) return samples;

    console.error(error);
    return samples;
  }

  // eslint-disable-next-line no-param-reassign

  const normalizeResponse = ({ ...hit }: Hit) => {
    samples[hit._source.occurrence.source_system_key] = { ...hit };
  };

  data?.hits?.hits.forEach(normalizeResponse);

  return samples;
}

function updateLocalOccurrences(
  samples: Sample[],
  updatedRemoteSamples: UpdatedSamples
): Occurrence[] {
  const nonPendingUpdatedOccurrences: Occurrence[] = [];

  if (Object.keys(updatedRemoteSamples).length <= 0)
    return nonPendingUpdatedOccurrences;

  const findMatchingLocalSamples = (sample: Sample) => {
    const appendVerification = (occ: Occurrence) => {
      const updatedOccurrence = updatedRemoteSamples[occ.cid];
      if (!updatedOccurrence) return;

      const newVerification = updatedOccurrence._source.identification;

      const hasNotChanged =
        newVerification.verified_on ===
          occ.metadata.verification?.verified_on &&
        newVerification.query === occ.metadata.verification.query;
      if (hasNotChanged) return; // there is a window when the same update can be returned. We don't want to change the record in that case.

      occ.metadata.verification = { ...newVerification };

      const isNonPending =
        newVerification.verification_status === 'C' &&
        newVerification.verification_substatus === '0' &&
        !newVerification.query;
      if (isNonPending) return;

      nonPendingUpdatedOccurrences.push(occ);
    };

    const hasSubSample = sample.samples.length;
    if (hasSubSample) {
      const getSamples = (subSample: Sample) => {
        subSample.occurrences.forEach(appendVerification);
      };
      sample.samples.forEach(getSamples);
    } else {
      sample.occurrences.forEach(appendVerification);
    }
    sample.save();
  };

  samples.forEach(findMatchingLocalSamples);

  return nonPendingUpdatedOccurrences;
}

function getEarliestTimestamp(samples: Sample[]) {
  const byTime = (s1: Sample, s2: Sample) =>
    new Date(s1.createdAt).getTime() - new Date(s2.createdAt).getTime();

  const [firstSample] = [...samples].sort(byTime);
  if (!firstSample) return new Date().getTime(); // should never happen

  let earliestTimestamp = new Date(firstSample.createdAt);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  if (earliestTimestamp.getTime() < oneMonthAgo.getTime()) {
    // we don't want existing users with lots of records to pull all updates at once
    earliestTimestamp = oneMonthAgo;
  }

  return earliestTimestamp.setHours(0, 0, 0, 0); // midnight
}

async function init(
  allSamples: typeof SavedSamplesProps,
  userModel: UserModel,
  appModel: AppModel
) {
  // in-memory observable to use in reports and other views
  allSamples.verified = observable({ updated: [], timestamp: null });

  const originalResetDefaults = allSamples.reset;
  // eslint-disable-next-line @getify/proper-arrows/name
  allSamples.reset = () => {
    set(allSamples.verified, { count: 0, timestamp: null });
    return originalResetDefaults();
  };

  async function sync() {
    const samples: Sample[] = allSamples.filter(smp => smp.isStored);
    if (
      !samples.length ||
      !userModel.isLoggedIn() ||
      !userModel.data.verified ||
      !device.isOnline
    )
      return;

    const lastSyncTime =
      appModel.data.verifiedRecordsTimestamp || getEarliestTimestamp(samples);

    const shouldSyncWait = new Date().getTime() - lastSyncTime < SQL_TO_ES_LAG;
    if (shouldSyncWait) return;

    const updatedRemoteSamples = await fetchUpdatedRemoteSamples(
      userModel,
      lastSyncTime
    );

    appModel.data.verifiedRecordsTimestamp = new Date().getTime();
    appModel.save();

    if (!Object.keys(updatedRemoteSamples).length) return;

    console.log(
      'SavedSamples: pulled remote verified surveys. New ones found.'
    );

    const updatedLocalOccurrences = await updateLocalOccurrences(
      samples,
      updatedRemoteSamples
    );

    if (!updatedLocalOccurrences.length) return;
    console.log(
      'SavedSamples: pulled remote verified surveys and found local matches'
    );

    const newVerified: Verification = {
      updated: updatedLocalOccurrences,
      timestamp: appModel.data.verifiedRecordsTimestamp,
    };

    set(allSamples.verified, newVerified);
  }

  allSamples.ready.then(sync);
  setInterval(sync, SYNC_WAIT);
}

export default init;
