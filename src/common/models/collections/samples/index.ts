import { SampleCollection } from '@flumens';
import appModel from '../../app';
import Sample from '../../sample';
import { samplesStore } from '../../store';
import userModel from '../../user';
import remotePullExtInit, { Verification } from './savedSamplesRemotePullExt';

console.log('SavedSamples: initializing');

const samples: SampleCollection<Sample> & { verified: Verification } =
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
  await Promise.all(samples.map(getUploadPromise)).catch(processError);

  console.log('SavedSamples: all records were uploaded!');
}

export function removeAllSynced() {
  console.log('SavedSamples: removing all synced samples.');

  const destroy = (sample: Sample) =>
    !sample.syncedAt ? null : sample.destroy();
  const toWait = samples.map(destroy);

  return Promise.all(toWait);
}

remotePullExtInit(samples, userModel, appModel);

export function getPending() {
  const byUploadStatus = (sample: Sample) => !sample.syncedAt;

  return samples.filter(byUploadStatus);
}

export default samples;
