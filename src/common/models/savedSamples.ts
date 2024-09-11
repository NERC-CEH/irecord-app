import { initStoredSamples } from '@flumens';
import appModel from './app';
import Sample from './sample';
import remotePullExtInit, { Verification } from './savedSamplesRemotePullExt';
import { modelStore } from './store';
import userModel from './user';

console.log('SavedSamples: initializing');

type Collection = Sample[] & {
  ready: Promise<any>;
  resetDefaults: any;

  verified: Verification;
};

const savedSamples: Collection = initStoredSamples(modelStore, Sample);

// eslint-disable-next-line
export async function uploadAllSamples(toast: any) {
  console.log('SavedSamples: uploading all.');
  const getUploadPromise = (s: Sample) =>
    !s.isUploaded() && s.metadata.saved && s.upload();

  const processError = (err: any) => {
    if (err.isHandled) return;
    toast.error(err);
  };
  await Promise.all(savedSamples.map(getUploadPromise)).catch(processError);

  console.log('SavedSamples: all records were uploaded!');
}

export function removeAllSynced() {
  console.log('SavedSamples: removing all synced samples.');

  const destroy = (sample: Sample) =>
    !sample.metadata.syncedOn ? null : sample.destroy();
  const toWait = savedSamples.map(destroy);

  return Promise.all(toWait);
}

remotePullExtInit(savedSamples, userModel, appModel);

export function getPending() {
  const byUploadStatus = (sample: Sample) => !sample.metadata.syncedOn;

  return savedSamples.filter(byUploadStatus);
}

export default savedSamples;
