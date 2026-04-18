import { 
  CardRuntime, 
  EnemyRuntime, 
  PlayerBattleState, 
  ComboResult, 
  ComboType,
  CardEffectType,
  WeaponStaticData,
  RelicStaticData
} from '../types';
import { generateId } from '../lib/utils';
import { CardFactory } from './CardFactory';

export class BattleEngine {
  static createPlayer(maxHp: number = 50): PlayerBattleState {
    return {
      currentHp: maxHp,
      maxHp: maxHp,
      armor: 0,
      ap: 2,
      maxAp: 2,
      tidyCount: 1,
      gold: 0
    };
  }

  static createEnemyRuntime(data: any): EnemyRuntime {
    return {
      id: generateId(),
      staticId: data.id,
      name: data.name,
      currentHp: data.maxHp,
      maxHp: data.maxHp,
      currentArmor: data.baseArmor,
      currentIntent: null,
      isCharging: false,
      bleedStacks: 0,
      vulnerableStacks: 0,
      isDead: false,
      tags: data.tags || []
    };
  }

  static resolveBattleAction(
    combo: ComboResult,
    player: PlayerBattleState,
    enemy: EnemyRuntime,
    weapon: WeaponStaticData | null,
    relics: RelicStaticData[]
  ) {
    if (!combo.isValid) return { player, enemy };

    let damage = combo.totalDamage;
    let armorGain = 0;
    let drawCount = 0;
    let bleedApply = 0;
    let vulnerableApply = 0;
    let healAmount = 0;

    // 1. Apply Weapon modifiers
    if (weapon) {
      if (combo.comboType === ComboType.STRAIGHT && weapon.bonusFields.straightMult) {
        damage *= weapon.bonusFields.straightMult;
      }
      if (combo.comboType === ComboType.PAIR) {
        if (weapon.bonusFields.pairMult) damage *= weapon.bonusFields.pairMult;
        if (weapon.bonusFields.pairArmor) armorGain += weapon.bonusFields.pairArmor;
      }
    }

    // 2. Apply Relic modifiers
    relics.forEach(relic => {
      if (combo.comboType === ComboType.SINGLE && relic.bonusFields.singleBonus) {
        damage += relic.bonusFields.singleBonus;
      }
    });

    // 3. Process Card Effects
    combo.cards.forEach(card => {
      card.effects.forEach(effect => {
        switch (effect.type) {
          case CardEffectType.GAIN_ARMOR: armorGain += effect.value; break;
          case CardEffectType.DRAW_CARD: drawCount += effect.value; break;
          case CardEffectType.BLEED: bleedApply += effect.value; break;
          case CardEffectType.VULNERABLE: vulnerableApply += effect.value; break;
          case CardEffectType.HEAL: healAmount += effect.value; break;
          case CardEffectType.DAMAGE_BONUS: damage += effect.value; break;
        }
      });
    });

    // 4. Enemy Vulnerability
    if (enemy.vulnerableStacks > 0) {
      damage = Math.floor(damage * 1.5);
    }

    // 5. Apply Damage to Enemy
    let finalDamage = damage;
    if (enemy.currentArmor > 0) {
      const armorDamage = Math.min(enemy.currentArmor, finalDamage);
      enemy.currentArmor -= armorDamage;
      finalDamage -= armorDamage;
    }
    enemy.currentHp = Math.max(0, enemy.currentHp - finalDamage);
    if (enemy.currentHp <= 0) enemy.isDead = true;

    // 6. Apply Statuses
    enemy.bleedStacks += bleedApply;
    enemy.vulnerableStacks += vulnerableApply;

    // 7. Special Interrupt logic
    if (combo.comboType === ComboType.BOMB && enemy.isCharging) {
      enemy.isCharging = false;
      // You could add extra damage or stun here
    }

    // 8. Update Player
    player.armor += armorGain;
    player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
    // AP cost
    const apCost = (combo.comboType === ComboType.STRAIGHT || combo.comboType === ComboType.BOMB) ? 2 : 1;
    player.ap -= apCost;

    return { player, enemy, drawCount };
  }

  static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
