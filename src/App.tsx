import React, { useState, useMemo } from 'react';
import { GameRunState } from './types';
import { RunManager, MapSystem, RoomNode, RoomType } from './game/MetaSystems';
import { BattleScreen } from './screens/BattleScreen';
import { MapScreen } from './screens/MapScreen';
import { ShopScreen } from './screens/ShopScreen';
import { INITIAL_ENEMIES } from './game/initialData';
import { AnimatePresence, motion } from 'motion/react';
import { MuteButton } from './components/MuteButton';
import { soundService } from './services/SoundService';

type Screen = 'START' | 'MAP' | 'BATTLE' | 'SHOP' | 'REST' | 'EVENT';

export default function App() {
  const [screen, setScreen] = useState<Screen>('START');
  const [runState, setRunState] = useState<GameRunState | null>(null);
  const [map, setMap] = useState<RoomNode[]>([]);
  
  const currentLevelData = useMemo(() => {
    if (!runState) return null;
    // Map index to specific enemy for V1 prototype
    const enemyIdx = runState.currentNodeIndex % INITIAL_ENEMIES.length;
    return INITIAL_ENEMIES[enemyIdx];
  }, [runState]);

  const startNewRun = () => {
    const initialState = RunManager.createInitialState();
    const generatedMap = MapSystem.generateMap();
    setRunState(initialState);
    setMap(generatedMap);
    setScreen('MAP');
  };

  const handleEnterNode = (index: number) => {
    const node = map[index];
    if (node.type === RoomType.BATTLE || node.type === RoomType.BOSS) {
      setScreen('BATTLE');
    } else if (node.type === RoomType.SHOP) {
      setScreen('SHOP');
    } else {
      // Basic fallback for other types in V1
      setRunState(prev => prev ? { ...prev, currentNodeIndex: prev.currentNodeIndex + 1 } : null);
      setScreen('MAP');
    }
  };

  const handleBattleWin = (gold: number) => {
    setRunState(prev => prev ? { 
      ...prev, 
      gold: prev.gold + gold, 
      currentNodeIndex: prev.currentNodeIndex + 1 
    } : null);
    setScreen('MAP');
  };

  const handleShopPurchase = (item: any) => {
    setRunState(prev => {
      if (!prev) return null;
      let nextState = { ...prev, gold: prev.gold - item.price };
      if (item.type === 'CARD') {
        nextState.deck = [...nextState.deck, item.data];
      } else if (item.type === 'RELIC') {
        nextState.relics = [...nextState.relics, item.data];
      } else if (item.type === 'SERVICE') {
        nextState.currentHp = Math.min(nextState.maxHp, nextState.currentHp + 10);
      }
      return nextState;
    });
  };

  const handleLeaveShop = () => {
    setRunState(prev => prev ? { ...prev, currentNodeIndex: prev.currentNodeIndex + 1 } : null);
    setScreen('MAP');
  };

  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden font-sans select-none">
      <AnimatePresence mode="wait">
        {screen === 'START' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: -1 }}
            className="h-full flex flex-col items-center justify-center p-12 bg-bg relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute top-8 right-8 z-20">
              <MuteButton />
            </div>
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-gold rounded-full blur-[120px]" />
               <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-gold rounded-full blur-[120px]" />
            </div>

            <div className="relative mb-16 flex flex-col items-center">
              <motion.div
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '0.2em', opacity: 1 }}
                className="text-[12px] text-accent-gold font-bold uppercase mb-4"
              >
                The High Stakes Roguelike
              </motion.div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[10rem] font-serif font-black text-white italic tracking-tighter leading-none"
              >
                POKER
              </motion.h1>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-serif font-black text-accent-gold italic tracking-widest mt-[-20px] ml-40 border-t border-accent-gold pt-2 pr-4"
              >
                ROGUE
              </motion.div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(194, 162, 101, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { startNewRun(); soundService.play('CLICK'); }}
              className="bg-accent-gold text-black px-20 py-4 rounded font-bold text-xl uppercase tracking-[0.2em] shadow-2xl transition-all"
            >
              Deal the Hand
            </motion.button>
            <div className="mt-12 text-text-muted font-mono text-[10px] tracking-widest uppercase opacity-50">
              V1.0 • ELEGANT DARK THEME
            </div>
          </motion.div>
        )}

        {screen === 'MAP' && runState && (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <MapScreen runState={runState} map={map} onSelectNode={handleEnterNode} />
          </motion.div>
        )}

        {screen === 'BATTLE' && runState && currentLevelData && (
          <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <BattleScreen 
              runState={runState} 
              enemyData={currentLevelData} 
              onWin={handleBattleWin} 
              onLose={() => setScreen('START')} 
            />
          </motion.div>
        )}

        {screen === 'SHOP' && runState && (
          <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <ShopScreen 
              runState={runState} 
              onPurchase={handleShopPurchase} 
              onLeave={handleLeaveShop} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
