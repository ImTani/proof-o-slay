import Phaser from 'phaser';

/**
 * Input Component - Stores keyboard input state
 */
export interface InputComponent {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
}

export const createInputComponent = (scene: Phaser.Scene): InputComponent => ({
  cursors: scene.input.keyboard!.createCursorKeys(),
  wasd: {
    w: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  },
});
