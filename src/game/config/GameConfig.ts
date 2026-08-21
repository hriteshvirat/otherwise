// ============================================================
// OTHERWISE — Phaser Game Configuration
// ============================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, SCENES } from '../../utils/Constants';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameScene } from '../scenes/GameScene';
import { PauseScene } from '../scenes/PauseScene';
import { SettingsScene } from '../scenes/SettingsScene';
import { CreditsScene } from '../scenes/CreditsScene';
import { JournalScene } from '../scenes/JournalScene';

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1A1425',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: PLAYER.GRAVITY },
        debug: false,
        tileBias: 16,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: false,
      antialias: true,
      roundPixels: false,
    },
    input: {
      keyboard: true,
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      GameScene,
      PauseScene,
      SettingsScene,
      CreditsScene,
      JournalScene,
    ],
  };
}
