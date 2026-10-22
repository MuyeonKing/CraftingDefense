import { RARITY_NAMES, SLOT_NAMES, formatText } from '../data';
import { getBase, getMod, type Item } from '../game/item';

/** PoE 아이템 툴팁처럼 장비 정보를 HTML로 만듭니다. */
export function itemTooltip(item: Item): string {
  const base = getBase(item.baseId);
  const implicits = base.implicits
    .map((i) => `<div class="it-implicit">${formatText(i.text, i.values.map(String))}</div>`)
    .join('');

  const mods = item.mods.map((m) => {
    const def = getMod(m.modId);
    const parts = def.tiers[0].values.length > 1
      ? [`${m.values[0]}`, `${m.values[1]}`]
      : m.values.map(String);
    const tag = def.type === 'prefix' ? '접두' : '접미';
    return `
      <div class="it-mod ${m.fractured ? 'fractured' : ''}">
        <span>${formatText(def.name, parts)}</span>
        <span class="it-tag">${tag} T${m.tier}${m.fractured ? ' · 확정' : ''}</span>
      </div>`;
  }).join('');

  return `
    <div class="item-tip rarity-${item.rarity}">
      <div class="it-head">
        <div class="it-name">${base.name}</div>
        <div class="it-sub">${RARITY_NAMES[item.rarity]} ${SLOT_NAMES[item.slot]} · ${base.stage}단계 베이스</div>
      </div>
      <div class="it-body">
        <div class="it-ilvl">아이템 레벨 ${item.ilvl}</div>
        ${implicits ? `<div class="it-sep"></div>${implicits}` : ''}
        ${mods ? `<div class="it-sep"></div>${mods}` : ''}
      </div>
    </div>`;
}
