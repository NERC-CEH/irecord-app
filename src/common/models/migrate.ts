import SQLiteDatabase from '@flumens/models/dist/Stores/SQLiteDatabase';
import { isPlatform } from '@ionic/core';
import { db, mainStore, samplesStore } from 'common/models/store';

export default async () => {
  console.log('SQLite migrate: START');
  try {
    await SQLiteDatabase.migrateCordova(isPlatform('ios'));

    await db.init();
    console.log('SQLite migrate: db initialised');

    await mainStore.ready;

    const tables = await db.query({ sql: 'select * from sqlite_schema' });
    const hasGeneric = tables.find((t: any) => t.name === 'generic');
    if (hasGeneric) {
      await db.query({
        sql: `INSERT INTO main (id, cid, data, created_at, updated_at, synced_at)
        SELECT json(value) ->> "$.id",
              key,
              COALESCE(json(value)->>"$.attrs", "{}"),
              COALESCE(json(value) ->> "$.metadata.createdOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              COALESCE(json(value) ->> "$.metadata.updatedOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              json(value) ->> "$.metadata.syncedOn"
        FROM generic;`,
      });

      console.log('SQLite migrate: main migrated');
    }

    await samplesStore.ready;

    const hasModels = tables.find((t: any) => t.name === 'models');
    if (hasModels) {
      await db.query({
        sql: `INSERT INTO samples (id, cid, data, created_at, updated_at, synced_at)
        SELECT
              json(value) ->> "$.id",
              key,
              json(value),
              COALESCE(json(value) ->> "$.metadata.createdOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              COALESCE(json(value) ->> "$.metadata.updatedOn", CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)),
              json(value) ->> "$.metadata.syncedOn"
        FROM models
        ORDER BY id DESC
        WHERE json_extract(value, '$.metadata.syncedOn') IS NULL;`, // don't copy uploaded ones
      });
      console.log('SQLite migrate: samples migrated');
    }
  } catch (error) {
    console.error(error);
    console.log('SQLite migrate: error');
    throw error;
  }

  console.log('SQLite migrate: FINISH');
};
