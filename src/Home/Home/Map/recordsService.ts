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

const getRecordsQuery = (northWest: LatLng, southEast: LatLng) =>
  JSON.stringify({
    size: 1000,
    query: {
      bool: {
        must: [matchAppSurveys],
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

let requestCancelToken: any;

export async function fetchRecords(
  northWest: LatLng,
  southEast: LatLng
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
    data: getRecordsQuery(northWest, southEast),
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

const getSquaresQuery = (
  northWest: LatLng,
  southEast: LatLng,
  squareSize: number
) =>
  JSON.stringify({
    size: 0,
    query: {
      bool: {
        must: [matchAppSurveys],
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
              field: `location.grid_square.${squareSize}km.centre`,
              size: 100000,
            },
          },
        },
      },
    },
  });

export async function fetchSquares(
  northWest: LatLng,
  southEast: LatLng,
  squareSize: number // in meters
): Promise<Square[] | null> {
  if (requestCancelToken) {
    requestCancelToken.cancel();
  }

  requestCancelToken = axios.CancelToken.source();

  const squareSizeInKm = squareSize / 1000;

  const OPTIONS: AxiosRequestConfig = {
    method: 'post',
    url: CONFIG.backend.occurrenceServiceURL,
    headers: {
      authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    timeout: 80000,
    cancelToken: requestCancelToken.token,
    data: getSquaresQuery(northWest, southEast, squareSizeInKm),
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
    size: squareSize,
  });

  const squares =
    records?.aggregations?.by_srid?.buckets[0]?.by_square?.buckets.map(addSize);

  return squares || [];
}
