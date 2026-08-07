/* eslint-disable no-restricted-syntax */
import { Migration, SampleCollection } from '@flumens';
import MigrationsManager from '@flumens/utils/dist/MigrationManager';
import {
  abundanceAttr,
  plantOccIdentifiersAttr,
  recordersAttr,
  recordersCountAttr,
  statusAttr,
  statusAttrOld,
  viceCountyAttr,
} from 'Survey/Plant/config';
import { plantStageAttr, plantStageAttrOld } from 'Survey/common/config';
import config from './config';
import VCs from './data/vice_counties.data.json';
import migrateOldAttr from './migrateOldAttr';
import Occurrence from './models/occurrence';
import Sample from './models/sample';
import { db, samplesStore } from './models/store';

const getRecorderCount = (recorders: any[]) => {
  if (recorders.length === 1) return 7299;
  if (recorders.length === 2) return 7300;
  if (recorders.length <= 5) return 7301;
  if (recorders.length <= 10) return 7302;
  if (recorders.length <= 20) return 7303;
  return 7304;
};

const clone = (value: any) => JSON.parse(JSON.stringify(value));

// Run first migration
// TODO: remove in future when all users have updated
if (!window.localStorage.getItem('_lastAppMigratedVersion'))
  window.localStorage.setItem('_lastAppMigratedVersion', '1.0.0');

const migrations: Migration[] = [
  {
    version: '6.3.0',
    name: 'Move models to new schema',
    up: async () => {
      console.log('🔵 Starting migration to new model schema');

      try {
        await db.query({ sql: "UPDATE samples SET id = NULL WHERE id is ''" });
        await db.query({ sql: "UPDATE groups SET id = NULL WHERE id is ''" });
      } catch (error) {
        console.debug(
          '🔵 samples/groups table does not exist, skipping migration'
        );
      }

      // await db.sqliteConnection.closeAllConnections();
      console.log('🔵 Migration completed successfully');
    },
  },

  {
    version: '6.5.0',
    name: 'Move Plant survey sample attributes to new schema',
    up: async () => {
      console.log('🔵 Starting migration to new attribute schema');

      const samples = new SampleCollection({
        store: samplesStore,
        Model: Sample,
        Occurrence,
      });

      await samples.fetch();

      for (const sample of samples) {
        const isPlantSurvey = sample.data.surveyId === 325;
        if (isPlantSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          const data = sample.data as any;
          const { recorders } = data;
          if (recorders) {
            const newRecorders = clone(recorders);
            data[recordersAttr.id] = newRecorders;
            if (newRecorders.length) {
              data[recordersCountAttr.id] = getRecorderCount(newRecorders);
            }
            delete data.recorders;
          }

          const viceCounty = data['vice-county'];
          if (viceCounty) {
            const byValue = (vc: any) =>
              `${vc.id}` === `${viceCounty}` ||
              vc.name === viceCounty ||
              vc.name === viceCounty.name;
            const VC =
              typeof viceCounty === 'object' ? viceCounty : VCs.find(byValue);
            data[viceCountyAttr.id] = `${VC?.id || viceCounty}`;
            if (VC?.name) data[`${viceCountyAttr.id}:name`] = VC.name;
            delete data['vice-county'];
          }

          for (const subSample of sample.samples) {
            //   migrateOldAttr(subSample.data, 'swell', swellAttrOld, swellAttr);

            for (const occurrence of subSample.occurrences) {
              migrateOldAttr(
                occurrence.data,
                'stage',
                plantStageAttrOld,
                plantStageAttr
              );
              migrateOldAttr(
                occurrence.data,
                'status',
                statusAttrOld,
                statusAttr
              );

              const occData = occurrence.data as any;
              if (occData.abundance !== undefined && occData.abundance !== '') {
                occData[abundanceAttr.id] =
                  typeof occData.abundance === 'string'
                    ? occData.abundance.toUpperCase()
                    : occData.abundance;
                delete occData.abundance;
              }
              if (occData.identifiers) {
                occData[plantOccIdentifiersAttr.id] = clone(
                  occData.identifiers
                );
                delete occData.identifiers;
              }
            }
          }

          // eslint-disable-next-line no-await-in-loop
          await sample.save();
        }
      }

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
