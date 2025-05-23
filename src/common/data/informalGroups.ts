export const groups = {
  65: 'acarine',
  66: 'acorn worm',
  67: 'alga',
  68: 'amphibian',
  69: 'annelid',
  70: 'arrow worm',
  71: 'bacterium',
  72: 'beardworm',
  73: 'bird',
  74: 'bony fish',
  75: 'bryozoan',
  77: 'centipede',
  78: 'clubmoss',
  79: 'coelenterate',
  80: 'comb jelly',
  81: 'conifer',
  82: 'crustacean',
  83: 'diatom',
  84: 'echinoderm',
  85: 'entoproct',
  86: 'false scorpion',
  87: 'fern',
  88: 'flatworm',
  89: 'flower. plant',
  90: 'foraminiferan',
  91: 'fungoid',
  92: 'fungus',
  93: 'gastrotrich',
  94: 'ginkgo',
  95: 'hairworm',
  96: 'harvestman',
  97: 'hornwort',
  218: 'undetermined',
  98: 'horseshoe worm',
  99: 'horsetail',
  100: 'alderfly',
  101: 'beetle',
  102: 'booklouse',
  103: 'bristletail',
  104: 'butterfly',
  105: 'caddis fly',
  106: 'cockroach',
  107: 'dragonfly',
  108: 'earwig',
  109: 'flea',
  111: 'lacewing',
  112: 'louse',
  113: 'mayfly',
  114: 'moth',
  115: 'orthopteran',
  116: 'scorpion fly',
  117: 'silverfish',
  118: 'snakefly',
  119: 'stick insect',
  120: 'stonefly',
  121: 'stylops',
  122: 'thrips',
  123: 'true bug',
  124: 'true fly',
  125: 'jawless fish',
  126: 'lampshell',
  127: 'lancelet',
  128: 'lichen',
  129: 'liverwort',
  130: 'marine mammal',
  131: 'millipede',
  132: 'mollusc',
  133: 'moss',
  134: 'peanut worm',
  135: 'priapulid',
  136: 'protozoan',
  137: 'quillwort',
  138: 'reptile',
  139: 'ribbon worm',
  140: 'rotifer',
  141: 'roundworm',
  142: 'sea spider',
  143: 'slime mould',
  144: 'spider',
  145: 'sponge',
  146: 'spoon worm',
  147: 'springtail',
  148: 'stonewort',
  149: 'symphylan',
  150: 'mammal',
  151: 'tunicate',
  152: 'two-tailed bristletail',
  153: 'unassigned',
  154: 'waterbear',
  159: 'trematode',
  160: 'tapeworm',
  162: 'scorpion',
  110: 'hymenopteran',
  168: 'chromist',
  172: 'gnathostomulid',
  174: 'cycliophoran',
  179: 'proturan',
  181: 'loriciferan',
  182: 'mud dragon',
  188: 'mesozoan',
  191: 'mantis',
  194: 'pauropod',
  76: 'cartilagenous fish',
  219: 'monogenean',
  226: 'thorny-headed worm',
  239: 'cyanobacterium',
  240: 'web-spinner',
  245: 'parasitic roundworm',
} as const;

type Values = (typeof groups)[keyof typeof groups];

export const groupsReverse: Record<Values, number> = Object.fromEntries(
  Object.entries(groups).map(([k, v]) => [v, parseInt(k, 10)])
) as any;
