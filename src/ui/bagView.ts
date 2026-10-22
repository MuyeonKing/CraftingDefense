import { CURRENCIES, RARITY_NAMES, type CurrencyDef } from '../data';
import { currencyIcon } from './icons';

// PoE 화폐 창고처럼 칸 위치를 고정합니다. null은 빈 칸입니다.
const LAYOUT: { title: string; slots: (string | null)[] }[] = [
  {
    title: '돌',
    slots: [
      'transmutation', 'augmentation', 'alteration', 'regal', 'alchemy',
      'legendary', 'exalted', 'annulment', 'chaos', 'divine',
      'scouring', 'fracture', null, null, null,
    ],
  },
  {
    title: '정수',
    slots: [
      'essence_life', 'essence_armour', 'essence_res_fire', 'essence_res_cold', 'essence_res_lightning',
      'essence_res_chaos', 'essence_phys', 'essence_fire', 'essence_cold', 'essence_lightning',
      'essence_ele', 'essence_speed', 'essence_crit', 'essence_critmulti', null,
    ],
  },
  {
    title: '부적',
    slots: ['talisman', null, null, null, null],
  },
];

const byId = new Map(CURRENCIES.map((c) => [c.id, c]));

/** 가방 화면: 보유 재화를 고정 칸에 아이콘으로 표시하고, 누르면 설명을 보여줍니다. */
export function renderBag(root: HTMLElement, counts: Record<string, number> = {}): void {
  root.innerHTML = `
    <h2>가방</h2>
    ${LAYOUT.map((sec) => `
      <h3>${sec.title}</h3>
      <div class="bag-grid">
        ${sec.slots.map((id) => cellHtml(id ? byId.get(id) : undefined, counts)).join('')}
      </div>`).join('')}
    <div class="bag-tip" hidden></div>
  `;

  const tip = root.querySelector<HTMLElement>('.bag-tip')!;
  let openId: string | null = null;

  const close = () => {
    tip.hidden = true;
    openId = null;
    root.querySelectorAll('.bag-cell.on').forEach((el) => el.classList.remove('on'));
  };

  root.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.bag-cell[data-id]');
    const id = cell?.dataset.id ?? null;
    if (!cell || !id || id === openId) {
      close(); // 빈 곳이나 같은 아이콘을 다시 누르면 닫기
      return;
    }
    close();
    openId = id;
    cell.classList.add('on');
    tip.innerHTML = tipHtml(byId.get(id)!, counts[id] ?? 0);
    tip.hidden = false;
    placeTip(root, cell, tip);
  });

  // 다른 탭으로 이동했다가 돌아오면 설명이 닫혀 있도록 합니다.
  new MutationObserver(() => { if (root.hidden) close(); })
    .observe(root, { attributes: true, attributeFilter: ['hidden'] });
}

function cellHtml(c: CurrencyDef | undefined, counts: Record<string, number>): string {
  if (!c) return '<div class="bag-cell empty"></div>';
  const n = counts[c.id] ?? 0;
  return `
    <button type="button" class="bag-cell ${n === 0 ? 'zero' : ''}" data-id="${c.id}" aria-label="${c.name}">
      ${currencyIcon(c)}
      ${n > 0 ? `<span class="badge">${n}</span>` : ''}
    </button>`;
}

function tipHtml(c: CurrencyDef, n: number): string {
  const targets = c.targets.length ? c.targets.map((t) => RARITY_NAMES[t]).join(', ') : '미정';
  return `
    <div class="tip-name kind-${c.kind}">${c.name}</div>
    <div class="tip-meta">사용 대상: ${targets} · 보유 ${n}개</div>
    <div class="tip-desc">${c.description}</div>`;
}

/** 설명 창을 아이콘 아래(공간이 없으면 위)에 화면 밖으로 나가지 않게 배치합니다. */
function placeTip(root: HTMLElement, cell: HTMLElement, tip: HTMLElement): void {
  const rootRect = root.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  const margin = 8;

  const tipW = tip.offsetWidth;
  const tipH = tip.offsetHeight;
  let left = cellRect.left - rootRect.left + cellRect.width / 2 - tipW / 2;
  left = Math.max(margin, Math.min(left, rootRect.width - tipW - margin));

  const below = cellRect.bottom - rootRect.top + 6;
  const above = cellRect.top - rootRect.top - tipH - 6;
  const fitsBelow = cellRect.bottom + tipH + 6 <= rootRect.bottom;
  const top = fitsBelow || above < 0 ? below : above;

  tip.style.left = `${left}px`;
  tip.style.top = `${top + root.scrollTop}px`;
}
