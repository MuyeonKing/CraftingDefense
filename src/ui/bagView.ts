import { CURRENCIES, RARITY_NAMES } from '../data';

const SOURCE_NAMES = { poe1: 'PoE1', poe2: 'PoE2', new: '신규' } as const;

/** 가방 화면: 보유 재화 목록 (보유 수량은 6단계 저장 기능 이후 연결) */
export function renderBag(root: HTMLElement): void {
  root.innerHTML = `
    <h2>가방</h2>
    ${CURRENCIES.map((c) => `
      <div class="card">
        <div class="row">
          <span class="name">${c.name}</span>
          <span class="count">0개</span>
        </div>
        <div class="desc">${c.description}</div>
        <div class="meta">사용 대상: ${c.targets.map((t) => RARITY_NAMES[t]).join(', ')} · 출처 ${SOURCE_NAMES[c.source]}</div>
      </div>`).join('')}
  `;
}
