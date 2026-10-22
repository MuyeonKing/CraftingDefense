import {
  BASES, CATEGORY_NAMES, CURRENCIES, MODS, SLOTS, SLOT_NAMES,
  formatText, validateData, valueParts, type SlotId,
} from '../data';

type Tab = 'mods' | 'bases';

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
    listEl.innerHTML = tab === 'mods' ? modsHtml(slot) : basesHtml(slot);
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
        <div class="implicit">${b.implicits.map((i) => esc(formatText(i.text, i.values.map(String)))).join('<br>')}</div>
      </div>`).join('')}
  `).join('');
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}
