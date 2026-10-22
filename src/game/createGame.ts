import Phaser from 'phaser';
import { BattleScene } from '../scenes/BattleScene';
import { DPR } from './dpr';

// 고해상도 화면에서 선명하게 보이도록 실제 픽셀 크기로 그리고, 화면에는 축소해 표시합니다.

export function createGame(container: HTMLElement): Phaser.Game {
  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    backgroundColor: '#14161b',
    scale: {
      mode: Phaser.Scale.NONE,
      width: width * DPR,
      height: height * DPR,
      zoom: 1 / DPR,
    },
    scene: [BattleScene],
  });

  const observer = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return; // 다른 탭에 있어 숨겨진 경우
    game.scale.resize(w * DPR, h * DPR);
    game.scale.setZoom(1 / DPR);
  });
  observer.observe(container);

  return game;
}
