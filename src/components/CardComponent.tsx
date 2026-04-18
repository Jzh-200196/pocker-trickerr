import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardRuntime, CardRank } from '../types';
import { cn } from '../lib/utils';
import { Shield, Droplets, Zap, Heart, Search, Sword } from 'lucide-react';

interface CardProps {
  card: CardRuntime;
  isSelected?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
  className?: string;
}

const getRankLabel = (rank: number) => {
  if (rank <= 10) return rank.toString();
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  if (rank === 14) return 'A';
  return rank.toString();
};

export const CardComponent: React.FC<CardProps> = ({ card, isSelected, isSelectable, onClick, className }) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: isSelected ? -15 : 0,
      }}
      whileHover={isSelectable ? { scale: 1.05, y: -5 } : {}}
      onClick={isSelectable ? onClick : undefined}
      className={cn(
        "relative w-[100px] h-[145px] rounded-lg border flex flex-col p-2.5 cursor-pointer select-none overflow-hidden transition-all duration-200",
        isSelected 
          ? "border-accent-gold bg-card-face shadow-[0_10px_20px_rgba(194,162,101,0.2)]" 
          : "border-border bg-card-face hover:border-gray-500",
        className
      )}
    >
      {/* Corner Rank */}
      <div className="flex justify-between items-start mb-1">
        <span className="text-xl font-bold font-serif text-text-main leading-none">
          {getRankLabel(card.currentRank)}
        </span>
        <div className="flex gap-1">
          {card.effects.map((fx, i) => (
            <div key={i} className="text-text-muted">
              {fx.type === 'GainArmor' && <Shield size={12} />}
              {fx.type === 'Bleed' && <Droplets size={12} />}
              {fx.type === 'GainExtraTidy' && <Zap size={12} />}
              {fx.type === 'Heal' && <Heart size={12} />}
              {fx.type === 'DrawCard' && <Search size={12} />}
              {fx.type === 'DamageBonus' && <Sword size={12} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Art Area */}
      <div className="flex-1 flex items-center justify-center bg-black/20 rounded-md mb-2">
         <div className="text-gray-600">
           {card.currentRank >= 11 ? <Zap size={24} /> : <Sword size={24} />}
         </div>
      </div>

      {/* Card Info */}
      <div className="text-[8px] text-text-muted font-medium truncate mb-1 text-center uppercase tracking-tighter">
        {card.name}
      </div>
      
      {/* Rarity Indicator */}
      <div className={cn(
        "h-0.5 w-full rounded-full",
        card.rarity === 'Common' && "bg-border",
        card.rarity === 'Rare' && "bg-rarity-rare",
        card.rarity === 'Epic' && "bg-rarity-epic",
        card.rarity === 'Legendary' && "bg-accent-gold",
      )} />
    </motion.div>
  );
};
