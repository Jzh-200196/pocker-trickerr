import { CardRuntime, ComboType, ComboResult } from '../types';

export class ComboDetector {
  static detectCombo(selectedCards: CardRuntime[]): ComboResult {
    const len = selectedCards.length;
    
    if (len === 0) {
      return {
        isValid: false,
        comboType: ComboType.INVALID,
        cards: [],
        mainRank: 0,
        length: 0,
        totalDamage: 0,
        invalidReason: 'No cards selected'
      };
    }

    // Sort cards by rank for easier detection
    const sorted = [...selectedCards].sort((a, b) => a.currentRank - b.currentRank);
    const ranks = sorted.map(c => c.currentRank);

    // Single
    if (len === 1) {
      return {
        isValid: true,
        comboType: ComboType.SINGLE,
        cards: sorted,
        mainRank: ranks[0],
        length: 1,
        totalDamage: ranks[0]
      };
    }

    // Pair, Triple, Bomb (Same rank combos)
    const allSame = ranks.every(r => r === ranks[0]);
    if (allSame) {
      if (len === 2) {
        return {
          isValid: true,
          comboType: ComboType.PAIR,
          cards: sorted,
          mainRank: ranks[0],
          length: 2,
          totalDamage: (ranks[0] * 2) + 2 // Base damage formula from prompt
        };
      }
      if (len === 3) {
        return {
          isValid: true,
          comboType: ComboType.TRIPLE,
          cards: sorted,
          mainRank: ranks[0],
          length: 3,
          totalDamage: (ranks[0] * 3) + 4
        };
      }
      if (len === 4) {
        return {
          isValid: true,
          comboType: ComboType.BOMB,
          cards: sorted,
          mainRank: ranks[0],
          length: 4,
          totalDamage: (ranks[0] * 4) + 10
        };
      }
    }

    // Straight
    if (len >= 5) {
      let isStraight = true;
      let hasDuplicates = false;
      
      for (let i = 0; i < len - 1; i++) {
        if (sorted[i + 1].currentRank !== sorted[i].currentRank + 1) {
          isStraight = false;
        }
        if (sorted[i + 1].currentRank === sorted[i].currentRank) {
          hasDuplicates = true;
        }
      }

      if (isStraight) {
        return {
          isValid: true,
          comboType: ComboType.STRAIGHT,
          cards: sorted,
          mainRank: ranks[0],
          length: len,
          totalDamage: len * 3 // Base damage formula
        };
      }

      if (hasDuplicates) {
        return {
          isValid: false,
          comboType: ComboType.STRAIGHT,
          cards: sorted,
          mainRank: 0,
          length: 0,
          totalDamage: 0,
          invalidReason: 'Straight cannot have duplicate ranks'
        };
      }
    }

    // fallback invalid
    return {
      isValid: false,
      comboType: ComboType.INVALID,
      cards: sorted,
      mainRank: 0,
      length: 0,
      totalDamage: 0,
      invalidReason: len > 4 ? 'Not a valid straight or combo' : 'Cards must have same points for Pair/Triple/Bomb'
    };
  }
}
