import {
  BASES, MODS,
  type BaseDef, type ModDef, type ModTier, type ModType, type Rarity, type SlotId,
} from '../data';

/** 장비에 붙은 옵션 1개 */
export interface ItemMod {
  modId: string;
  tier: number;
  values: number[];      // 실제로 굴려진 수치 (피해 추가는 [최소, 최대])
  fractured?: boolean;   // 확정의 돌로 고정된 옵션
}

/** 장비 1개 */
export interface Item {
  uid: string;
  baseId: string;
  slot: SlotId;
  ilvl: number;
  rarity: Rarity;
  mods: ItemMod[];
  fractureUsed?: boolean; // 확정의 돌 사용 여부 (장비당 1회)
}

/** 등급별 접두·접미 최대 개수 (기획서 확정 사항) */
export const AFFIX_LIMIT: Record<Rarity, number> = {
  normal: 0,
  magic: 1,
  rare: 2,
  legendary: 3,
};

/** 테스트 생성용 옵션 개수 범위 (드롭 규칙은 9단계에서 확정) */
export const DROP_MOD_COUNT: Record<Rarity, [number, number]> = {
  normal: [0, 0],
  magic: [1, 2],
  rare: [3, 4],
  legendary: [5, 6],
};

export type Rng = () => number;

const modById = new Map(MODS.map((m) => [m.id, m]));
const baseById = new Map(BASES.map((b) => [b.id, b]));

export const getMod = (id: string): ModDef => modById.get(id)!;
export const getBase = (id: string): BaseDef => baseById.get(id)!;

const randInt = (lo: number, hi: number, rng: Rng) => lo + Math.floor(rng() * (hi - lo + 1));

let uidSeq = 0;
const newUid = () => `${Date.now().toString(36)}-${(uidSeq++).toString(36)}`;

/** 아이템 레벨로 얻을 수 있는 베이스 중 하나를 무작위로 고릅니다. */
export function pickBase(slot: SlotId, ilvl: number, rng: Rng = Math.random): BaseDef {
  const list = BASES.filter((b) => b.slot === slot && b.ilvl <= ilvl);
  return list[Math.floor(rng() * list.length)];
}

export function countType(item: Item, type: ModType): number {
  return item.mods.filter((m) => getMod(m.modId).type === type).length;
}

/** 지금 장비에 새로 붙을 수 있는 (옵션, 티어) 후보 목록입니다. */
export function candidates(item: Item, onlyType?: ModType, onlyGroup?: string) {
  const limit = AFFIX_LIMIT[item.rarity];
  const usedGroups = new Set(item.mods.map((m) => getMod(m.modId).group));
  const open: Record<ModType, boolean> = {
    prefix: countType(item, 'prefix') < limit,
    suffix: countType(item, 'suffix') < limit,
  };

  const list: { mod: ModDef; tier: ModTier }[] = [];
  for (const mod of MODS) {
    if (!mod.slots.includes(item.slot)) continue;
    if (!open[mod.type]) continue;
    if (onlyType && mod.type !== onlyType) continue;
    if (onlyGroup && mod.group !== onlyGroup) continue;
    if (usedGroups.has(mod.group)) continue;
    for (const tier of mod.tiers) {
      if (tier.ilvl <= item.ilvl) list.push({ mod, tier });
    }
  }
  return list;
}

/** 후보 중 가중치에 따라 옵션 1개를 골라 수치를 굴립니다. 후보가 없으면 null. */
export function rollMod(
  item: Item, rng: Rng = Math.random, onlyType?: ModType, onlyGroup?: string,
): ItemMod | null {
  const list = candidates(item, onlyType, onlyGroup);
  const total = list.reduce((s, c) => s + c.tier.weight, 0);
  if (total <= 0) return null;

  let r = rng() * total;
  for (const c of list) {
    r -= c.tier.weight;
    if (r < 0) return makeMod(c.mod, c.tier, rng);
  }
  const last = list[list.length - 1];
  return makeMod(last.mod, last.tier, rng);
}

function makeMod(mod: ModDef, tier: ModTier, rng: Rng): ItemMod {
  return {
    modId: mod.id,
    tier: tier.tier,
    values: tier.values.map(([lo, hi]) => randInt(lo, hi, rng)),
  };
}

/** 옵션을 1개 추가합니다. 성공하면 true. */
export function addRandomMod(item: Item, rng: Rng = Math.random): boolean {
  const mod = rollMod(item, rng);
  if (!mod) return false;
  item.mods.push(mod);
  return true;
}

/** 무작위 장비를 만듭니다. */
export function generateItem(
  opts: { slot: SlotId; ilvl: number; rarity: Rarity; baseId?: string },
  rng: Rng = Math.random,
): Item {
  const base = opts.baseId ? getBase(opts.baseId) : pickBase(opts.slot, opts.ilvl, rng);
  const item: Item = {
    uid: newUid(),
    baseId: base.id,
    slot: base.slot,
    ilvl: opts.ilvl,
    rarity: opts.rarity,
    mods: [],
  };
  const [lo, hi] = DROP_MOD_COUNT[opts.rarity];
  const count = randInt(lo, hi, rng);
  for (let i = 0; i < count; i++) {
    if (!addRandomMod(item, rng)) break;
  }
  sortMods(item);
  return item;
}

/** 표시 순서: 접두 먼저, 그다음 접미 */
export function sortMods(item: Item): void {
  item.mods.sort((a, b) => {
    const ta = getMod(a.modId).type === 'prefix' ? 0 : 1;
    const tb = getMod(b.modId).type === 'prefix' ? 0 : 1;
    return ta - tb;
  });
}
