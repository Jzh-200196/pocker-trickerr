import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameRunState } from '../types';
import { CARD_TEMPLATES } from '../game/CardFactory';
import { RELICS } from '../game/initialData';
import { CardComponent } from '../components/CardComponent';
import { cn } from '../lib/utils';
import { ShoppingBag, LogOut, Heart, ShieldPlus, Layers, Volume2, VolumeX } from 'lucide-react';
import { CardFactory } from '../game/CardFactory';
import { MuteButton } from '../components/MuteButton';
import { soundService } from '../services/SoundService';

interface ShopScreenProps {
  runState: GameRunState;
  onPurchase: (item: any) => void;
  onLeave: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ runState, onPurchase, onLeave }) => {
  // Generate random items (2 cards, 1 relic, 1 service)
  const [items] = useState(() => {
    return [
      { id: 'i1', type: 'CARD', data: CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)], price: 20 },
      { id: 'i2', type: 'CARD', data: CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)], price: 35 },
      { id: 'i3', type: 'RELIC', data: RELICS[Math.floor(Math.random() * RELICS.length)], price: 60 },
      { id: 'i4', type: 'SERVICE', data: { name: 'Restoration', description: 'Recover vital HP' }, price: 15 }
    ];
  });

  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [gold, setGold] = useState(runState.gold);

  const buyItem = (item: any) => {
    if (gold >= item.price && !purchasedIds.includes(item.id)) {
      setGold(prev => prev - item.price);
      setPurchasedIds(prev => [...prev, item.id]);
      onPurchase(item);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg text-text-main overflow-hidden font-sans">
      <nav className="h-[60px] bg-surface border-b border-border flex items-center px-[30px] justify-between z-10 font-bold tracking-widest text-[12px]">
        <div className="flex gap-[25px] items-center">
          <div className="flex items-center"><span className="text-accent-gold mr-1.5 font-bold">GOLD</span> {gold}</div>
          <div className="flex items-center"><span className="text-accent-gold mr-1.5 font-bold">DECK</span> {runState.deck.length}</div>
          <div className="border-l border-border pl-6 h-1/2 flex items-center">
             <MuteButton />
          </div>
        </div>
        <button 
          onClick={() => { onLeave(); soundService.play('CLICK'); }}
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors uppercase italic"
        >
          CONTINUE JOURNEY <LogOut size={16} />
        </button>
      </nav>

      <main className="flex-1 p-[40px] flex flex-col items-center overflow-y-auto">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-serif font-black text-white italic tracking-tighter mb-2">THE BLACK MARKET</h1>
          <p className="text-text-muted font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">Private auctions for the discerning gambler</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[25px] w-full max-w-6xl">
          {items.map((item) => {
            const isBought = purchasedIds.includes(item.id);
            return (
              <motion.div 
                key={item.id}
                whileHover={!isBought ? { y: -8 } : {}}
                className={cn(
                  "bg-surface border rounded overflow-hidden flex flex-col transition-all h-[360px]",
                  isBought ? "border-border opacity-40 grayscale" : "border-border hover:border-accent-gold shadow-lg"
                )}
              >
                <div className="flex-1 p-6 flex flex-col items-center">
                  <div className="mb-6 flex-1 flex items-center justify-center">
                    {item.type === 'CARD' && (
                      <div className="scale-90 pointer-events-none opacity-80 group-hover:opacity-100">
                         <CardComponent card={CardFactory.createRuntime(item.data)} />
                      </div>
                    )}
                    {item.type === 'RELIC' && (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center text-accent-gold border border-border">
                           <ShieldPlus size={32} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-serif font-bold text-white leading-tight">{item.data.name}</span>
                          <span className="text-[10px] text-accent-gold uppercase tracking-widest mt-1">Ancient Relic</span>
                        </div>
                      </div>
                    )}
                    {item.type === 'SERVICE' && (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center text-accent-red border border-border">
                           <Heart size={32} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-serif font-bold text-white leading-tight">{item.data.name}</span>
                          <span className="text-[10px] text-accent-red uppercase tracking-widest mt-1">Vital Support</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-2">
                    <p className="text-center text-text-muted text-[11px] h-8 flex items-center justify-center line-clamp-2">
                      {item.data.description || `Rank ${item.data.currentRank} utility card`}
                    </p>
                  </div>
                </div>

                <div className="mt-auto p-4 bg-black/20 border-t border-border">
                  <button
                    disabled={isBought || gold < item.price}
                    onClick={() => { buyItem(item); soundService.play('CLICK'); if(gold >= item.price) soundService.play('TIDY'); }}
                    className={cn(
                      "w-full py-3 rounded text-[11px] font-bold uppercase tracking-widest transition-all",
                      isBought 
                        ? "bg-border text-text-muted" 
                        : gold >= item.price 
                          ? "bg-accent-gold text-black hover:brightness-110" 
                          : "bg-accent-red/10 text-accent-red border border-accent-red/30 cursor-not-allowed"
                    )}
                  >
                    {isBought ? 'OFF THE MARKET' : `${item.price} G`}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 flex items-center gap-4 bg-surface p-4 rounded-full border border-border">
           <div className="p-2 bg-accent-gold rounded text-black"><ShoppingBag size={20} /></div>
           <div className="text-[11px] font-bold tracking-widest opacity-60 px-4">THE HOUSE ALWAYS WINS</div>
        </div>
      </main>
    </div>
  );
};
