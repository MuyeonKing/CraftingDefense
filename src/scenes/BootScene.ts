import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 40, '장비 제작 게임', { fontSize: '28px', color: '#f5d76e' })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, `Phaser ${Phaser.VERSION}`, { fontSize: '16px', color: '#cccccc' })
      .setOrigin(0.5);

    const button = this.add
      .text(width / 2, height / 2 + 70, '터치 테스트', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#3a6ea5',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    let count = 0;
    button.on('pointerdown', () => {
      count += 1;
      button.setText(`터치 ${count}회`);
    });
  }
}
