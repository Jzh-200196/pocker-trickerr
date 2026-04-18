/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CardRank {
  R3 = 3,
  R4 = 4,
  R5 = 5,
  R6 = 6,
  R7 = 7,
  R8 = 8,
  R9 = 9,
  R10 = 10,
  RJ = 11,
  RQ = 12,
  RK = 13,
  RA = 14,
}

export enum CardRarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

export enum CardEffectType {
  DAMAGE_BONUS = 'DamageBonus',
  GAIN_ARMOR = 'GainArmor',
  DRAW_CARD = 'DrawCard',
  BLEED = 'Bleed',
  VULNERABLE = 'Vulnerable',
  HEAL = 'Heal',
  EXTRA_TIDY = 'GainExtraTidy',
}

export enum ComboType {
  SINGLE = 'Single',
  PAIR = 'Pair',
  TRIPLE = 'Triple',
  STRAIGHT = 'Straight',
  BOMB = 'Bomb',
  INVALID = 'Invalid',
}

export enum EnemyIntentType {
  ATTACK = 'Attack',
  DEFEND = 'Defend',
  CHARGE = 'Charge',
  BUFF = 'Buff',
}

export enum WeaponType {
  SHORT_SWORD = 'ShortSword',
  BRACER = 'Bracer',
  MUSKET = 'Musket',
  POWDER_KEG = 'PowderKeg',
}

export interface CardEffect {
  type: CardEffectType;
  value: number;
}

export interface CardStaticData {
  id: string;
  name: string;
  baseRank: CardRank;
  rarity: CardRarity;
  effects: CardEffect[];
}

export interface CardRuntime {
  id: string; // Unique instance ID
  staticId: string;
  currentRank: number;
  isKept: boolean;
  isDiscarded: boolean;
  isPlayed: boolean;
  rarity: CardRarity;
  effects: CardEffect[];
  name: string;
}

export interface EnemyIntent {
  type: EnemyIntentType;
  value: number;
  description: string;
}

export interface EnemyStaticData {
  id: string;
  name: string;
  maxHp: number;
  baseArmor: number;
  intents: EnemyIntent[];
  tags: string[];
}

export interface EnemyRuntime {
  id: string;
  staticId: string;
  name: string;
  currentHp: number;
  maxHp: number;
  currentArmor: number;
  currentIntent: EnemyIntent | null;
  isCharging: boolean;
  bleedStacks: number;
  vulnerableStacks: number;
  isDead: boolean;
  tags: string[];
}

export interface WeaponStaticData {
  id: string;
  name: string;
  description: string;
  type: WeaponType;
  bonusFields: Record<string, number>;
}

export interface RelicStaticData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  bonusFields: Record<string, number>;
}

export interface PlayerBattleState {
  currentHp: number;
  maxHp: number;
  armor: number;
  ap: number;
  maxAp: number;
  tidyCount: number;
  gold: number;
}

export interface ComboResult {
  isValid: boolean;
  comboType: ComboType;
  cards: CardRuntime[];
  mainRank: number;
  length: number;
  totalDamage: number;
  invalidReason?: string;
}

export interface GameRunState {
  currentHp: number;
  maxHp: number;
  gold: number;
  deck: CardStaticData[];
  relics: RelicStaticData[];
  weapon: WeaponStaticData | null;
  currentNodeIndex: number;
  seed: string;
}
