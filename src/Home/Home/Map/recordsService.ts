import axios, { AxiosRequestConfig } from 'axios';
import { HandledError, isAxiosNetworkError, ElasticOccurrence } from '@flumens';
import CONFIG from 'common/config';
import { matchAppSurveys } from 'common/services/ES';
import userModel from 'models/user';

export interface Square {
  key: string;
  doc_count: number;
  size: number; // in meters
}

type LatLng = { lat: number; lng: number };

export const getESTimestamp = (dateString: string) => {
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
  });

  const timeFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    timeStyle: 'medium',
  });

  // format to 2020-02-21
  const date = dateFormat
    .format(new Date(dateString))
    .split('/')
    .reverse()
    .join('-');

  // format to 08:37:55
  const time = timeFormat.format(new Date(dateString));

  return `${date} ${time}`;
};

type RecordQueryOptions = {
  northWest: LatLng;
  southEast: LatLng;
  startDate?: string;
  speciesGroup?: string;
};

const getRecordsQuery = ({
  northWest,
  southEast,
  startDate,
  speciesGroup,
}: RecordQueryOptions) => {
  const must: any = [matchAppSurveys];

  if (startDate) {
    must.push({
      range: {
        'metadata.created_on': { gte: getESTimestamp(startDate) },
      },
    });
  }

  if (speciesGroup) {
    must.push({
      match: {
        'taxon.input_group_id': speciesGroup,
      },
    });
  }

  return JSON.stringify({
    size: 1000,
    query: {
      bool: {
        must,
        filter: {
          geo_bounding_box: {
            'location.point': {
              top_left: { lat: northWest.lat, lon: northWest.lng },
              bottom_right: { lat: southEast.lat, lon: southEast.lng },
            },
          },
        },
      },
    },
  });
};

let requestCancelToken: any;

export async function fetchRecords(
  options: RecordQueryOptions
): Promise<ElasticOccurrence[] | null> {
  if (requestCancelToken) {
    requestCancelToken.cancel();
  }

  requestCancelToken = axios.CancelToken.source();

  const OPTIONS: AxiosRequestConfig = {
    method: 'post',
    url: CONFIG.backend.occurrenceServiceURL,
    headers: {
      authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    timeout: 80000,
    cancelToken: requestCancelToken.token,
    data: getRecordsQuery(options),
  };

  let records = [];

  try {
    const res = await axios(OPTIONS);
    const getSource = (hit: any): ElasticOccurrence => hit._source;
    const data = res.data.hits.hits.map(getSource);
    // TODO: validate the response is correct

    records = data;
  } catch (error: any) {
    if (axios.isCancel(error)) return null;

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }

  return records;
}

type SquareQueryOptions = {
  northWest: LatLng;
  southEast: LatLng;
  squareSize: number;
  startDate?: string;
  speciesGroup?: string;
};

const getSquaresQuery = ({
  northWest,
  southEast,
  squareSize,
  startDate,
  speciesGroup,
}: SquareQueryOptions) => {
  const must: any = [matchAppSurveys];

  if (startDate) {
    must.push({
      range: {
        'metadata.created_on': { gte: getESTimestamp(startDate) },
      },
    });
  }

  if (speciesGroup) {
    must.push({
      match: {
        'taxon.input_group_id': speciesGroup,
      },
    });
  }

  const squareSizeInKm = squareSize / 1000;

  return JSON.stringify({
    size: 0,
    query: {
      bool: {
        must,
        filter: {
          geo_bounding_box: {
            'location.point': {
              top_left: { lat: northWest.lat, lon: northWest.lng },
              bottom_right: { lat: southEast.lat, lon: southEast.lng },
            },
          },
        },
      },
    },
    aggs: {
      by_srid: {
        terms: { field: 'location.grid_square.srid', size: 1000 },
        aggs: {
          by_square: {
            terms: {
              field: `location.grid_square.${squareSizeInKm}km.centre`,
              size: 100000,
            },
          },
        },
      },
    },
    sort: [{ 'event.date_start': 'desc' }],
  });
};

export async function fetchSquares(
  options: SquareQueryOptions
): Promise<Square[] | null> {
  if (requestCancelToken) {
    requestCancelToken.cancel();
  }

  requestCancelToken = axios.CancelToken.source();

  const OPTIONS: AxiosRequestConfig = {
    method: 'post',
    url: CONFIG.backend.occurrenceServiceURL,
    headers: {
      authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    timeout: 80000,
    cancelToken: requestCancelToken.token,
    data: getSquaresQuery(options),
  };

  let records = [];

  try {
    const { data } = await axios(OPTIONS);

    records = data;
  } catch (error: any) {
    if (axios.isCancel(error)) return null;

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }

  const addSize = (square: Square): Square => ({
    ...square,
    size: options.squareSize,
  });

  const squares =
    records?.aggregations?.by_srid?.buckets[0]?.by_square?.buckets.map(addSize);

  return squares || [];
}
