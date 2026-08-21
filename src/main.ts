// ============================================================
// OTHERWISE — Main Entry Point
// ============================================================
import Phaser from 'phaser';
import { createGameConfig } from './game/config/GameConfig';

// Create the game
const config = createGameConfig();
const game = new Phaser.Game(config);

// Prevent default browser behaviors that interfere with the game
window.addEventListener('keydown', (e) => {
  // Prevent Tab from switching focus
  if (e.key === 'Tab') {
    e.preventDefault();
  }
  // Prevent Space from scrolling
  if (e.key === ' ' && e.target === document.body) {
    e.preventDefault();
  }
});

// Expose game for debugging (only in dev)
if (import.meta.env.DEV) {
  (window as any).__GAME = game;
}
