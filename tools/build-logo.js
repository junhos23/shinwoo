// 신우코맥스 로고 파일(SVG·PNG)을 만든다. 글자는 Pretendard 윤곽선으로 바꿔 넣어 폰트 없이도 똑같이 보인다.
// 실행: npm run logo  →  assets/logo/ 에 저장
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");
const { Resvg } = require("@resvg/resvg-js");

const FONT_DIR = path.join(__dirname, "..", "node_modules", "pretendard", "dist", "public", "static");
const OUT = path.join(__dirname, "..", "assets", "logo");
const bold = opentype.loadSync(path.join(FONT_DIR, "Pretendard-ExtraBold.otf"));
const medium = opentype.loadSync(path.join(FONT_DIR, "Pretendard-Medium.otf"));

const NAME = "신우코맥스";
const TAGLINE = "출입통제 · 홈네트워크 · CCTV 시공 전문";

const COLORS = {
  color: { house: "#0b5cad", s: "#16b3a0", name: "#13202e", tag: "#566577" },
  white: { house: "#ffffff", s: "#2dd4bf", name: "#ffffff", tag: "#d6e4f2" },
};

// 집 + S 심볼 (100 x 100 기준)
function symbol(c) {
  return [
    `<path d="M10 46 L50 12 L90 46" fill="none" stroke="${c.house}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="M21 40 V88 H79 V40" fill="none" stroke="${c.house}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="M61 51 H46 Q38 51 38 59 Q38 66 46 66 H54 Q62 66 62 73 Q62 80 54 80 H39" fill="none" stroke="${c.s}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<circle cx="61" cy="51" r="5" fill="${c.s}"/>`,
    `<circle cx="39" cy="80" r="5" fill="${c.s}"/>`,
  ].join("");
}

// 글자를 윤곽선 path로 바꾸고 너비를 돌려준다
function textPath(font, text, x, y, size, letterSpacing, fill) {
  const p = font.getPath(text, x, y, size, { letterSpacing });
  const box = p.getBoundingBox();
  return { d: `<path d="${p.toPathData(2)}" fill="${fill}"/>`, right: box.x2 };
}

function svgDoc(w, h, body, bg) {
  const rect = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><title>신우코맥스</title>${rect}${body}</svg>\n`;
}

// 가로형: 심볼 + 회사명 (+ 문구)
function horizontal(c, withTagline) {
  const pad = 8;
  const symSize = withTagline ? 112 : 84;
  const textX = pad + symSize + 22;
  const name = textPath(bold, NAME, textX, withTagline ? 66 : 70, withTagline ? 62 : 60, -0.04, c.name);
  let body = `<g transform="translate(${pad} ${pad}) scale(${symSize / 100})">${symbol(c)}</g>` + name.d;
  let right = name.right;
  if (withTagline) {
    const tag = textPath(medium, TAGLINE, textX + 2, 106, 19.5, 0, c.tag);
    body += tag.d;
    right = Math.max(right, tag.right);
  }
  const w = Math.ceil(right + pad);
  const h = symSize + pad * 2;
  return { w, h, body };
}

function save(name, svg, pngWidth) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
  const png = new Resvg(svg, { fitTo: { mode: "width", value: pngWidth } }).render().asPng();
  fs.writeFileSync(path.join(OUT, `${name}.png`), png);
  console.log(`${name}.svg / ${name}.png`);
}

fs.mkdirSync(OUT, { recursive: true });

for (const [variant, c] of Object.entries(COLORS)) {
  const full = horizontal(c, true);
  save(`logo-horizontal-${variant}`, svgDoc(full.w, full.h, full.body), full.w * 4);

  const compact = horizontal(c, false);
  save(`logo-compact-${variant}`, svgDoc(compact.w, compact.h, compact.body), compact.w * 4);

  save(`symbol-${variant}`, svgDoc(100, 100, symbol(c)), 512);
}

// 앱 아이콘·파비콘용: 흰 바탕 둥근 사각형 위 심볼
const icon = `<rect width="100" height="100" rx="22" fill="#ffffff"/><g transform="translate(12 10) scale(0.76)">${symbol(COLORS.color)}</g>`;
save("app-icon", svgDoc(100, 100, icon), 512);
