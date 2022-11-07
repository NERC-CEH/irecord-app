/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import axios, { AxiosRequestConfig } from 'axios';
import { observable, set } from 'mobx';
import { AppModel } from 'models/app';
import Occurrence from 'models/occurrence';
import SavedSamplesProps from 'models/savedSamples';
import { UserModel } from 'models/user';
import Sample from 'models/sample';
import { device } from '@flumens';
import CONFIG from 'common/config';
import defaultSurvey from 'Survey/Default/config';
import listSurvey from 'Survey/List/config';
import mothSurvey from 'Survey/Moth/config';
import plantSurvey from 'Survey/Plant/config';

// export type
interface API_Occurrence {
  source_system_key: string;
}

interface Verifier {
  id?: string;
  name?: string;
}

interface AutoChecks {
  result: string;
  enabled: string;
  output: any[];
}

export interface Identification {
  verifier?: Verifier;
  auto_checks: AutoChecks;
  verification_decision_source: string;
  verification_substatus: string;
  verified_on: string;
  verification_status: string;
}

interface Source {
  identification: Identification;
  occurrence: API_Occurrence;
}
interface Hit {
  _source: Source;
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
          {
            bool: {
              should: [
                {
                  match: {
                    'metadata.survey.id': defaultSurvey.id,
                  },
                },
                {
                  match: {
                    'metadata.survey.id': listSurvey.id,
                  },
                },
                {
                  match: {
                    'metadata.survey.id': mothSurvey.id,
                  },
                },
                {
                  match: {
                    'metadata.survey.id': plantSurvey.id,
                  },
                },
              ],
            },
          },

          {
            bool: {
              should: [
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

async function fetchUpdatedRemoteSamples(userModel: UserModel, timestamp: any) {
  console.log('SavedSamples: pulling remote verified surveys');

  const samples: { [key: string]: Hit } = {};

  const OPTIONS: AxiosRequestConfig = {
    method: 'post',
    url: CONFIG.backend.recordsServiceURL,
    headers: {
      authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    timeout: 80000,
    data: getRecordsQuery(timestamp),
  };

  let data;
  try {
    const res = await axios(OPTIONS);
    data = res.data;
  } catch (error) {
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
  savedSamples: typeof SavedSamplesProps,
  updatedRemoteSamples: any
): Occurrence[] {
  const nonPendingUpdatedOccurrences: Occurrence[] = [];

  if (updatedRemoteSamples.length <= 0) return nonPendingUpdatedOccurrences;

  const findMatchingLocalSamples = (sample: Sample) => {
    const appendVerification = (occ: Occurrence) => {
      const updatedOccurrence = updatedRemoteSamples[occ.cid];
      if (!updatedOccurrence) return;

      const newVerification = updatedOccurrence._source.identification;

      const hasNotChanged =
        newVerification.verified_on === occ.metadata.verification?.verified_on;
      if (hasNotChanged) return; // there is a window when the same update can be returned. We don't want to change the record in that case.

      occ.metadata.verification = { ...newVerification };

      const isNonPending =
        newVerification.verification_status === 'C' &&
        newVerification.verification_substatus === '0';
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

  savedSamples.forEach(findMatchingLocalSamples);

  return nonPendingUpdatedOccurrences;
}

function getEarliestTimestamp(savedSamples: typeof SavedSamplesProps) {
  const byTime = (s1: Sample, s2: Sample) =>
    new Date(s1.metadata.createdOn).getTime() -
    new Date(s2.metadata.createdOn).getTime();

  const [firstSample] = [...savedSamples].sort(byTime);
  if (!firstSample) return new Date().getTime(); // should never happen

  let earliestTimestamp = new Date(firstSample.metadata.createdOn);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  if (earliestTimestamp.getTime() < oneMonthAgo.getTime()) {
    // we don't want existing users with lots of records to pull all updates at once
    earliestTimestamp = oneMonthAgo;
  }

  return earliestTimestamp.setHours(0, 0, 0, 0); // midnight
}

async function init(
  savedSamples: typeof SavedSamplesProps,
  userModel: UserModel,
  appModel: AppModel
) {
  // in-memory observable to use in reports and other views
  savedSamples.verified = observable({ updated: [], timestamp: null });

  const originalResetDefaults = savedSamples.resetDefaults;
  // eslint-disable-next-line @getify/proper-arrows/name
  savedSamples.resetDefaults = () => {
    set(savedSamples.verified, { count: 0, timestamp: null });
    return originalResetDefaults();
  };

  async function sync() {
    if (!savedSamples.length || !userModel.isLoggedIn() || !device.isOnline)
      return;

    const lastSyncTime =
      appModel.attrs.verifiedRecordsTimestamp ||
      getEarliestTimestamp(savedSamples);

    const shouldSyncWait = new Date().getTime() - lastSyncTime < SQL_TO_ES_LAG;
    if (shouldSyncWait) return;

    const updatedRemoteSamples = await fetchUpdatedRemoteSamples(
      userModel,
      lastSyncTime
    );

    appModel.attrs.verifiedRecordsTimestamp = new Date().getTime();
    appModel.save();

    if (!Object.keys(updatedRemoteSamples).length) return;

    console.log(
      'SavedSamples: pulled remote verified surveys. New ones found.'
    );

    const updatedLocalOccurrences = await updateLocalOccurrences(
      savedSamples,
      updatedRemoteSamples
    );

    if (!updatedLocalOccurrences.length) return;
    console.log(
      'SavedSamples: pulled remote verified surveys and found local matches'
    );

    const newVerified: Verification = {
      updated: updatedLocalOccurrences,
      timestamp: appModel.attrs.verifiedRecordsTimestamp,
    };

    set(savedSamples.verified, newVerified);
  }

  savedSamples.ready.then(sync);
  setInterval(sync, SYNC_WAIT);
}

export default init;
