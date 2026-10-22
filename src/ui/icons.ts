import type { CurrencyDef, IconShape } from '../data';

// 재화 아이콘을 SVG로 그립니다. 이미지 파일 없이 모양과 색으로 구분합니다.

const SHAPES: Record<IconShape, string> = {
  round: '<circle cx="32" cy="33" r="20"/>',
  oval: '<ellipse cx="32" cy="33" rx="15" ry="22"/>',
  hex: '<polygon points="32,10 51,21 51,44 32,55 13,44 13,21"/>',
  diamond: '<polygon points="32,7 53,32 32,57 11,32"/>',
  star: `<polygon points="${starPoints(32, 33, 23, 11, 6)}"/>`,
  shard: '<polygon points="25,8 47,16 53,40 34,57 13,45 16,20"/>',
  crystal: '<polygon points="32,5 46,17 46,46 32,59 18,46 18,17"/>',
  talisman: '<circle cx="32" cy="38" r="17"/>',
};

function starPoints(cx: number, cy: number, outer: number, inner: number, n: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** 색을 흰색(amount>0) 또는 검은색(amount<0) 쪽으로 섞습니다. */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const ch = (v: number) => Math.round(v + (target - v) * t);
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function currencyIcon(c: CurrencyDef): string {
  const { shape, color, glyph } = c.icon;
  const id = `g-${c.id}`;
  const string = shape === 'talisman'
    ? `<path d="M19 26 L32 8 L45 26" fill="none" stroke="${shade(color, -0.3)}" stroke-width="2.5"/>`
    : '';
  const text = glyph
    ? `<text x="32" y="39" text-anchor="middle" font-size="17" font-weight="700"
         fill="#ffffff" stroke="#000000" stroke-opacity="0.55" stroke-width="3" paint-order="stroke">${glyph}</text>`
    : '';
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="${id}" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stop-color="${shade(color, 0.6)}"/>
          <stop offset="45%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${shade(color, -0.55)}"/>
        </radialGradient>
      </defs>
      ${string}
      <g fill="url(#${id})" stroke="${shade(color, -0.6)}" stroke-width="1.5">${SHAPES[shape]}</g>
      <ellipse cx="25" cy="22" rx="7" ry="4" fill="#ffffff" opacity="0.35"/>
      ${text}
    </svg>`;
}
