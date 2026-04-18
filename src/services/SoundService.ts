/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SoundEffect = 'CLICK' | 'CARD_PLAY' | 'CARD_DRAW' | 'DAMAGE' | 'SHIELD' | 'VICTORY' | 'DEFEAT' | 'TIDY';

const SFX_URLS: Record<SoundEffect, string> = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  CARD_PLAY: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  CARD_DRAW: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  DAMAGE: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SHIELD: 'https://assets.mixkit.co/active_storage/sfx/1071/1071-preview.mp3',
  VICTORY: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  DEFEAT: 'https://assets.mixkit.co/active_storage/sfx/1432/1432-preview.mp3',
  TIDY: 'https://assets.mixkit.co/active_storage/sfx/2625/2625-preview.mp3', // Dice/rattle for tidy
};

class SoundService {
  private static instance: SoundService;
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private constructor() {
    this.isMuted = localStorage.getItem('poker_rogue_muted') === 'true';
  }

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('poker_rogue_muted', String(muted));
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public play(effect: SoundEffect) {
    if (this.isMuted) return;

    const url = SFX_URLS[effect];
    let audio = this.audioCache.get(url);

    if (!audio) {
      audio = new Audio(url);
      this.audioCache.set(url, audio);
    }

    // Reset and play
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn('Audio playback failed:', err);
    });
  }
}

export const soundService = SoundService.getInstance();
