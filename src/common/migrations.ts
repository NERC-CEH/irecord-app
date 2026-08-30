/* eslint-disable no-restricted-syntax */
import { migrateOldAttr, Migration, SampleCollection } from '@flumens';
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

const preserveMigratedValue = (metadata: any, key: string, value: any) => {
  if (value === undefined) return;
  const migrated = metadata._migrated || {};
  migrated[key] = clone(value);
  Object.assign(metadata, { _migrated: migrated });
};

const deleteOldAttrs = (
  model: { data: Record<string, any>; metadata: Record<string, any> },
  attrs: string[]
) => {
  attrs.forEach(attr => {
    preserveMigratedValue(model.metadata, attr, model.data[attr]);
    Reflect.deleteProperty(model.data, attr);
  });
};

const migrateLocation = (sample: any) => {
  const { data, metadata } = sample;
  const { location } = data;
  if (location?.name !== undefined) {
    data.locationName ??= location.name;
    preserveMigratedValue(metadata, 'location.name', location.name);
    delete location.name;
  }
  if (location?.geocoded !== undefined) {
    metadata.geocoded ??= location.geocoded;
    preserveMigratedValue(metadata, 'location.geocoded', location.geocoded);
    delete location.geocoded;
  }
};

export const migrateSampleTree = (sample: any) => {
  migrateLocation(sample);

  const { data, metadata } = sample;
  const { date } = data;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(date)) {
    preserveMigratedValue(metadata, 'date', date);
    data.date = date.slice(0, 10);
  }

  sample.samples.forEach(migrateSampleTree);
};

export const getSampleTaxa = (sample: Sample) => {
  const hasTaxonGroup = sample.occurrences[0]?.data.taxon?.group !== undefined;
  return hasTaxonGroup
    ? sample.getSurvey().taxa
    : (sample.metadata as any).taxa || sample.getSurvey().taxa;
};

const migrateDefaultNumberAttrs = (occ: Occurrence) => {
  migrateOldAttr(occ, defaultNumberAttrOld, defaultNumberAttr);
  migrateOldAttr(occ, defaultNumberRangesAttrOld, defaultNumberRangesAttr);
};

export const plantFungiNumberRangesAttrOld = {
  id: 'number-ranges',
  remote: {
    id: 523,
    values: [
      { isPlaceholder: true, title: 'Ranges' },
      { value: '1', id: 665 },
      { value: '2-5', id: 666 },
      { value: '6-20', id: 667 },
      { value: '21-100', id: 668 },
      { value: '101-500', id: 669 },
      { value: '500+', id: 670 },
    ],
  },
} as const;

export const plantFungiNumberDAFORAttrOld = {
  id: 'numberDAFOR',
  remote: {
    id: 2,
    values: [
      { value: 'Dominant', id: 1 },
      { value: 'Abundant', id: 2 },
      { value: 'Frequent', id: 3 },
      { value: 'Occasional', id: 4 },
      { value: 'Rare', id: 5 },
    ],
  },
} as const;

export const plantFungiNumberAttrOld = {
  id: 'number',
  remote: { id: 16 },
} as const;

export const migrateOldPlantFungiAbundanceAttrs = (occ: Occurrence) => {
  migrateOldAttr(occ, plantFungiNumberAttrOld, { id: 'occAttr:16' });
  migrateOldAttr(occ, plantFungiNumberDAFORAttrOld, { id: 'occAttr:2' });
  migrateOldAttr(occ, plantFungiNumberRangesAttrOld, { id: 'occAttr:523' });
};

const migrateCommonDefaultOccAttrs = (occ: Occurrence) => {
  migrateOldAttr(occ, defaultSexAttrOld, defaultSexAttr);
  migrateOldAttr(occ, identifiersAttrOld, identifiersAttr);
};

const migrateDefaultSampleAttrs = (sample: Sample, taxa?: string) => {
  if (taxa === 'bryophytes') {
    migrateOldAttr(sample, habitatAttrOld, habitatAttr);
  }

  if (taxa === 'dragonflies') {
    migrateOldAttr(sample, siteAttrOld, siteAttr);
  }
};

const migrateDefaultOccAttrs = (occ: Occurrence, taxa?: string) => {
  migrateCommonDefaultOccAttrs(occ);

  if (taxa === 'arthropods') {
    migrateDefaultNumberAttrs(occ);
    migrateOldAttr(occ, arthropodStageAttrOld, arthropodStageAttr);
    return;
  }

  if (taxa === 'birds') {
    migrateDefaultNumberAttrs(occ);
    migrateOldAttr(occ, birdStageAttrOld, birdStageAttr);
    migrateOldAttr(occ, breedingAttrOld, breedingAttr);
    return;
  }

  if (taxa === 'bryophytes') {
    migrateOldAttr(
      occ,
      microscopicallyCheckedAttrOld,
      microscopicallyCheckedAttr
    );
    migrateOldAttr(occ, fruitAttrOld, fruitAttr);
    migrateOldAttr(occ, maleAttrOld, maleAttr);
    migrateOldAttr(occ, femaleAttrOld, femaleAttr);
    migrateOldAttr(occ, bulbilsAttrOld, bulbilsAttr);
    migrateOldAttr(occ, gemmaeAttrOld, gemmaeAttr);
    migrateOldAttr(occ, tubersAttrOld, tubersAttr);
    deleteOldAttrs(occ, ['stage', 'sex']);
    return;
  }

  if (taxa === 'butterflies') {
    migrateOldAttr(occ, butterflyNumberAttrOld, butterflyNumberAttr);
    migrateOldAttr(
      occ,
      butterflyNumberRangesAttrOld,
      butterflyNumberRangesAttr
    );
    migrateOldAttr(occ, butterflyStageAttrOld, butterflyStageAttr);
    migrateOldAttr(occ, butterflySexAttrOld, butterflySexAttr);
    return;
  }

  if (taxa === 'dragonflies') {
    migrateOldAttr(occ, adCountAttrOld, adCountAttr);
    migrateOldAttr(occ, coCountAttrOld, coCountAttr);
    migrateOldAttr(occ, ovCountAttrOld, ovCountAttr);
    migrateOldAttr(occ, scCountAttrOld, scCountAttr);
    migrateOldAttr(occ, laCountAttrOld, laCountAttr);
    migrateOldAttr(occ, exCountAttrOld, exCountAttr);
    migrateOldAttr(occ, emCountAttrOld, emCountAttr);
    deleteOldAttrs(occ, ['stage', 'sex']);
    return;
  }

  if (taxa === 'mammals') {
    migrateDefaultNumberAttrs(occ);
    migrateOldAttr(occ, mammalStageAttrOld, mammalStageAttr);
    return;
  }

  if (taxa === 'moths') {
    migrateDefaultNumberAttrs(occ);
    migrateOldAttr(occ, mothStageAttrOld, defaultMothStageAttr);
    return;
  }

  if (taxa === 'plants-fungi') {
    migrateOldPlantFungiAbundanceAttrs(occ);
    migrateOldAttr(occ, plantStageAttrOld, plantStageAttr);
    return;
  }

  if (taxa === 'reptiles') {
    migrateDefaultNumberAttrs(occ);
    migrateOldAttr(occ, reptileStageAttrOld, reptileStageAttr);
    return;
  }

  migrateDefaultNumberAttrs(occ);
  migrateOldAttr(occ, defaultStageAttrOld, defaultStageAttr);
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

      const samples = new SampleCollection<Sample>({
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

        migrateSampleTree(sample);

        if (isDefaultSurvey || isListSurvey || isMothSurvey)
          migrateOldAttr(sample, recorderAttrOld, recorderAttr);

        if (isPlantSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          const data = sample.data as any;
          migrateOldAttr(sample, { id: 'recorders' }, recordersAttr);
          const newRecorders = data[recordersAttr.id];
          if (newRecorders?.length) {
            data[recordersCountAttr.id] = getRecorderCount(newRecorders);
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
            deleteOldAttrs(sample, ['vice-county']);
          }

          for (const subSample of sample.samples) {
            for (const occurrence of subSample.occurrences) {
              migrateOldAttr(occurrence, plantStageAttrOld, plantStageAttr);
              migrateOldAttr(occurrence, statusAttrOld, statusAttr);

              const occData = occurrence.data as any;
              if (occData.abundance !== undefined && occData.abundance !== '') {
                occData[abundanceAttr.id] =
                  typeof occData.abundance === 'string'
                    ? occData.abundance.toUpperCase()
                    : occData.abundance;
                deleteOldAttrs(occurrence, ['abundance']);
              }
              migrateOldAttr(
                occurrence,
                { id: 'identifiers' },
                plantOccIdentifiersAttr
              );
            }
          }

          // eslint-disable-next-line no-await-in-loop
          await sample.save();
        }

        if (isMothSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          migrateOldAttr(sample, methodAttrOld, methodAttr);

          for (const occ of sample.occurrences) {
            migrateOldAttr(occ, numberAttrOld, numberAttr);
            migrateOldAttr(occ, mothStageAttrOld, mothStageAttr);
            migrateOldAttr(occ, sexAttrOld, sexAttr);
            migrateOldAttr(occ, identifiersAttrOld, mothIdentifiersAttr);
          }

          // eslint-disable-next-line no-await-in-loop
          await sample.save();
        }

        if (isDefaultSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          const taxa = getSampleTaxa(sample);
          migrateDefaultSampleAttrs(sample, taxa);
          for (const occ of sample.occurrences) {
            migrateDefaultOccAttrs(occ, taxa);
          }

          // eslint-disable-next-line no-await-in-loop
          await sample.save();
        }

        if (isListSurvey) {
          console.log('🔵 Migrating sample', sample.cid);

          for (const subSample of sample.samples) {
            const taxa = getSampleTaxa(subSample);
            migrateDefaultSampleAttrs(subSample, taxa);
            for (const occ of subSample.occurrences) {
              migrateDefaultOccAttrs(occ, taxa);
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
