
const fs = require("fs");
const path = require("path");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=")];
  })
);

const user = args.user || "tom-toupence";
const theme = (args.theme || "dark").toLowerCase();
const out = args.out || `dist/pacman-${theme}.svg`;

const themes = {
  dark: {
    bg: "#0d1117",
    text: "#c9d1d9",
    empty: "#161b22",
    stroke: "#30363d",
    levels: ["#0e4429", "#006d32", "#26a641", "#39d353"],
    pac: "#ffd43b",
    eye: "#0d1117",
    pellet: "#f0f6fc",
    ghost1: "#ff4d6d",
    ghost2: "#7b61ff",
  },
  light: {
    bg: "#ffffff",
    text: "#24292f",
    empty: "#ebedf0",
    stroke: "#d0d7de",
    levels: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
    pac: "#f4b400",
    eye: "#24292f",
    pellet: "#57606a",
    ghost1: "#ff5c8a",
    ghost2: "#6f42c1",
  },
};

const T = themes[theme] || themes.dark;

// grille type contributions (53 x 7)
const cols = 53, rows = 7;
const cell = 12, gap = 4;
const m = { top: 36, left: 20, right: 20, bottom: 20 };
const gridW = cols * (cell + gap) - gap;
const gridH = rows * (cell + gap) - gap;
const W = m.left + gridW + m.right;
const H = m.top + gridH + m.bottom;

// fond "fausses contributions" visuelles
let rects = "";
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    const rx = m.left + x * (cell + gap);
    const ry = m.top + y * (cell + gap);
    const r = Math.random();
    let fill = T.empty;
    if (r > 0.82) fill = T.levels[0];
    if (r > 0.90) fill = T.levels[1];
    if (r > 0.95) fill = T.levels[2];
    if (r > 0.98) fill = T.levels[3];
    rects += `<rect x="${rx}" y="${ry}" width="${cell}" height="${cell}" rx="2" fill="${fill}" stroke="${T.stroke}" stroke-width="0.5"/>`;
  }
}

// ligne de déplacement Pac-Man
const yMid = m.top + 3 * (cell + gap) + cell / 2;
const xStart = m.left - 20;
const xEnd = m.left + gridW + 20;
const dur = "8s";

// pellets
let pellets = "";
for (let x = m.left + 8; x < m.left + gridW - 8; x += 14) {
  pellets += `<circle cx="${x}" cy="${yMid}" r="2" fill="${T.pellet}">
    <animate attributeName="opacity" values="1;1;0;0" dur="${dur}" repeatCount="indefinite"
      keyTimes="0;0.55;0.56;1" />
  </circle>`;
}

// pacman (bouche animée + déplacement)
const pacman = `
<g>
  <g>
    <animateTransform attributeName="transform" type="translate"
      values="${xStart} ${yMid}; ${xEnd} ${yMid}" dur="${dur}" repeatCount="indefinite"/>
    <path d="M0,0 L-12,-8 A14,14 0 1 0 -12,8 Z" fill="${T.pac}">
      <animate attributeName="d" dur="0.35s" repeatCount="indefinite"
        values="
          M0,0 L-12,-8 A14,14 0 1 0 -12,8 Z;
          M0,0 L-8,-2 A14,14 0 1 0 -8,2 Z;
          M0,0 L-12,-8 A14,14 0 1 0 -12,8 Z
        " />
    </path>
    <circle cx="-4" cy="-5" r="1.5" fill="${T.eye}" />
  </g>
</g>`;

// fantômes
function ghost(color, delay, offset) {
  return `
  <g opacity="0.95">
    <animateTransform attributeName="transform" type="translate"
      values="${xStart - offset} ${yMid}; ${xEnd - offset} ${yMid}" dur="${dur}" begin="${delay}" repeatCount="indefinite"/>
    <g transform="translate(0,-7)">
      <path d="M0,7 a7,7 0 0 1 14,0 v7 l-2,-2 l-2,2 l-2,-2 l-2,2 l-2,-2 l-2,2 z" fill="${color}" />
      <circle cx="5" cy="7" r="1.2" fill="white"/><circle cx="9" cy="7" r="1.2" fill="white"/>
      <circle cx="5" cy="7" r="0.6" fill="#111"/><circle cx="9" cy="7" r="0.6" fill="#111"/>
    </g>
  </g>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="${T.bg}" rx="10"/>
  <text x="${m.left}" y="22" fill="${T.text}" font-size="13" font-family="Segoe UI, Arial, sans-serif">
    ${user} • Pac-Man Contributions
  </text>
  ${rects}
  ${pellets}
  ${ghost(T.ghost1, "0s", 28)}
  ${ghost(T.ghost2, "0.4s", 52)}
  ${pacman}
</svg>`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg, "utf8");
console.log("Generated:", out);
