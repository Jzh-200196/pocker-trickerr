import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBattle } from '../hooks/useBattle';
import { GameRunState, EnemyStaticData, CardRuntime } from '../types';
import { CardComponent } from '../components/CardComponent';
import { EnemyComponent } from '../components/EnemyComponent';
import { cn } from '../lib/utils';
import { Plus, Minus, Pin, Sword, Volume2, VolumeX } from 'lucide-react';
import { MuteButton } from '../components/MuteButton';
import { soundService } from '../services/SoundService';

interface BattleScreenProps {
  runState: GameRunState;
  enemyData: EnemyStaticData;
  onWin: (goldReward: number) => void;
  onLose: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ runState, enemyData, onWin, onLose }) => {
  const {
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
  } = useBattle(runState, enemyData);

  const [tidyMode, setTidyMode] = useState<boolean>(false);

  const toggleSelect = (cardId: string) => {
    if (tidyMode) {
      return;
    }
    soundService.play('CLICK');
    setSelectedIds(prev => 
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const currentApCost = (previewCombo?.comboType === 'Straight' || previewCombo?.comboType === 'Bomb') ? 2 : 1;
  const canPlay = previewCombo?.isValid && player.ap >= currentApCost && phase === 'PLAYER';

  return (
    <div className="flex flex-col h-full bg-bg text-text-main overflow-hidden font-sans">
      {/* Top Navigation */}
      <nav className="h-[60px] bg-surface border-b border-border flex items-center px-[30px] justify-between z-10">
        <div className="flex gap-[25px] text-[14px] font-semibold tracking-wide h-full items-center">
          <div className="flex items-center"><span className="text-accent-gold mr-1.5 font-bold">HP</span> {player.currentHp} / {player.maxHp}</div>
          <div className="flex items-center"><span className="text-accent-gold mr-1.5 font-bold">GOLD</span> {runState.gold}</div>
          <div className="flex items-center"><span className="text-accent-gold mr-1.5 font-bold">FLOOR</span> {String(runState.currentNodeIndex + 1).padStart(2, '0')} / 10</div>
        </div>

        <div className="flex gap-[25px] text-[14px] font-semibold tracking-wide h-full items-center">
          <div className="flex items-center gap-2">
             <span className="text-text-muted text-[11px] uppercase tracking-widest">Relics:</span> 
             {runState.relics.length > 0 ? (
               runState.relics.map(r => <span key={r.id} className="text-accent-gold">[{r.name}]</span>)
             ) : (
               <span className="text-text-muted opacity-50 italic">None</span>
             )}
          </div>
          <div className="flex items-center gap-2 border-l border-border pl-6">
             <span className="text-text-muted text-[11px] uppercase tracking-widest">Weapon:</span>
             <span className="text-accent-gold">{runState.weapon?.name || 'Standard Issue'}</span>
          </div>
          <div className="border-l border-border pl-6 h-full flex items-center">
             <MuteButton />
          </div>
        </div>
      </nav>

      {/* Battle Arena */}
      <main className={cn(
        "flex-1 flex flex-col items-center pt-[40px] bg-[radial-gradient(circle_at_50%_30%,#1a1a24_0%,#0a0a0c_70%)] relative transition-all duration-300",
        isPlayerHit && "ring-inset ring-[20px] ring-red-500/20 shake-anim"
      )}>
        <motion.div 
          animate={isEnemyAttacking ? { y: 150, scale: 1.15 } : { y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="flex flex-col items-center mb-12 z-20"
        >
          <EnemyComponent enemy={enemy} />
        </motion.div>

        {/* Combo Preview Area */}
        <div className="h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {previewCombo && previewCombo.isValid ? (
              <motion.div 
                key="valid-combo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-[400px] h-[100px] bg-accent-gold/5 border border-dashed border-accent-gold rounded-lg flex flex-col items-center justify-center backdrop-blur-sm"
              >
                <div className="text-accent-gold text-[20px] font-bold tracking-[2px] mb-1 uppercase italic">
                  {previewCombo.comboType}
                </div>
                <div className="flex justify-center gap-[20px] text-[13px] text-text-muted font-medium">
                  <div className="flex items-center gap-1"><span className="text-accent-gold">DAMAGE:</span> {previewCombo.totalDamage}</div>
                  <div className="flex items-center gap-1"><span className="text-accent-gold">AP:</span> {currentApCost}</div>
                  {previewCombo.comboType === 'Bomb' && (
                     <div className="text-accent-red font-bold">EFFECT: INTERRUPT</div>
                  )}
                </div>
              </motion.div>
            ) : selectedIds.length > 0 ? (
              <motion.div 
                key="invalid-combo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-accent-red text-[13px] font-bold uppercase tracking-widest border border-accent-red/30 px-6 py-3 rounded bg-accent-red/5"
              >
                INVALID COMBINATION: {previewCombo?.invalidReason || 'Mismatch'}
              </motion.div>
            ) : (
              <div className="text-text-muted/30 text-[11px] uppercase tracking-[0.3em] italic">
                Select cards to form a combo
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Hand container with gradient */}
        <div className="w-full mt-auto h-[240px] bg-[linear-gradient(0deg,var(--color-surface)_0%,transparent_100%)] flex flex-col items-center justify-end pb-[20px]">
          <div className="flex gap-[15px] mb-[35px] items-end justify-center px-10">
             <AnimatePresence mode="popLayout">
               {hand.map((card, index) => (
                 <motion.div 
                   key={card.id} 
                   layout
                   initial={{ opacity: 0, y: 50, scale: 0.8 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ 
                     opacity: 0, 
                     y: -400, 
                     scale: 0.5,
                     transition: { duration: 0.4, ease: "circIn" }
                   }}
                   className="relative group"
                 >
                    <CardComponent 
                      card={card} 
                      isSelected={selectedIds.includes(card.id)}
                      isSelectable={phase === 'PLAYER' && !tidyMode}
                      onClick={() => toggleSelect(card.id)}
                    />
                    
                    {/* Tidy Options overlay */}
                    {tidyMode && player.tidyCount > 0 && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 p-3 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                         <button 
                          onClick={() => { handleTidyAction('DISCARD_DRAW', card.id); setTidyMode(false); }}
                          className="w-full py-1.5 bg-accent-red text-white text-[10px] font-bold rounded uppercase tracking-tighter"
                         >
                           REDRAW
                         </button>
                         <div className="flex gap-1 w-full">
                           <button 
                            onClick={() => { handleTidyAction('ADJUST_RANK', card.id, 1); setTidyMode(false); }}
                            className="flex-1 py-1.5 bg-accent-gold text-black text-[10px] font-bold rounded"
                           >
                             +1
                           </button>
                           <button 
                            onClick={() => { handleTidyAction('ADJUST_RANK', card.id, -1); setTidyMode(false); }}
                            className="flex-1 py-1.5 bg-accent-gold text-black text-[10px] font-bold rounded"
                           >
                             -1
                           </button>
                         </div>
                         <button 
                          onClick={() => { handleTidyAction('KEEP', card.id); setTidyMode(false); }}
                          className="w-full py-1.5 bg-text-muted text-white text-[10px] font-bold rounded uppercase tracking-tighter"
                         >
                           KEEP
                         </button>
                      </div>
                    )}
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>

          {/* Control Bar */}
          <div className="w-full px-[30px] flex justify-between items-center">
            <div className="flex items-center gap-[15px]">
               <div className="flex items-center gap-[10px] font-semibold text-[13px] text-text-main">
                  AP: 
                  <div className="flex gap-1.5">
                    {Array.from({ length: player.maxAp }).map((_, i) => (
                      <div key={i} className={cn(
                        "w-[12px] h-[12px] rounded-full transition-all",
                        i < player.ap ? "bg-accent-gold shadow-[0_0_8px_#c2a265]" : "bg-[#333]"
                      )} />
                    ))}
                  </div>
               </div>
               <div className="bg-border/50 text-text-muted text-[11px] px-[12px] py-[4px] rounded-full border border-border uppercase tracking-widest font-bold">
                 TIDY: {player.tidyCount}/{1}
               </div>
            </div>

            <div className="flex gap-[15px]">
              <button 
                disabled={player.tidyCount <= 0 || phase !== 'PLAYER'}
                onClick={() => { soundService.play('CLICK'); setTidyMode(!tidyMode); }}
                className="px-[24px] py-[12px] rounded border border-border text-text-main text-[13px] font-semibold uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-30 disabled:grayscale"
              >
                {tidyMode ? 'CANCEL TIDY' : 'TIDY HAND'}
              </button>
              
              <button
                disabled={!canPlay}
                onClick={() => { handlePlayCombo(); soundService.play('CLICK'); }}
                className={cn(
                  "px-[24px] py-[12px] rounded text-[13px] font-bold uppercase tracking-widest transition-all",
                  canPlay ? "bg-accent-gold text-black shadow-lg hover:brightness-110" : "bg-gray-800 text-gray-600 cursor-not-allowed"
                )}
              >
                PLAY COMBO
              </button>

              <button
                onClick={() => { endTurn(); soundService.play('CLICK'); }}
                disabled={phase !== 'PLAYER'}
                className="px-[24px] py-[12px] rounded border border-border text-text-muted text-[13px] font-semibold uppercase tracking-widest transition-all hover:text-white"
              >
                END TURN
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Overlays (Win/Lose) */}
      <AnimatePresence>
        {phase === 'WIN' && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center backdrop-blur-2xl"
           >
             <motion.div
               initial={{ scale: 0.8, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="flex flex-col items-center text-center p-12 border border-accent-gold/30 bg-surface rounded-lg shadow-[0_0_80px_rgba(194,162,101,0.2)]"
             >
               <h1 className="text-8xl font-serif font-black text-white italic tracking-tighter mb-4">VICTORY</h1>
               <p className="text-accent-gold font-mono text-[10px] tracking-[0.5em] uppercase mb-12">The House has been humbled</p>
               <button 
                 onClick={() => onWin(20)}
                 className="bg-accent-gold text-black px-16 py-4 rounded font-bold text-lg hover:brightness-110 transition-all uppercase tracking-[0.2em] shadow-2xl"
               >
                 CLAIM SPOILS
               </button>
             </motion.div>
           </motion.div>
        )}
        {phase === 'LOSE' && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center backdrop-blur-2xl"
           >
             <motion.div
               initial={{ scale: 0.8 }}
               animate={{ scale: 1 }}
               className="flex flex-col items-center text-center p-12 border border-accent-red/20 bg-surface rounded-lg shadow-[0_0_80px_rgba(230,74,74,0.15)]"
             >
               <h1 className="text-8xl font-serif font-black text-white italic tracking-tighter mb-4">BUSTED</h1>
               <p className="text-accent-red font-mono text-[10px] tracking-[0.5em] uppercase mb-12">Luck has run dry</p>
               <button 
                 onClick={onLose}
                 className="bg-accent-red text-white px-16 py-4 rounded font-bold text-lg hover:brightness-110 transition-all uppercase tracking-[0.2em] shadow-2xl"
               >
                 RETIRE SESSION
               </button>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
