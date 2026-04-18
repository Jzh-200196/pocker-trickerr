/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundService } from '../services/SoundService';
import { cn } from '../lib/utils';

export const MuteButton: React.FC<{ className?: string }> = ({ className }) => {
  const [isMuted, setIsMuted] = useState(soundService.getMuted());

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMuted(next);
    if (!next) {
      soundService.play('CLICK');
    }
  };

  return (
    <button
      onClick={toggleMute}
      className={cn(
        "p-2 rounded-full border border-border bg-surface hover:bg-white/5 transition-all text-accent-gold",
        className
      )}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
};
