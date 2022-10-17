import { initStoredSamples } from '@flumens';
import { modelStore } from './store';
import Sample from './sample';

console.log('SavedSamples: initializing');
const savedSamples = initStoredSamples(modelStore, Sample);

// eslint-disable-next-line
savedSamples.uploadAll = async () => {
  console.log('SavedSamples: uploading all.');
  const getUploadPromise = (s: Sample) => !s.isUploaded() && s.upload();
  await Promise.all(savedSamples.map(getUploadPromise));

  console.log('SavedSamples: all records were uploaded!');
};

export function removeAllSynced() {
  console.log('SavedSamples: removing all synced samples.');

  const destroy = (sample: Sample) =>
    !sample.metadata.syncedOn ? null : sample.destroy();
  const toWait = savedSamples.map(destroy);

  return Promise.all(toWait);
}

export default savedSamples;
