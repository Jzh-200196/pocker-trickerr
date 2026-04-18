import { useState, useEffect, useCallback } from 'react';
import { 
  CardRuntime, 
  EnemyRuntime, 
  PlayerBattleState, 
  ComboResult, 
  ComboType,
  GameRunState,
  EnemyStaticData,
  EnemyIntentType
} from '../types';
import { CardFactory } from '../game/CardFactory';
import { BattleEngine } from '../game/BattleEngine';
import { ComboDetector } from '../game/ComboDetector';
import { INITIAL_ENEMIES } from '../game/initialData';
import confetti from 'canvas-confetti';

import { soundService } from '../services/SoundService';

export function useBattle(runState: GameRunState, enemyData: EnemyStaticData) {
  // ... existing states ...
  const [drawPile, setDrawPile] = useState<CardRuntime[]>([]);
  const [hand, setHand] = useState<CardRuntime[]>([]);
  const [discardPile, setDiscardPile] = useState<CardRuntime[]>([]);
  
  const [player, setPlayer] = useState<PlayerBattleState>(BattleEngine.createPlayer(runState.currentHp));
  const [enemy, setEnemy] = useState<EnemyRuntime>(BattleEngine.createEnemyRuntime(enemyData));
  const [turn, setTurn] = useState<number>(1);
  const [phase, setPhase] = useState<'PLAYER' | 'ENEMY' | 'WIN' | 'LOSE'>('PLAYER');
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewCombo, setPreviewCombo] = useState<ComboResult | null>(null);

  // Initialize deck
  useEffect(() => {
    const runtimeDeck = runState.deck.map(d => CardFactory.createRuntime(d));
    const shuffled = BattleEngine.shuffle(runtimeDeck);
    
    const startingHand = shuffled.slice(0, 6);
    const rest = shuffled.slice(6);
    
    setHand(startingHand);
    setDrawPile(rest);
    soundService.play('CARD_DRAW');
    
    const firstIntent = enemyData.intents[Math.floor(Math.random() * enemyData.intents.length)];
    setEnemy(prev => ({
      ...prev,
      currentIntent: firstIntent,
      isCharging: firstIntent.type === EnemyIntentType.CHARGE
    }));
  }, [enemyData, runState.deck]);

  // Sync combo preview
  useEffect(() => {
    const selectedCards = hand.filter(c => selectedIds.includes(c.id));
    setPreviewCombo(ComboDetector.detectCombo(selectedCards));
  }, [selectedIds, hand]);

  const drawToLimit = useCallback((currentHand: CardRuntime[], currentDraw: CardRuntime[], currentDiscard: CardRuntime[]) => {
    let newHand = [...currentHand];
    let newDraw = [...currentDraw];
    let newDiscard = [...currentDiscard];
    let drawnCount = 0;

    while (newHand.length < 6) {
      if (newDraw.length === 0) {
        if (newDiscard.length === 0) break;
        newDraw = BattleEngine.shuffle(newDiscard);
        newDiscard = [];
      }
      const top = newDraw.shift();
      if (top) {
        newHand.push(top);
        drawnCount++;
      }
    }
    
    if (drawnCount > 0) {
      soundService.play('CARD_DRAW');
    }

    return { newHand, newDraw, newDiscard };
  }, []);

  const handlePlayCombo = () => {
    if (!previewCombo || !previewCombo.isValid) return;
    const apCost = (previewCombo.comboType === ComboType.STRAIGHT || previewCombo.comboType === ComboType.BOMB) ? 2 : 1;
    if (player.ap < apCost) return;

    soundService.play('CARD_PLAY');

    // Resolve battle logic
    const { player: nextPlayer, enemy: nextEnemy, drawCount } = BattleEngine.resolveBattleAction(
      previewCombo,
      player,
      enemy,
      runState.weapon,
      runState.relics
    );

    // SFX based on action
    if (nextEnemy.currentHp < enemy.currentHp) soundService.play('DAMAGE');
    if (nextPlayer.armor > player.armor) soundService.play('SHIELD');

    // Update cards state
    const playedIds = selectedIds;
    const playedCards = hand.filter(c => playedIds.includes(c.id));
    const remainingHand = hand.filter(c => !playedIds.includes(c.id));
    const nextDiscard = [...discardPile, ...playedCards];

    setPlayer(nextPlayer);
    setEnemy(nextEnemy);
    setHand(remainingHand);
    setDiscardPile(nextDiscard);
    setSelectedIds([]);

    // Check win
    if (nextEnemy.currentHp <= 0) {
      setPhase('WIN');
      soundService.play('VICTORY');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleTidyAction = (type: 'DISCARD_DRAW' | 'ADJUST_RANK' | 'KEEP', cardId?: string, rankDelta?: number) => {
    if (player.tidyCount <= 0 || !cardId) return;

    soundService.play('TIDY');
    
    let nextHand = [...hand];
    let nextDiscard = [...discardPile];
    let nextDraw = [...drawPile];

    if (type === 'DISCARD_DRAW') {
      const idx = nextHand.findIndex(c => c.id === cardId);
      if (idx > -1) {
        const discarded = nextHand.splice(idx, 1)[0];
        nextDiscard.push(discarded);
        const { newHand, newDraw, newDiscard: d } = drawToLimit(nextHand, nextDraw, nextDiscard);
        nextHand = newHand;
        nextDraw = newDraw;
        nextDiscard = d;
      }
    } else if (type === 'ADJUST_RANK' && rankDelta) {
      const idx = nextHand.findIndex(c => c.id === cardId);
      if (idx > -1) {
        const newRank = Math.max(3, Math.min(14, nextHand[idx].currentRank + rankDelta));
        nextHand[idx] = { ...nextHand[idx], currentRank: newRank };
      }
    } else if (type === 'KEEP') {
       const idx = nextHand.findIndex(c => c.id === cardId);
       if (idx > -1) {
         nextHand[idx] = { ...nextHand[idx], isKept: true };
       }
    }

    setHand(nextHand);
    setDiscardPile(nextDiscard);
    setDrawPile(nextDraw);
    setPlayer(prev => ({ ...prev, tidyCount: prev.tidyCount - 1 }));
  };

  const endTurn = async () => {
    setPhase('ENEMY');
    
    // 1. Enemy actions
    if (enemy.currentIntent) {
      const intent = enemy.currentIntent;
      let pArmor = player.armor;
      let pHp = player.currentHp;
      let eArmor = enemy.currentArmor;

      if (intent.type === EnemyIntentType.ATTACK || intent.type === EnemyIntentType.CHARGE) {
        setIsEnemyAttacking(true);
        setTimeout(() => setIsEnemyAttacking(false), 500);

        soundService.play('DAMAGE');
        let dmg = intent.value;
        const armorDmg = Math.min(pArmor, dmg);
        pArmor -= armorDmg;
        dmg -= armorDmg;
        pHp = Math.max(0, pHp - dmg);
        
        if (dmg > 0) {
          setIsPlayerHit(true);
          setTimeout(() => setIsPlayerHit(false), 400);
        }

        if (pHp <= 0) {
          setPhase('LOSE');
          soundService.play('DEFEAT');
        }
      } else if (intent.type === EnemyIntentType.DEFEND) {
        soundService.play('SHIELD');
        eArmor += intent.value;
      } else if (intent.type === EnemyIntentType.BUFF) {
         soundService.play('CLICK');
      }
      
      setPlayer(prev => ({ ...prev, currentHp: pHp, armor: pArmor }));
      setEnemy(prev => ({ ...prev, currentArmor: eArmor }));
    }

    // 2. Status effects
    // Bleed at end of enemy turn
    if (enemy.bleedStacks > 0) {
      setEnemy(prev => ({
        ...prev,
        currentHp: Math.max(0, prev.currentHp - prev.bleedStacks),
        bleedStacks: Math.max(0, prev.bleedStacks - 1)
      }));
    }

    // Wait bit for "enemy thinking"
    await new Promise(r => setTimeout(r, 800));

    // 3. Start Next Player Turn
    setTurn(t => t + 1);
    
    // Player turn start: 
    // - Clear temporary armor
    setPlayer(prev => ({ ...prev, armor: 0, ap: 2, tidyCount: 1 }));
    
    // - Discard non-kept cards
    const keptCards = hand.filter(c => c.isKept);
    const nonKept = hand.filter(c => !c.isKept);
    const nextDiscard = [...discardPile, ...nonKept];
    
    // Reset "kept" state for next turn
    const resetKept = keptCards.map(c => ({ ...c, isKept: false }));
    
    // - Draw to 6
    const { newHand, newDraw, newDiscard } = drawToLimit(resetKept, drawPile, nextDiscard);
    
    setHand(newHand);
    setDrawPile(newDraw);
    setDiscardPile(newDiscard);
    
    // - Next enemy intent
    const nextIntent = enemyData.intents[Math.floor(Math.random() * enemyData.intents.length)];
    setEnemy(prev => ({
      ...prev,
      currentIntent: nextIntent,
      isCharging: nextIntent.type === EnemyIntentType.CHARGE
    }));

    setPhase('PLAYER');
  };

  return {
    hand,
    drawPile,
    discardPile,
    player,
    enemy,
    turn,
    phase,
    selectedIds,
    setSelectedIds,
    previewCombo,
    handlePlayCombo,
    handleTidyAction,
    endTurn,
    isEnemyAttacking,
    isPlayerHit
  };
}
