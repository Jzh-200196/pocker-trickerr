import { CardRank, CardRarity, CardStaticData, CardRuntime, CardEffectType } from '../types';
import { generateId } from '../lib/utils';

export const CARD_TEMPLATES: CardStaticData[] = [
  // Common cards
  { id: 'c1', name: 'Slash', baseRank: CardRank.R3, rarity: CardRarity.COMMON, effects: [] },
  { id: 'c2', name: 'Slash+', baseRank: CardRank.R5, rarity: CardRarity.COMMON, effects: [] },
  { id: 'c3', name: 'Shield Bash', baseRank: CardRank.R4, rarity: CardRarity.COMMON, effects: [{ type: CardEffectType.GAIN_ARMOR, value: 3 }] },
  { id: 'c4', name: 'Lucky Draw', baseRank: CardRank.R6, rarity: CardRarity.COMMON, effects: [{ type: CardEffectType.DRAW_CARD, value: 1 }] },
  { id: 'c5', name: 'Bleeding Edge', baseRank: CardRank.R7, rarity: CardRarity.RARE, effects: [{ type: CardEffectType.BLEED, value: 2 }] },
  { id: 'c6', name: 'Heavy Strike', baseRank: CardRank.R10, rarity: CardRarity.RARE, effects: [{ type: CardEffectType.DAMAGE_BONUS, value: 5 }] },
  { id: 'c7', name: 'Weak Point', baseRank: CardRank.R8, rarity: CardRarity.RARE, effects: [{ type: CardEffectType.VULNERABLE, value: 1 }] },
  { id: 'c8', name: 'Quick Heal', baseRank: CardRank.R9, rarity: CardRarity.EPIC, effects: [{ type: CardEffectType.HEAL, value: 4 }] },
  { id: 'c9', name: 'Ace of Spades', baseRank: CardRank.RA, rarity: CardRarity.LEGENDARY, effects: [{ type: CardEffectType.DAMAGE_BONUS, value: 10 }] },
  // More for variety (as per Prompt 21)
  { id: 'c10', name: 'Standard 4', baseRank: CardRank.R4, rarity: CardRarity.COMMON, effects: [] },
  { id: 'c11', name: 'Standard 8', baseRank: CardRank.R8, rarity: CardRarity.COMMON, effects: [] },
  { id: 'c12', name: 'Standard J', baseRank: CardRank.RJ, rarity: CardRarity.RARE, effects: [] },
  { id: 'c13', name: 'Standard Q', baseRank: CardRank.RQ, rarity: CardRarity.RARE, effects: [] },
  { id: 'c14', name: 'Standard K', baseRank: CardRank.RK, rarity: CardRarity.RARE, effects: [] },
];

export class CardFactory {
  static createRuntime(staticData: CardStaticData): CardRuntime {
    return {
      id: generateId(),
      staticId: staticData.id,
      name: staticData.name,
      currentRank: staticData.baseRank,
      rarity: staticData.rarity,
      effects: [...staticData.effects],
      isKept: false,
      isDiscarded: false,
      isPlayed: false,
    };
  }

  static createFromId(id: string): CardRuntime {
    const template = CARD_TEMPLATES.find(t => t.id === id) || CARD_TEMPLATES[0];
    return this.createRuntime(template);
  }
}
