import { initStoredSamples } from '@flumens';
import { modelStore } from './store';
import Sample from './sample';
import userModel from './user';
import appModel from './app';
import remotePullExtInit, { Verification } from './savedSamplesRemotePullExt';

console.log('SavedSamples: initializing');

type Collection = Sample[] & {
  ready: Promise<any>;
  resetDefaults: any;

  verified: Verification;
};

const savedSamples: Collection = initStoredSamples(modelStore, Sample);

// eslint-disable-next-line
export async function uploadAllSamples() {
  console.log('SavedSamples: uploading all.');
  const getUploadPromise = (s: Sample) => !s.isUploaded() && s.upload();
  await Promise.all(savedSamples.map(getUploadPromise));

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

export default savedSamples;
