import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import progressIcon from 'common/images/progress-circles.svg';
import { Survey } from 'Survey/common/config';

const stage = [
  { id: 17657, value: 'Not recorded' },
  { id: 17643, value: 'Adult' },
  { id: 17644, value: 'Pupa' },
  { id: 17645, value: 'Cocoon' },
  { id: 17646, value: 'Exuvia' },
  { id: 17647, value: 'Larva' },
  { id: 20551, value: 'Mine' },
  { id: 17648, value: 'Mine (empty)' },
  { id: 17649, value: 'Mine (tenanted)' },
  { id: 17650, value: 'Case' },
  { id: 17651, value: 'Larval web' },
  { id: 17652, value: 'Nymph' },
  { id: 17653, value: 'Gall' },
  { id: 17654, value: 'Egg' },
  { id: 17655, value: 'Dead' },
  { id: 17656, value: 'Other' },
];

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'arthropods',
  taxaGroups: [
    groups.acarine,
    groups.centipede,
    groups.crustacean,
    groups['false scorpion'],
    groups.harvestman,
    groups.alderfly,
    groups.beetle,
    groups.booklouse,
    groups.bristletail,
    groups.butterfly,
    groups['caddis fly'],
    groups.cockroach,
    groups.dragonfly,
    groups.earwig,
    groups.flea,
    groups.hymenopteran,
    groups.lacewing,
    groups.louse,
    groups.mayfly,
    groups.moth,
    groups.orthopteran,
    groups['scorpion fly'],
    groups.silverfish,
    groups.snakefly,
    groups['stick insect'],
    groups.stonefly,
    groups.stylops,
    groups.thrips,
    groups['true bug'],
    groups['true fly'],
    groups.millipede,
    groups['sea spider'],
    groups.spider,
    groups.springtail,
    groups.symphylan,
    groups['two-tailed bristletail'],
    groups.scorpion,
    groups.mantis,
    groups.pauropod,
    groups['web-spinner'],
  ],

  occ: {
    attrs: {
      stage: {
        menuProps: { icon: progressIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please pick the life stage.',
            inputProps: { options: stage },
          },
        },
        remote: { id: 829, values: stage },
      },
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { required_error: 'Species is missing.' }).nullable(),
        stage: string({ required_error: 'Stage is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
