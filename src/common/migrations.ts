/* eslint-disable no-param-reassign, no-restricted-syntax */
import MigrationsManager from '@flumens/utils/dist/MigrationManager';
import config from './config';
import { Migration } from './flumens';
import { db } from './models/store';

const migrations: Migration[] = [
  {
    version: '6.3.0',
    name: 'Move models to new schema',
    up: async () => {
      console.log('🔵 Starting migration to new model schema');

      await db.init();

      try {
        await db.query({ sql: `UPDATE samples SET id = NULL WHERE id is ''` });
        await db.query({ sql: `UPDATE groups SET id = NULL WHERE id is ''` });
      } catch (error) {
        console.debug(
          '🔵 samples/groups table does not exist, skipping migration'
        );
      }

      // await db.sqliteConnection.closeAllConnections();
      console.log('🔵 Migration completed successfully');
    },
  },
];

const newVersion = () => config.version;
const currentVersion = () =>
  window.localStorage.getItem('_lastAppMigratedVersion') || null;

const updateVersion = async (version: string) => {
  window.localStorage.setItem('_lastAppMigratedVersion', version);
};

const migrationManager = new MigrationsManager(
  migrations,
  newVersion,
  currentVersion,
  updateVersion
);

export default migrationManager;
