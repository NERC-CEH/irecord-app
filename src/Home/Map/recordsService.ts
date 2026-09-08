import axios, { type AxiosRequestConfig, type CancelTokenSource } from 'axios';
import { HandledError, isAxiosNetworkError, ElasticOccurrence } from '@flumens';
import CONFIG from 'common/config';
import { matchAppSurveys } from 'common/services/ES';
import userModel from 'models/user';

export type Square = {
  key: string;
  doc_count: number;
  size: number; // in meters
};

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

const notTraining = {
  match: {
    'metadata.trial': 'false',
  },
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
  const must: Record<string, unknown>[] = [matchAppSurveys, notTraining];

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

let requestCancelToken: CancelTokenSource | undefined;

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

  let records: ElasticOccurrence[] = [];

  try {
    const { data: response } = await axios<{
      hits: { hits: { _source: ElasticOccurrence }[] };
    }>(OPTIONS);
    const data = response.hits.hits.map(hit => hit._source);
    // TODO: validate the response is correct

    records = data;
  } catch (error) {
    if (axios.isCancel(error)) return null;

    if (axios.isAxiosError(error) && isAxiosNetworkError(error))
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
  const must: Record<string, unknown>[] = [matchAppSurveys, notTraining];

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

  let response: {
    aggregations?: {
      by_srid?: {
        buckets: { by_square?: { buckets: Omit<Square, 'size'>[] } }[];
      };
    };
  } = {};

  try {
    ({ data: response } = await axios<typeof response>(OPTIONS));
  } catch (error) {
    if (axios.isCancel(error)) return null;

    if (axios.isAxiosError(error) && isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }

  const addSize = (square: Omit<Square, 'size'>): Square => ({
    ...square,
    size: options.squareSize,
  });

  const squares =
    response.aggregations?.by_srid?.buckets[0]?.by_square?.buckets.map(addSize);

  return squares || [];
}
