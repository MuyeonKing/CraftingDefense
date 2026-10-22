import modsJson from './mods.json';
import basesJson from './bases.json';
import currenciesJson from './currencies.json';

export type SlotId =
  | 'weapon' | 'offhand' | 'helmet' | 'body' | 'gloves'
  | 'boots' | 'belt' | 'amulet' | 'ring';

export type Rarity = 'normal' | 'magic' | 'rare' | 'legendary';
export type ModType = 'prefix' | 'suffix';
export type ModCategory = 'attack' | 'defense' | 'resist' | 'utility' | 'projectile';

/** 값 범위. 피해 추가 옵션은 [최소 범위, 최대 범위] 두 개를 가집니다. */
export type Range = [number, number];

export interface ModTier {
  tier: number;   // 1이 최상위
  ilvl: number;   // 이 티어가 붙기 위한 최소 아이템 레벨
  weight: number; // 등장 가중치
  values: Range[];
}

export interface ModDef {
  id: string;
  type: ModType;
  group: string;  // 같은 그룹 옵션은 한 장비에 중복 불가
  category: ModCategory;
  name: string;   // 표시용 문구, {0} {1} 자리에 수치가 들어감
  slots: SlotId[];
  tiers: ModTier[];
}

export interface Implicit {
  stat: string;
  text: string;
  values: number[];
}

export interface BaseDef {
  id: string;
  slot: SlotId;
  stage: number;  // 1~5, 높을수록 상위 베이스
  ilvl: number;
  name: string;
  implicits: Implicit[];
}

export type CurrencyKind = 'stone' | 'essence' | 'talisman';
export type IconShape = 'round' | 'oval' | 'hex' | 'diamond' | 'star' | 'shard' | 'crystal' | 'talisman';

export interface CurrencyDef {
  id: string;
  kind: CurrencyKind;
  name: string;
  targets: Rarity[];  // 사용할 수 있는 장비 등급
  description: string;
  modGroup?: string;  // 정수: 보장하는 옵션 그룹
  icon: { shape: IconShape; color: string; glyph?: string };
}

export const SLOT_NAMES: Record<SlotId, string> = {
  weapon: '무기',
  offhand: '보조무기',
  helmet: '투구',
  body: '갑옷',
  gloves: '장갑',
  boots: '신발',
  belt: '벨트',
  amulet: '목걸이',
  ring: '반지',
};

export const SLOTS = Object.keys(SLOT_NAMES) as SlotId[];

export const RARITY_NAMES: Record<Rarity, string> = {
  normal: '일반',
  magic: '마법',
  rare: '희귀',
  legendary: '전설',
};

export const CATEGORY_NAMES: Record<ModCategory, string> = {
  attack: '공격',
  defense: '방어',
  resist: '저항',
  utility: '유틸',
  projectile: '투사체',
};

export const MODS = modsJson as ModDef[];
export const BASES = basesJson as BaseDef[];
export const CURRENCIES = currenciesJson as CurrencyDef[];

/** 표시용 문구의 {0} {1} 자리에 값을 채웁니다. */
export function formatText(template: string, parts: string[]): string {
  return template.replace(/\{(\d+)\}/g, (_, i) => parts[Number(i)] ?? '?');
}

/** 범위를 "a~b" 형태로, 같은 값이면 숫자 하나로 표시합니다. */
export function rangeText([lo, hi]: Range): string {
  return lo === hi ? `${lo}` : `${lo}~${hi}`;
}

/** 옵션 수치를 표시용으로 바꿉니다. 피해 추가처럼 범위가 둘이면 "(a~b)~(c~d)" 형태가 됩니다. */
export function valueParts(values: Range[]): string[] {
  return values.map((r) => (values.length > 1 && r[0] !== r[1] ? `(${rangeText(r)})` : rangeText(r)));
}

/** 데이터 오류를 찾아 목록으로 돌려줍니다. 비어 있으면 정상입니다. */
export function validateData(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const mod of MODS) {
    if (ids.has(mod.id)) errors.push(`옵션 ID 중복: ${mod.id}`);
    ids.add(mod.id);
    if (mod.tiers.length === 0) errors.push(`티어 없음: ${mod.id}`);
  }

  const groups = new Set(MODS.map((m) => m.group));
  for (const c of CURRENCIES) {
    if (c.kind === 'essence' && (!c.modGroup || !groups.has(c.modGroup))) {
      errors.push(`정수 보장 옵션 없음: ${c.name}`);
    }
  }

  for (const slot of SLOTS) {
    for (const type of ['prefix', 'suffix'] as ModType[]) {
      const groups = new Set(
        MODS.filter((m) => m.type === type && m.slots.includes(slot)).map((m) => m.group),
      );
      if (groups.size < 3) {
        errors.push(`${SLOT_NAMES[slot]} ${type === 'prefix' ? '접두' : '접미'} 종류 부족 (${groups.size}종)`);
      }
    }
    const stages = BASES.filter((b) => b.slot === slot).length;
    if (stages !== 5) errors.push(`${SLOT_NAMES[slot]} 베이스 ${stages}단계 (5단계 필요)`);
  }

  return errors;
}
