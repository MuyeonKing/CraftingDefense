import {
  BASES, CATEGORY_NAMES, CURRENCIES, MODS, RARITY_NAMES, SLOTS, SLOT_NAMES,
  formatText, validateData, valueParts, type Rarity, type SlotId,
} from '../data';
import { generateItem } from '../game/item';
import { itemTooltip } from './itemTooltip';

type Tab = 'mods' | 'bases' | 'gen';

// 장비 생성 테스트 설정 (탭을 바꿔도 유지)
const gen = { rarity: 'rare' as Rarity, ilvl: 40, result: '' };

/** 설정 화면: 데이터 확인용 옵션 풀·베이스 보기 */
export function renderSettings(root: HTMLElement): void {
  let tab: Tab = 'mods';
  let slot: SlotId | 'all' = 'all';

  const errors = validateData();
  root.innerHTML = `
    <h2>설정</h2>
    <div class="data-status ${errors.length ? 'bad' : 'ok'}">
      ${errors.length
        ? `데이터 오류 ${errors.length}건<br>${errors.map(esc).join('<br>')}`
        : `데이터 정상 · 옵션 ${MODS.length}종 · 베이스 ${BASES.length}종 · 재화 ${CURRENCIES.length}종`}
    </div>
    <div class="seg" data-role="tab">
      <button type="button" data-v="mods">옵션 풀</button>
      <button type="button" data-v="bases">베이스</button>
      <button type="button" data-v="gen">장비 생성</button>
    </div>
    <div class="chips" data-role="slot"></div>
    <div data-role="list"></div>
  `;

  const tabEl = root.querySelector<HTMLElement>('[data-role="tab"]')!;
  const slotEl = root.querySelector<HTMLElement>('[data-role="slot"]')!;
  const listEl = root.querySelector<HTMLElement>('[data-role="list"]')!;

  slotEl.innerHTML = [`<button type="button" data-v="all">전체</button>`]
    .concat(SLOTS.map((s) => `<button type="button" data-v="${s}">${SLOT_NAMES[s]}</button>`))
    .join('');

  const draw = () => {
    tabEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === tab));
    slotEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === slot));
    if (tab === 'gen') {
      listEl.innerHTML = genHtml(slot);
      bindGen(listEl, () => slot, draw);
    } else {
      listEl.innerHTML = tab === 'mods' ? modsHtml(slot) : basesHtml(slot);
    }
  };

  tabEl.addEventListener('click', (e) => {
    const v = (e.target as HTMLElement).closest('button')?.dataset.v;
    if (v) { tab = v as Tab; draw(); }
  });
  slotEl.addEventListener('click', (e) => {
    const v = (e.target as HTMLElement).closest('button')?.dataset.v;
    if (v) { slot = v as SlotId | 'all'; draw(); }
  });

  draw();
}

function modsHtml(slot: SlotId | 'all'): string {
  const list = MODS.filter((m) => slot === 'all' || m.slots.includes(slot));
  const section = (type: 'prefix' | 'suffix', title: string) => {
    const items = list.filter((m) => m.type === type);
    return `
      <h3>${title} ${items.length}종</h3>
      ${items.map((m) => {
        const best = m.tiers[m.tiers.length - 1];
        return `
          <details class="card">
            <summary>
              <span class="name">${esc(formatText(m.name, valueParts(best.values)))}</span>
              <span class="meta">${CATEGORY_NAMES[m.category]} · ${m.slots.map((s) => SLOT_NAMES[s]).join(', ')}</span>
            </summary>
            <table class="tiers">
              <tr><th>티어</th><th>레벨</th><th>수치</th><th>가중치</th></tr>
              ${m.tiers.map((t) => `
                <tr>
                  <td>T${t.tier}</td>
                  <td>${t.ilvl}</td>
                  <td>${esc(formatText(m.name, valueParts(t.values)))}</td>
                  <td>${t.weight}</td>
                </tr>`).join('')}
            </table>
          </details>`;
      }).join('')}
    `;
  };
  return section('prefix', '접두') + section('suffix', '접미');
}

function basesHtml(slot: SlotId | 'all'): string {
  const slots = slot === 'all' ? SLOTS : [slot];
  return slots.map((s) => `
    <h3>${SLOT_NAMES[s]}</h3>
    ${BASES.filter((b) => b.slot === s).map((b) => `
      <div class="card">
        <div class="name">${b.stage}단계 · ${esc(b.name)}</div>
        <div class="meta">아이템 레벨 ${b.ilvl} 이상</div>
        <div class="implicit">${b.implicits.length
          ? b.implicits.map((i) => esc(formatText(i.text, i.values.map(String)))).join('<br>')
          : '기본 능력치 없음'}</div>
      </div>`).join('')}
  `).join('');
}

function genHtml(slot: SlotId | 'all'): string {
  const rarities = Object.keys(RARITY_NAMES) as Rarity[];
  return `
    <h3>테스트 장비 생성 · ${slot === 'all' ? '부위 무작위' : SLOT_NAMES[slot]}</h3>
    <div class="seg" data-role="rarity">
      ${rarities.map((r) => `<button type="button" data-v="${r}" class="${r === gen.rarity ? 'on' : ''}">${RARITY_NAMES[r]}</button>`).join('')}
    </div>
    <label class="ilvl-row">
      <span>아이템 레벨 <b data-role="ilvl-val">${gen.ilvl}</b></span>
      <input type="range" min="1" max="50" value="${gen.ilvl}" data-role="ilvl">
    </label>
    <button type="button" class="primary" data-role="roll">장비 생성</button>
    <div data-role="result">${gen.result || '<p class="placeholder">버튼을 누르면 무작위 장비가 생성됩니다.</p>'}</div>
  `;
}

function bindGen(el: HTMLElement, getSlot: () => SlotId | 'all', redraw: () => void): void {
  el.querySelector('[data-role="rarity"]')!.addEventListener('click', (e) => {
    const v = (e.target as HTMLElement).closest('button')?.dataset.v;
    if (v) { gen.rarity = v as Rarity; redraw(); }
  });
  const range = el.querySelector<HTMLInputElement>('[data-role="ilvl"]')!;
  range.addEventListener('input', () => {
    gen.ilvl = Number(range.value);
    el.querySelector('[data-role="ilvl-val"]')!.textContent = range.value;
  });
  el.querySelector('[data-role="roll"]')!.addEventListener('click', () => {
    const chosen = getSlot();
    const slot = chosen === 'all' ? SLOTS[Math.floor(Math.random() * SLOTS.length)] : chosen;
    gen.result = itemTooltip(generateItem({ slot, ilvl: gen.ilvl, rarity: gen.rarity }));
    el.querySelector('[data-role="result"]')!.innerHTML = gen.result;
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}
