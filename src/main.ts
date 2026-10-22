import './style.css';
import { createGame } from './game/createGame';
import { setupRouter } from './ui/router';
import { renderBag } from './ui/bagView';
import { renderSettings } from './ui/settingsView';

const container = document.getElementById('game');
if (!container) throw new Error('#game 요소를 찾을 수 없습니다.');

renderBag(document.querySelector<HTMLElement>('[data-screen="bag"]')!);
renderSettings(document.querySelector<HTMLElement>('[data-screen="settings"]')!);

const game = createGame(container);

setupRouter('home', (screen) => {
  // 전투 화면이 아닐 때는 게임 루프를 멈춰 배터리 소모를 줄입니다.
  if (screen === 'battle') game.loop.wake();
  else game.loop.sleep();
});
