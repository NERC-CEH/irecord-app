import { SampleCollection } from '@flumens';
import appModel from './app';
import Sample from './sample';
import remotePullExtInit, { Verification } from './savedSamplesRemotePullExt';
import { samplesStore } from './store';
import userModel from './user';

console.log('SavedSamples: initializing');

const savedSamples: SampleCollection<Sample> & { verified: Verification } =
  new SampleCollection({
    store: samplesStore,
    Model: Sample,
  }) as any;

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
    !sample.syncedAt ? null : sample.destroy();
  const toWait = savedSamples.map(destroy);

  return Promise.all(toWait);
}

remotePullExtInit(savedSamples, userModel, appModel);

export function getPending() {
  const byUploadStatus = (sample: Sample) => !sample.syncedAt;

  return savedSamples.filter(byUploadStatus);
}

export default savedSamples;
