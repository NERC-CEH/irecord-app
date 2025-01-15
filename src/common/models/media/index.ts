import { observable } from 'mobx';
import { Capacitor } from '@capacitor/core';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import { Media as MediaOriginal, MediaAttrs } from '@flumens';
import { isPlatform } from '@ionic/react';
import config from 'common/config';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import identifyImage, { Result, Suggestion } from './classifier';

export type ClassifierResult = Result;
export type ClassifierSuggestion = Suggestion;

type Attrs = MediaAttrs & { species: ClassifierResult };

export default class Media extends MediaOriginal {
  declare parent?: Sample | Occurrence;

  declare attrs: Attrs;

  identification = observable({ identifying: false });

  constructor(options: any) {
    super(options);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.remote.url = `${config.backend.indicia.url}/index.php/services/rest`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line
    this.remote.headers = async () => ({
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
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

    const URL = this.attrs.data;

    try {
      if (this.attrs.path) {
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
    const { data: name, path } = this.attrs;

    if (!isPlatform('hybrid') || process.env.NODE_ENV === 'test') {
      return name;
    }

    let pathToFile = config.dataPath;

    // backwards compatible
    if (!path && isPlatform('ios')) {
      pathToFile = config.dataPath.replace('/Documents/', '/Library/NoCloud/');
    }

    return Capacitor.convertFileSrc(`${pathToFile}/${name}`);
  }

  getIdentifiedTaxonThatMatchParent() {
    if (!this.attrs.species || !this.parent) return null;

    const occurrenceWarehouseId = (this.parent as Occurrence).attrs?.taxon
      ?.warehouseId;

    const byWarehouseId = (sp: Suggestion) =>
      sp.warehouseId === occurrenceWarehouseId;
    return this.attrs.species?.suggestions.find(byWarehouseId);
  }

  // eslint-disable-next-line class-methods-use-this
  validateRemote() {
    return null;
  }

  getSuggestions = () => this.attrs.species?.suggestions || [];

  getTopSpecies = () => this.getSuggestions()[0];

  isIdentifying = () => this.identification.identifying;

  async identify() {
    this.identification.identifying = true;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.uploadFile();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const url = this.getRemoteURL();

      const suggestions = await identifyImage(url);

      this.attrs.species = suggestions;

      if (!this.parent) return;
      this.parent.save();
    } catch (error) {
      this.identification.identifying = false;
      throw error;
    }

    this.identification.identifying = false;
  }
}
