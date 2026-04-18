import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnemyRuntime, EnemyIntentType } from '../types';
import { cn } from '../lib/utils';
import { Shield, Droplets, Heart, Zap, Sword, ShieldAlert } from 'lucide-react';

interface EnemyProps {
  enemy: EnemyRuntime;
}

export const EnemyComponent: React.FC<EnemyProps> = ({ enemy }) => {
  const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;

  return (
    <div className="flex flex-col items-center gap-4 w-64 relative">
      {/* Intent Area - Structured bubble */}
      <div className="h-20 flex flex-col items-center justify-end mb-2">
        <AnimatePresence mode="wait">
          {enemy.currentIntent && (
            <motion.div
              key={enemy.currentIntent.type + enemy.currentIntent.value + enemy.isCharging}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 border rounded shadow-lg backdrop-blur-md",
                enemy.isCharging 
                  ? "bg-accent-red/20 border-accent-red shadow-[0_0_20px_rgba(230,74,74,0.3)] animate-pulse" 
                  : "bg-surface/80 border-border"
              )}
            >
              {/* Type Icon & Value */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-full",
                  enemy.currentIntent.type === EnemyIntentType.ATTACK && "bg-accent-red/20 text-accent-red",
                  enemy.currentIntent.type === EnemyIntentType.DEFEND && "bg-blue-500/20 text-blue-400",
                  enemy.currentIntent.type === EnemyIntentType.CHARGE && "bg-accent-red/30 text-accent-red",
                  enemy.currentIntent.type === EnemyIntentType.BUFF && "bg-purple-500/20 text-purple-400"
                )}>
                  {enemy.currentIntent.type === EnemyIntentType.ATTACK && <Sword size={16} />}
                  {enemy.currentIntent.type === EnemyIntentType.DEFEND && <Shield size={16} />}
                  {enemy.currentIntent.type === EnemyIntentType.CHARGE && <ShieldAlert size={18} />}
                  {enemy.currentIntent.type === EnemyIntentType.BUFF && <Zap size={16} />}
                </div>
                
                {enemy.currentIntent.value > 0 && (
                  <span className={cn(
                    "text-xl font-mono font-bold",
                    enemy.isCharging ? "text-white" : "text-text-main"
                  )}>
                    {enemy.currentIntent.value}
                  </span>
                )}
              </div>

              {/* Action Name */}
              <span className={cn(
                "text-[9px] font-mono uppercase tracking-[0.2em] font-bold",
                enemy.isCharging ? "text-accent-red" : "text-text-muted"
              )}>
                {enemy.currentIntent.description}
              </span>

              {/* Charging Badge */}
              {enemy.isCharging && (
                <div className="absolute -top-3 bg-accent-red text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-tighter shadow-sm">
                  CHARGING
                </div>
              )}

              {/* Triangle pointer */}
              <div className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b",
                enemy.isCharging ? "bg-accent-red/20 border-accent-red" : "bg-surface/80 border-border"
              )} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visual representation */}
      <div className="relative">
        <motion.div
          animate={enemy.isCharging ? { 
            scale: [1, 1.08, 1],
            rotate: [-2, 2, -2],
            filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
          } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={cn(
            "w-[120px] h-[120px] bg-surface rounded-xl flex items-center justify-center border-2 relative overflow-hidden shadow-2xl transition-all duration-500",
            enemy.isCharging ? "border-accent-red shadow-[0_0_40px_rgba(230,74,74,0.4)]" : "border-border"
          )}
        >
          {/* Subtle background glow for charging */}
          {enemy.isCharging && (
            <div className="absolute inset-0 bg-accent-red/20 animate-pulse" />
          )}

          <div className="text-5xl text-gray-500 font-bold opacity-20 select-none relative z-10">
            {enemy.name.charAt(0)}
          </div>
          
          {/* Statuses overlay */}
          <div className="absolute top-1 right-1 flex flex-col gap-1 z-20">
            {enemy.bleedStacks > 0 && <div className="text-accent-red bg-black/60 rounded p-0.5"><Droplets size={12} /></div>}
            {enemy.vulnerableStacks > 0 && <div className="text-purple-500 bg-black/60 rounded p-0.5"><Zap size={12} /></div>}
          </div>
        </motion.div>
        
        {/* Charging aura rings */}
        {enemy.isCharging && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-2 border-accent-red rounded-xl pointer-events-none" 
            />
            <motion.div 
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="absolute inset-0 border border-accent-red rounded-xl pointer-events-none" 
            />
          </>
        )}
      </div>

      {/* HP Bar */}
      <div className="w-[240px]">
        <div className="w-full h-2.5 bg-[#222] rounded-full overflow-hidden mb-1">
           <motion.div
             initial={false}
             animate={{ width: `${hpPercent}%` }}
             className="h-full bg-accent-red"
           />
        </div>
        <div className="flex justify-center text-[10px] text-text-muted font-mono uppercase tracking-widest">
           {enemy.name} HP: {enemy.currentHp} / {enemy.maxHp}
           {enemy.currentArmor > 0 && (
              <span className="ml-2 text-blue-400">({enemy.currentArmor} ARMOR)</span>
           )}
        </div>
      </div>
    </div>
  );
};
