export default {
  id: 'dragonflies',
  taxonGroups: [107],
  editForm: ['adCount', 'site', 'siteOther', 'comment'],
};

const numRanges = {
  1: 665,
  '2-5': 666,
  '6-20': 667,
  '21-100': 668,
  '101-500': 669,
  '500+': 670,
  Present: 671,
};

export const attributes = {
  sample: {
    site: {
      id: 59,
      label: 'Site type.',
      default: '',
      values: {
        Lake: 672,
        Reservoir: 673,
        'Mill lodge': 674,
        'Large pond': 675,
        'Small pond': 676,
        'Garden pond': 677,
        River: 678,
        Stream: 679,
        Ditch: 680,
        Canal: 681,
        'Other (please specify)': 682,
      },
    },
    siteOther: {
      type: 'text',
      id: 60,
      label: 'Other Site Type',
    },
  },
  occurrence: {
    adCount: {
      id: 34,
      label: 'Ad.',
      default: '',
      values: numRanges,
    },
    coCount: {
      id: 35,
      label: 'Co.',
      default: '',
      values: numRanges,
    },
    ovCount: {
      id: 36,
      label: 'Ov.',
      default: '',
      values: numRanges,
    },
    laCount: {
      id: 37,
      label: 'La.',
      default: '',
      values: numRanges,
    },
    exCount: {
      id: 38,
      label: 'Ex.',
      default: '',
      values: numRanges,
    },
    emCount: {
      id: 39,
      label: 'Em.',
      default: '',
      values: numRanges,
    },
  },
};
