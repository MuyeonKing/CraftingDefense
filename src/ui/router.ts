export type ScreenId = 'battle' | 'equip' | 'craft' | 'settings';

export function setupRouter(onChange: (screen: ScreenId) => void): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>('#tabbar button');
  const screens = document.querySelectorAll<HTMLElement>('.screen');

  const show = (id: ScreenId) => {
    screens.forEach((el) => {
      el.hidden = el.dataset.screen !== id;
    });
    tabs.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === id);
    });
    onChange(id);
  };

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => show(btn.dataset.tab as ScreenId));
  });
}
