import { GameRunState, CardStaticData, RelicStaticData, WeaponStaticData, CardRank } from '../types';
import { CARD_TEMPLATES } from './CardFactory';

export class RunManager {
  static createInitialState(): GameRunState {
    return {
      currentHp: 50,
      maxHp: 50,
      gold: 50,
      deck: [
        ...this.getStartingDeck()
      ],
      relics: [],
      weapon: null,
      currentNodeIndex: 0,
      seed: Math.random().toString(36)
    };
  }

  static getStartingDeck(): CardStaticData[] {
    // 10 cards: mostly low ranks for starting challenge
    return [
      CARD_TEMPLATES[0], CARD_TEMPLATES[0], CARD_TEMPLATES[0], // Slash 3
      CARD_TEMPLATES[1], CARD_TEMPLATES[1], // Slash 5
      CARD_TEMPLATES[2], CARD_TEMPLATES[2], // Shield Bash 4
      CARD_TEMPLATES[3], // Lucky Draw 6
      CARD_TEMPLATES[9], // Std 4
      CARD_TEMPLATES[10], // Std 8
    ];
  }
}

export enum RoomType {
  BATTLE = 'Battle',
  SHOP = 'Shop',
  REST = 'Rest',
  EVENT = 'Event',
  BOSS = 'Boss'
}

export interface RoomNode {
  id: string;
  type: RoomType;
  index: number;
}

export class MapSystem {
  static generateMap(): RoomNode[] {
    const map: RoomNode[] = [];
    for (let i = 0; i < 10; i++) {
      let type: RoomType;
      if (i === 4) type = RoomType.BATTLE; // Mini-boss/Elite battle placeholder
      else if (i === 9) type = RoomType.BOSS;
      else {
        const rand = Math.random();
        if (rand < 0.6) type = RoomType.BATTLE;
        else if (rand < 0.8) type = RoomType.SHOP;
        else if (rand < 0.9) type = RoomType.EVENT;
        else type = RoomType.REST;
      }
      map.push({ id: `r-${i}`, type, index: i });
    }
    return map;
  }
}
