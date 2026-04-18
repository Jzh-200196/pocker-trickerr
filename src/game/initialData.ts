import { EnemyStaticData, EnemyIntentType, WeaponStaticData, WeaponType, RelicStaticData } from '../types';

export const INITIAL_ENEMIES: EnemyStaticData[] = [
  {
    id: 'e1',
    name: 'Shield Guard',
    maxHp: 50,
    baseArmor: 10,
    intents: [
      { type: EnemyIntentType.ATTACK, value: 8, description: 'Shield Bash' },
      { type: EnemyIntentType.DEFEND, value: 12, description: 'Raise Shield' }
    ],
    tags: ['Shield']
  },
  {
    id: 'e2',
    name: 'Crow Swarm',
    maxHp: 30,
    baseArmor: 0,
    intents: [
      { type: EnemyIntentType.ATTACK, value: 12, description: 'Peck' },
      { type: EnemyIntentType.ATTACK, value: 15, description: 'Swoop' }
    ],
    tags: ['Swarm']
  },
  {
    id: 'e3',
    name: 'Executioner',
    maxHp: 120,
    baseArmor: 20,
    intents: [
      { type: EnemyIntentType.ATTACK, value: 10, description: 'Sweep' },
      { type: EnemyIntentType.CHARGE, value: 30, description: 'Guillotine' }
    ],
    tags: ['Charge']
  }
];

export const WEAPONS: WeaponStaticData[] = [
  {
    id: 'w1',
    name: 'Blade of Straights',
    description: 'Straight damage +20%. Draw 1 card after first straight.',
    type: WeaponType.SHORT_SWORD,
    bonusFields: { straightMult: 1.2 }
  },
  {
    id: 'w2',
    name: 'Twin Bracers',
    description: 'Pair damage +10%. Pairs gain +4 Armor.',
    type: WeaponType.BRACER,
    bonusFields: { pairMult: 1.1, pairArmor: 4 }
  }
];

export const RELICS: RelicStaticData[] = [
  {
    id: 'r1',
    name: 'Lucky Coin',
    description: 'Gain 8 gold after each battle.',
    tags: ['Economy'],
    bonusFields: { winGold: 8 }
  },
  {
    id: 'r2',
    name: 'Old Box',
    description: 'Draw 1 extra card at start of battle.',
    tags: ['Utility'],
    bonusFields: { startDraw: 1 }
  },
  {
    id: 'r3',
    name: 'Whetstone',
    description: 'Singles deal +2 damage.',
    tags: ['Combat'],
    bonusFields: { singleBonus: 2 }
  }
];
