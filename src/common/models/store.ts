import { Store } from '@flumens';
import SQLiteDatabase from '@flumens/models/dist/Stores/SQLiteDatabase';
import { isPlatform } from '@ionic/react';

const web = !isPlatform('hybrid');

export const db = new SQLiteDatabase({ name: 'indicia', web, debug: web });
export const mainStore = new Store({ name: 'main', db });
export const samplesStore = new Store({ name: 'samples', db });
export const groupsStore = new Store({ name: 'groups', db });

if (web) {
  Object.assign(window, { mainStore, samplesStore, groupsStore, db });
}
