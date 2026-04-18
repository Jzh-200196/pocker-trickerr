import React from 'react';
import { motion } from 'motion/react';
import { RoomNode, RoomType } from '../game/MetaSystems';
import { GameRunState } from '../types';
import { cn } from '../lib/utils';
import { Sword, ShoppingBag, BedDouble, HelpCircle, Skull, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { MuteButton } from '../components/MuteButton';
import { soundService } from '../services/SoundService';

interface MapScreenProps {
  runState: GameRunState;
  map: RoomNode[];
  onSelectNode: (index: number) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ runState, map, onSelectNode }) => {
  const currentIdx = runState.currentNodeIndex;
  
  return (
    <div className="flex flex-col h-full bg-bg text-text-main p-12 gap-8 items-center overflow-auto relative">
      <div className="absolute top-8 right-8">
        <MuteButton />
      </div>
      <div className="flex flex-col items-center mb-12">
         <h1 className="text-6xl font-serif font-black text-white italic tracking-tighter mb-3">CONQUEST</h1>
         <div className="flex items-center gap-6 text-text-muted font-mono text-[10px] tracking-[0.4em] uppercase">
            <span>Floor {currentIdx + 1} / {map.length}</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-accent-gold">{runState.gold} GOLD</span>
         </div>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {map.map((node, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isUpcoming = i > currentIdx;
          
          return (
            <motion.div
              key={node.id}
              initial={false}
              animate={{ opacity: isUpcoming ? 0.4 : 1 }}
              className={cn(
                "group relative border rounded-lg p-6 flex items-center justify-between transition-all",
                isCurrent 
                  ? "border-accent-gold bg-accent-gold/5 shadow-[0_0_20px_rgba(194,162,101,0.1)]" 
                  : "border-border bg-surface",
                isUpcoming && "opacity-50"
              )}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                   "w-12 h-12 rounded flex items-center justify-center border",
                   isCurrent ? "border-accent-gold text-accent-gold shadow-[0_0_10px_rgba(194,162,101,0.2)]" : "border-border text-text-muted"
                )}>
                   {node.type === RoomType.BATTLE && <Sword size={20} />}
                   {node.type === RoomType.SHOP && <ShoppingBag size={20} />}
                   {node.type === RoomType.REST && <BedDouble size={20} />}
                   {node.type === RoomType.EVENT && <HelpCircle size={20} />}
                   {node.type === RoomType.BOSS && <Skull size={20} className="text-accent-red" />}
                </div>

                <div className="flex flex-col">
                  <span className={cn(
                    "text-[9px] font-bold tracking-widest uppercase mb-0.5",
                    isCurrent ? "text-accent-gold" : "text-text-muted"
                  )}>
                    NODE {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className={cn(
                    "text-xl font-serif font-black italic tracking-wide",
                    isCurrent ? "text-white" : "text-border"
                  )}>
                    {node.type.toUpperCase()}
                  </h3>
                </div>
              </div>

              {isCurrent && (
                <button
                  onClick={() => { onSelectNode(i); soundService.play('CLICK'); }}
                  className="bg-accent-gold text-black px-6 py-2 rounded font-bold text-[11px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
                >
                  ENTER <ChevronRight size={14} />
                </button>
              )}

              {isCompleted && (
                <div className="text-border font-black italic uppercase tracking-widest text-[10px]">
                  VISITED
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
