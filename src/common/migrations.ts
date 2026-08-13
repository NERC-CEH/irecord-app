/* eslint-disable no-restricted-syntax */
import { Migration, SampleCollection } from '@flumens';
import MigrationsManager from '@flumens/utils/dist/MigrationManager';
import {
  arthropodStageAttr,
  arthropodStageAttrOld,
} from 'Survey/Default/config/arthropods';
import {
  breedingAttr,
  breedingAttrOld,
  birdStageAttr,
  birdStageAttrOld,
} from 'Survey/Default/config/birds';
import {
  bulbilsAttr,
  bulbilsAttrOld,
  femaleAttr,
  femaleAttrOld,
  fruitAttr,
  fruitAttrOld,
  gemmaeAttr,
  gemmaeAttrOld,
  habitatAttr,
  habitatAttrOld,
  maleAttr,
  maleAttrOld,
  microscopicallyCheckedAttr,
  microscopicallyCheckedAttrOld,
  tubersAttr,
  tubersAttrOld,
} from 'Survey/Default/config/bryophytes';
import {
  butterflyNumberAttr,
  butterflyNumberAttrOld,
  butterflyNumberRangesAttr,
  butterflyNumberRangesAttrOld,
  butterflySexAttr,
  butterflySexAttrOld,
  butterflyStageAttr,
  butterflyStageAttrOld,
} from 'Survey/Default/config/butterflies';
import {
  numberAttr as defaultNumberAttr,
  numberAttrOld as defaultNumberAttrOld,
  numberRangesAttr as defaultNumberRangesAttr,
  numberRangesAttrOld as defaultNumberRangesAttrOld,
  sexAttr as defaultSexAttr,
  sexAttrOld as defaultSexAttrOld,
  stageAttr as defaultStageAttr,
  stageAttrOld as defaultStageAttrOld,
} from 'Survey/Default/config/common';
import {
  adCountAttr,
  adCountAttrOld,
  coCountAttr,
  coCountAttrOld,
  emCountAttr,
  emCountAttrOld,
  exCountAttr,
  exCountAttrOld,
  laCountAttr,
  laCountAttrOld,
  ovCountAttr,
  ovCountAttrOld,
  scCountAttr,
  scCountAttrOld,
  siteAttr,
  siteAttrOld,
} from 'Survey/Default/config/dragonflies';
import {
  mammalStageAttr,
  mammalStageAttrOld,
} from 'Survey/Default/config/mammals';
import {
  plantFungiNumberAttr,
  plantFungiNumberAttrOld,
  plantFungiNumberDAFORAttr,
  plantFungiNumberDAFORAttrOld,
  plantFungiNumberRangesAttr,
  plantFungiNumberRangesAttrOld,
} from 'Survey/Default/config/plantFungi';
import {
  reptileStageAttr,
  reptileStageAttrOld,
} from 'Survey/Default/config/reptiles';
import {
  methodAttr,
  methodAttrOld,
  mothIdentifiersAttr,
  mothStageAttr,
  numberAttr,
  numberAttrOld,
  sexAttr,
  sexAttrOld,
} from 'Survey/Moth/config';
import {
  abundanceAttr,
  plantOccIdentifiersAttr,
  recordersAttr,
  recordersCountAttr,
  statusAttr,
  statusAttrOld,
  viceCountyAttr,
} from 'Survey/Plant/config';
import {
  identifiersAttr,
  identifiersAttrOld,
  recorderAttr,
  recorderAttrOld,
  mothStageAttr as defaultMothStageAttr,
  mothStageAttrOld,
  plantStageAttr,
  plantStageAttrOld,
} from 'Survey/common/config';
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

const deleteOldAttrs = (record: any, attrs: string[]) => {
  attrs.forEach(attr => Reflect.deleteProperty(record, attr));
};

const migrateLocation = (sample: any) => {
  const { data, metadata } = sample;
  const { location } = data;
  if (location?.name !== undefined) {
    data.locationName ??= location.name;
    delete location.name;
  }
  if (location?.geocoded !== undefined) {
    metadata.geocoded ??= location.geocoded;
    delete location.geocoded;
  }
};

export const migrateLocationTree = (sample: any) => {
  migrateLocation(sample);
  sample.samples.forEach(migrateLocationTree);
};

const migrateDefaultNumberAttrs = (record: any) => {
  migrateOldAttr(record, defaultNumberAttrOld, defaultNumberAttr);
  migrateOldAttr(record, defaultNumberRangesAttrOld, defaultNumberRangesAttr);
};

const migrateCommonDefaultOccAttrs = (record: any) => {
  migrateOldAttr(record, defaultSexAttrOld, defaultSexAttr);
  migrateOldAttr(record, identifiersAttrOld, identifiersAttr);
};

const migrateDefaultSampleAttrs = (record: any, taxa?: string) => {
  if (taxa === 'bryophytes') {
    migrateOldAttr(record, habitatAttrOld, habitatAttr);
  }

  if (taxa === 'dragonflies') {
    migrateOldAttr(record, siteAttrOld, siteAttr);
  }
};

const migrateDefaultOccAttrs = (record: any, taxa?: string) => {
  migrateCommonDefaultOccAttrs(record);

  if (taxa === 'arthropods') {
    migrateDefaultNumberAttrs(record);
    migrateOldAttr(record, arthropodStageAttrOld, arthropodStageAttr);
    return;
  }

  if (taxa === 'birds') {
    migrateDefaultNumberAttrs(record);
    migrateOldAttr(record, birdStageAttrOld, birdStageAttr);
    migrateOldAttr(record, breedingAttrOld, breedingAttr);
    return;
  }

  if (taxa === 'bryophytes') {
    migrateOldAttr(
      record,
      microscopicallyCheckedAttrOld,
      microscopicallyCheckedAttr
    );
    migrateOldAttr(record, fruitAttrOld, fruitAttr);
    migrateOldAttr(record, maleAttrOld, maleAttr);
    migrateOldAttr(record, femaleAttrOld, femaleAttr);
    migrateOldAttr(record, bulbilsAttrOld, bulbilsAttr);
    migrateOldAttr(record, gemmaeAttrOld, gemmaeAttr);
    migrateOldAttr(record, tubersAttrOld, tubersAttr);
    deleteOldAttrs(record, ['stage', 'sex']);
    return;
  }

  if (taxa === 'butterflies') {
    migrateOldAttr(record, butterflyNumberAttrOld, butterflyNumberAttr);
    migrateOldAttr(
      record,
      butterflyNumberRangesAttrOld,
      butterflyNumberRangesAttr
    );
    migrateOldAttr(record, butterflyStageAttrOld, butterflyStageAttr);
    migrateOldAttr(record, butterflySexAttrOld, butterflySexAttr);
    return;
  }

  if (taxa === 'dragonflies') {
    migrateOldAttr(record, adCountAttrOld, adCountAttr);
    migrateOldAttr(record, coCountAttrOld, coCountAttr);
    migrateOldAttr(record, ovCountAttrOld, ovCountAttr);
    migrateOldAttr(record, scCountAttrOld, scCountAttr);
    migrateOldAttr(record, laCountAttrOld, laCountAttr);
    migrateOldAttr(record, exCountAttrOld, exCountAttr);
    migrateOldAttr(record, emCountAttrOld, emCountAttr);
    deleteOldAttrs(record, ['stage', 'sex']);
    return;
  }

  if (taxa === 'mammals') {
    migrateDefaultNumberAttrs(record);
    migrateOldAttr(record, mammalStageAttrOld, mammalStageAttr);
    return;
  }

  if (taxa === 'moths') {
    migrateDefaultNumberAttrs(record);
    migrateOldAttr(record, mothStageAttrOld, defaultMothStageAttr);
    return;
  }

  if (taxa === 'plants-fungi') {
    migrateOldAttr(record, plantFungiNumberAttrOld, plantFungiNumberAttr);
    migrateOldAttr(
      record,
      plantFungiNumberDAFORAttrOld,
      plantFungiNumberDAFORAttr
    );
    migrateOldAttr(
      record,
      plantFungiNumberRangesAttrOld,
      plantFungiNumberRangesAttr
    );
    migrateOldAttr(record, plantStageAttrOld, plantStageAttr);
    return;
  }

  if (taxa === 'reptiles') {
    migrateDefaultNumberAttrs(record);
    migrateOldAttr(record, reptileStageAttrOld, reptileStageAttr);
    return;
  }

  migrateDefaultNumberAttrs(record);
  migrateOldAttr(record, defaultStageAttrOld, defaultStageAttr);
};

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
        const isDefaultSurvey = sample.data.surveyId === 374;
        const isListSurvey = sample.data.surveyId === 576;
        const isPlantSurvey = sample.data.surveyId === 325;
        const isMothSurvey = sample.data.surveyId === 90;

        migrateLocationTree(sample);

        if (isDefaultSurvey || isListSurvey || isMothSurvey)
          migrateOldAttr(sample.data, recorderAttrOld, recorderAttr);

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
            for (const occurrence of subSample.occurrences) {
              migrateOldAttr(
                occurrence.data,
                plantStageAttrOld,
                plantStageAttr
              );
              migrateOldAttr(occurrence.data, statusAttrOld, statusAttr);

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

        if (isMothSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          migrateOldAttr(sample.data, methodAttrOld, methodAttr);

          for (const occurrence of sample.occurrences) {
            migrateOldAttr(occurrence.data, numberAttrOld, numberAttr);
            migrateOldAttr(occurrence.data, mothStageAttrOld, mothStageAttr);
            migrateOldAttr(occurrence.data, sexAttrOld, sexAttr);
            migrateOldAttr(
              occurrence.data,
              identifiersAttrOld,
              mothIdentifiersAttr
            );
          }

          // eslint-disable-next-line no-await-in-loop
          await sample.save();
        }

        if (isDefaultSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          const { taxa } = sample.metadata as any;
          migrateDefaultSampleAttrs(sample.data, taxa);
          for (const occurrence of sample.occurrences) {
            migrateDefaultOccAttrs(occurrence.data, taxa);
          }

          // eslint-disable-next-line no-await-in-loop
          await sample.save();
        }

        if (isListSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          for (const subSample of sample.samples) {
            const { taxa } = subSample.metadata as any;
            migrateDefaultSampleAttrs(subSample.data, taxa);
            for (const occurrence of subSample.occurrences) {
              migrateDefaultOccAttrs(occurrence.data, taxa);
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
