import { Capacitor } from '@capacitor/core';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import { Media as MediaOriginal } from '@flumens';
import { isPlatform } from '@ionic/react';
import config from 'common/config';
import type Occurrence from 'models/occurrence';
import type Sample from 'models/sample';
import userModel from 'models/user';

export default class Media extends MediaOriginal {
  declare parent?: Sample | Occurrence;

  constructor(options: any) {
    super({
      ...options,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
    });
  }

  async destroy(silent?: boolean) {
    // remove from internal storage
    if (!isPlatform('hybrid')) {
      if (!this.parent) return;

      this.parent.media.remove(this);

      if (silent) return;

      this.parent.save();
      return;
    }

    const URL = this.data.data;

    try {
      if (this.data.path) {
        // backwards compatible - don't delete old media
        await Filesystem.deleteFile({
          path: URL,
          directory: FilesystemDirectory.Data,
        });
      }

      if (!this.parent) return;

      this.parent.media.remove(this);

      if (silent) return;

      this.parent.save();
    } catch (err) {
      console.error(err);
    }
  }

  getURL() {
    const { data: name, path } = this.data;

    if (
      !isPlatform('hybrid') ||
      process.env.NODE_ENV === 'test' ||
      name?.includes('http')
    ) {
      return name;
    }

    let pathToFile = config.dataPath;

    // backwards compatible
    if (!path && isPlatform('ios')) {
      pathToFile = config.dataPath.replace('/Documents/', '/Library/NoCloud/');
    }

    return Capacitor.convertFileSrc(`${pathToFile}/${name}`);
  }

  validateRemote() {
    return null;
  }
}
