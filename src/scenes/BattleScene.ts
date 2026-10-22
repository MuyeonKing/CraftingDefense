import Phaser from 'phaser';
import { DPR } from '../game/dpr';

const FONT = '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif';

export class BattleScene extends Phaser.Scene {
  private title!: Phaser.GameObjects.Text;
  private info!: Phaser.GameObjects.Text;
  private ring!: Phaser.GameObjects.Graphics;

  constructor() {
    super('BattleScene');
  }

  create() {
    // 카메라를 DPR만큼 확대해, 장면 안에서는 화면 좌표(논리 픽셀) 기준으로 배치합니다.
    this.cameras.main.setOrigin(0, 0).setZoom(DPR);

    this.ring = this.add.graphics();
    this.title = this.text('전투 화면', 26, '#e8c46a');
    this.info = this.text('', 14, '#8d95a6');

    this.layout();
    this.scale.on('resize', this.layout, this);
  }

  private text(content: string, size: number, color: string) {
    return this.add
      .text(0, 0, content, { fontFamily: FONT, fontSize: `${size}px`, color, resolution: DPR })
      .setOrigin(0.5);
  }

  private layout() {
    const cam = this.cameras.main;
    cam.setSize(this.scale.width, this.scale.height);
    const w = this.scale.width / DPR;
    const h = this.scale.height / DPR;

    this.title.setPosition(w / 2, h / 2 - 20);
    this.info.setPosition(w / 2, h / 2 + 18).setText(`화면 ${Math.round(w)}×${Math.round(h)} · 배율 ${DPR.toFixed(2)}`);

    this.ring.clear();
    this.ring.lineStyle(2, 0xe8c46a, 1).strokeCircle(w / 2, h / 2, 90);
  }
}
