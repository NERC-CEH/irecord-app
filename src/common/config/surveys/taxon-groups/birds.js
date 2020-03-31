/** ****************************************************************************
 * General survey configuration file.
 **************************************************************************** */
const survey = {
  name: 'birds',
  taxonGroups: [73],

  render: [
    {
      id: 'occ:number',
      label: 'Abundance',
      icon: 'number',
      group: ['occ:number', 'occ:number-ranges'],
    },

    'occ:stage',
    'occ:breeding',
    'occ:sex',
    'occ:identifiers',
  ],

  occ: {
    attrs: {
      breeding: {
        id: 823,
        type: 'radio',
        label: 'Breeding',
        info: 'Please pick the breeding details for this record.',
        values: [
          { value: null, isDefault: true, label: 'Not recorded' },

          { isPlaceholder: true, label: 'Non-breeding' },
          { value: 'X (00): Migration, Flying or Summering', id: 17588 },

          { isPlaceholder: true, label: 'Possible breeding' },
          { value: 'H (01): Nesting habitat', id: 17589 },
          { value: 'S (02): Singing male', id: 17590 },

          { isPlaceholder: true, label: 'Probable breeding' },
          { value: 'P (03): Pair in suitable habitat', id: 17591 },
          { value: 'T (04): Permanent territory', id: 17592 },
          { value: 'D (05): Courtship and display', id: 17593 },
          { value: 'N (06): Visiting probable nest site', id: 17594 },
          { value: 'A (07): Agitated behaviour', id: 17595 },
          { value: 'I (08): Brood patch on incubating adult', id: 17596 },
          { value: 'B (09): Nest building', id: 17597 },

          { isPlaceholder: true, label: 'Confirmed breeding' },
          { value: 'DD (10): Distraction display', id: 17598 },
          { value: 'UN (11): Used nest or eggshells', id: 17599 },
          { value: 'FL (12): Recently fledged', id: 17600 },
          { value: 'ON (13): Occupied nest', id: 17601 },
          { value: 'FF (14): Faecal sac or food', id: 17602 },
          { value: 'NE (15): Nest with eggs', id: 17603 },
          { value: 'NY (16): Nest with young', id: 17604 },
        ],
      },
    },
  },
};

export default survey;
