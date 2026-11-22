// render.mjs — draws "The World in One Image — Sunday 22 November 2026"
// A newspaper front page: masthead, lead story with a Gulf illustration,
// a world map with eight numbered pins, a 28-story grid, an also-today
// strip and a Gulf-markets ticker. Pure Node + pureimage 0.3.17 (installed
// in the build env, not shipped). Run: node tools/render.mjs -> entry.png.
import * as PImage from 'pureimage';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.ENTRY_PNG || path.join(ROOT, 'entry.png');
const W = 1024, H = 1024;

// ---- palette ----
const PAPER = '#f7f2e7';
const INK = '#17130c';
const NAVY = '#10233d';
const RED = '#a61e22';
const GOLD = '#c9971c';
const GREY = '#5c564a';
const LINE = '#b9ae97';
const SEA = '#0b2233';
const SAND = '#c9a86a';

// ---- the day's stories: every one verified against live reporting dated
// 22 November 2026 (Reuters, AP, BBC, CNN, AFP, Sky, Formula 1).
// Headlines are short so they stay legible at 1024px.
const LEAD = {
  kicker: 'MANAMA  •  RIYADH  •  HORMUZ',
  head: "IRAN STRIKES AT US BASES IN BAHRAIN AS THE GULF WAR WIDENS",
  deck: [
    "Tehran's Guards claim missiles and drones hit US Fifth Fleet positions;",
    'Bahrain says its defences intercepted the attack and a civilian plant',
    'burned. A Houthi missile aimed at western Saudi Arabia is stopped;',
    'two tankers are hit near Hormuz as Gulf markets slide.',
  ],
  caption: 'Twelve reported hurt at Mina Salman; US official: no impact on American forces.',
};

const GRID = [
  { tag: 'HORMUZ', head: 'Iran claims control of the strait', sub: "F-16 'damaged', two tankers hit" },
  { tag: 'GULF OF FINLAND', head: 'Sparta II still burning after drone hit', sub: 'Crew evacuated; Finland blames Ukraine' },
  { tag: 'WASHINGTON', head: "Trump wants 'permanent' Iran deal", sub: "Calls talks 'very difficult'" },
  { tag: 'RIYADH', head: 'Gulf markets slide as attacks go on', sub: 'Saudi −1.7%, Qatar −1.5%' },
  { tag: 'ANTALYA', head: "COP31 draft drops 'fossil fuels'", sub: "EU calls text a 'backwards step'" },
  { tag: 'ANTALYA', head: 'Deal would admit 1.5°C overshoot', sub: '1bn-tonne carbon capture goal' },
  { tag: 'SINALOA', head: "'El Chapo Isidro' seized in shoot-out", sub: '11 dead in FBI most-wanted arrest' },
  { tag: 'WASHINGTON', head: 'FBI probes hack of crime database', sub: 'Trump confirms NCIC breach' },
  { tag: 'LAS VEGAS', head: 'Verstappen wins wild Vegas GP', sub: 'Ferraris collide; 35 lead changes' },
  { tag: 'LONDON', head: 'Leeds stun Chelsea 4-1 at the Bridge', sub: 'First win there since 1999' },
  { tag: 'MANCHESTER', head: 'City stumble; Arsenal held by Newcastle', sub: 'Title race tightens' },
  { tag: 'SAN ANTONIO', head: 'Wembanyama scores 50 in Spurs win', sub: 'Pelicans beaten 114-91' },
  { tag: 'MANCHESTER', head: 'Fernandes pauses United contract talks', sub: "'Not the right time', says captain" },
  { tag: 'JAKARTA', head: 'Factory fire kills 3; 36 missing', sub: 'Blaze at confectionary plant' },
  { tag: 'NIGERIA', head: '24 dead as boat capsizes on funeral trip', sub: 'Overcrowded vessel sinks' },
  { tag: 'FUKUSHIMA', head: 'Snow strands 1,500 in village', sub: 'Trees fall, roads blocked' },
  { tag: 'FLORIDA', head: 'River breaks 73-year flood record', sub: 'Floods may last into January' },
  { tag: 'MANIPUR', head: 'Toxic alcohol kills 11; 180 in hospital', sub: 'Chief minister confirms toll' },
  { tag: 'BASRA', head: 'Power station fire kills 4, injures 35', sub: 'Cause unknown, state media says' },
  { tag: 'KYIV', head: "Zelensky: bridge strikes 'fair response'", sub: "Calls Putin a 'killer'" },
  { tag: 'WARSAW', head: 'NATO council meets Monday on breach', sub: "Rutte: 'every inch' defended" },
  { tag: 'GENEVA', head: "128 nations agree on 'killer robot' rules", sub: 'Accord aimed by 2028' },
  { tag: 'LONDON', head: 'UK turns against Brexit, polls say', sub: "May: 'Brexit is done'" },
  { tag: 'BRUSSELS', head: 'EU proposes digital tax', sub: 'Budget rows deepen' },
  { tag: 'NEW YORK', head: 'Amazon nears $7.5bn AI chip deal', sub: 'Israeli startup Decart in sights' },
  { tag: 'NEW YORK', head: 'GTA 6 sets $3.79bn launch record', sub: 'Biggest game debut ever' },
  { tag: 'WASHINGTON', head: 'US declassifies more UFO footage', sub: 'Clips filmed in Middle East' },
  { tag: 'BEIRUT', head: 'UNIFIL hands posts to Lebanese army', sub: 'Mandate ends 31 December' },
];

const MORE = [
  'Musk: Russian soldiers deserve more empathy',
  "IBM unveils 520-qubit 'Nighthawk r3'",
  'Teen gamer and mother rescue missing girl',
  "Washington's hair sells for $4,000",
  'German politician assaulted at Berlin protest',
  'China renews UN bid to blacklist BLA',
  'Pakistan: 15 militants killed in Mastung',
  'Aoun demands Israeli pull-out from Lebanon',
  'Bondi responders marry near attack site',
];

const PINS = [
  [1, 50.6, 26.2, 'Bahrain — Guards strike at US Fifth Fleet'],
  [2, 46.7, 24.6, 'Riyadh — Houthi missile intercepted'],
  [3, 56.3, 26.6, 'Hormuz — tankers hit, Iran claims strait'],
  [4, 27.0, 59.9, 'Gulf of Finland — Sparta II still burning'],
  [5, 30.7, 36.9, 'Antalya — COP31 draft drops fossil fuels'],
  [6, -107.4, 24.8, 'Sinaloa — "El Chapo Isidro" captured'],
  [7, 47.8, 30.5, 'Basra — power station fire kills 4'],
  [8, 106.8, -6.2, 'Jakarta — factory fire, 36 missing'],
];

const TICKER = 'GULF MARKETS  TASI −1.7%  •  QSI −1.5%  •  BAX −0.4%  •  COP31 IN OVERTIME, DAY 2  •  F1: VERSTAPPEN 37 PTS CLEAR  •  ';
const SOURCES = 'Sources: Reuters • AP • BBC • CNN • AFP — all stories first reported 22 November 2026  •  The World in One Image — make.fun news-image-20261122';

// ---- drawing helpers ----
// pureimage 0.3 parses ctx.font as "<size>px <family>" only: no weight,
// no quotes. Weight is chosen by registering the bold file as its own
// family (SerifBold / SansBold) and naming that family here.
function font(ctx, size, family) {
  ctx.font = `${size}px ${family}`;
}
function wrap(ctx, s, maxW) {
  const words = s.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width <= maxW || !line) line = t;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}
function rule(ctx, x, y, w, color, h) {
  ctx.fillStyle = color || LINE;
  ctx.fillRect(x, y, w, h || 1);
}
function box(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function dot(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function poly(ctx, pts, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}
// A quadratic Bezier drawn as a polyline (pureimage has no curve helper
// we want to rely on): p0 -> control -> p1, sampled in 24 steps.
function arcLine(ctx, p0, pc, p1, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * pc[0] + t * t * p1[0];
    const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * pc[1] + t * t * p1[1];
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ---- world map: coarse continent outlines in lon/lat, traced by hand ----
// from a plain atlas (equirectangular). Kept deliberately coarse so the
// shapes read as a stylised map, not a survey.
const CONTINENTS = [
  // North America
  [[-168, 66], [-150, 70], [-130, 71], [-110, 69], [-95, 69], [-85, 66], [-76, 62], [-65, 60], [-56, 52], [-60, 47], [-70, 44], [-75, 39], [-80, 32], [-81, 26], [-87, 30], [-93, 19], [-97, 25], [-105, 20], [-110, 23], [-117, 32], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-162, 58]],
  // South America
  [[-79, 9], [-72, 11], [-62, 8], [-52, 4], [-44, -3], [-35, -8], [-39, -15], [-41, -22], [-48, -28], [-54, -34], [-62, -41], [-68, -50], [-70, -54], [-74, -50], [-73, -37], [-71, -20], [-76, -12], [-81, -4], [-80, 1]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 48], [1, 51], [5, 53], [8, 57], [11, 59], [18, 56], [21, 54], [24, 58], [28, 60], [30, 64], [40, 68], [44, 68], [38, 64], [34, 60], [30, 59], [24, 58], [19, 54], [13, 54], [9, 54], [5, 58], [0, 58], [-4, 50], [-2, 47], [-1, 43], [-9, 37]],
  // Africa
  [[-6, 35], [10, 37], [20, 32], [32, 31], [36, 28], [40, 20], [44, 12], [51, 11], [48, 4], [40, -6], [38, -16], [34, -26], [28, -33], [19, -35], [16, -28], [12, -18], [9, -1], [9, 4], [4, 6], [-7, 4], [-13, 8], [-17, 15], [-16, 27], [-11, 31]],
  // Asia
  [[30, 36], [34, 41], [38, 46], [44, 48], [50, 52], [56, 56], [62, 62], [68, 68], [74, 72], [82, 73], [90, 75], [100, 76], [110, 74], [120, 73], [130, 72], [140, 72], [150, 70], [158, 66], [162, 60], [170, 60], [178, 65], [170, 66], [162, 64], [156, 59], [148, 59], [142, 54], [141, 48], [138, 42], [134, 42], [130, 46], [127, 50], [122, 48], [118, 45], [114, 41], [110, 38], [106, 36], [102, 32], [100, 28], [97, 24], [94, 21], [91, 22], [88, 22], [85, 20], [82, 17], [80, 13], [78, 8], [76, 10], [73, 16], [70, 21], [67, 25], [64, 25], [61, 25], [58, 27], [56, 27], [53, 27], [50, 29], [48, 30], [45, 29], [43, 27], [41, 24], [40, 20], [39, 16], [37, 14], [35, 14], [36, 18], [38, 22], [39, 26], [40, 30], [38, 33], [36, 36], [33, 36]],
  // Australia
  [[113, -22], [122, -14], [130, -12], [136, -12], [142, -11], [146, -19], [150, -23], [153, -27], [150, -37], [146, -39], [140, -38], [134, -34], [129, -32], [124, -33], [118, -35], [114, -31], [113, -26]],
];

// ---- main drawing ----
async function draw() {
  const img = PImage.make(W, H);
  const ctx = img.getContext('2d');
  const SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf';
  const SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const SANSB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  PImage.registerFont(SERIF, 'SerifBold').loadSync();
  PImage.registerFont(SANS, 'Sans').loadSync();
  PImage.registerFont(SANSB, 'SansBold').loadSync();

  box(ctx, 0, 0, W, H, PAPER);

  // ===== masthead =====
  box(ctx, 0, 0, W, 88, NAVY);
  ctx.fillStyle = '#f7f2e7';
  font(ctx, 42, 'SerifBold');
  ctx.fillText('THE WORLD IN ONE IMAGE', 24, 52);
  ctx.fillStyle = GOLD;
  font(ctx, 15, 'SansBold');
  ctx.fillText('SUNDAY', 858, 30);
  ctx.fillStyle = '#f7f2e7';
  font(ctx, 15, 'Sans');
  ctx.fillText('22 NOVEMBER 2026', 858, 52);
  ctx.fillStyle = GOLD;
  font(ctx, 13, 'SansBold');
  ctx.fillText('38 STORIES  •  VERIFIED FROM LIVE REPORTING', 24, 78);
  rule(ctx, 0, 88, W, RED, 4);

  // ===== lead story (left) + illustration (right) =====
  const LY = 102;
  ctx.fillStyle = RED;
  font(ctx, 13, 'SansBold');
  ctx.fillText(LEAD.kicker, 24, LY + 14);
  ctx.fillStyle = INK;
  font(ctx, 25, 'SerifBold');
  const headLines = wrap(ctx, LEAD.head, 600);
  headLines.forEach((l, i) => ctx.fillText(l, 24, LY + 46 + i * 30));
  ctx.fillStyle = INK;
  font(ctx, 14, 'Sans');
  const deckTop = LY + 46 + headLines.length * 30 + 6;
  LEAD.deck.forEach((l, i) => ctx.fillText(l, 24, deckTop + i * 18));
  const deckBottom = deckTop + LEAD.deck.length * 18;

  // illustration: the Gulf overnight — sand coast, dark sea, two tankers,
  // missile arcs and bursts over the water
  const IX = 660, IY = 104, IW = 340, IH = 192;
  box(ctx, IX, IY, IW, IH, SEA);
  box(ctx, IX, IY, IW, 34, SAND);
  // coast skyline (Manama towers, dark against the sand)
  ctx.fillStyle = '#5e4a26';
  const towers = [[14, 12, 12, 22], [34, 6, 10, 28], [52, 16, 14, 18], [76, 10, 9, 24], [92, 18, 16, 16], [118, 8, 10, 26], [136, 16, 12, 18], [156, 12, 9, 22]];
  for (const [x, y, w, h] of towers) ctx.fillRect(IX + x, IY + y, w, h);
  // sea shimmer lines
  ctx.strokeStyle = '#1d4a63';
  ctx.lineWidth = 1;
  for (const yy of [52, 76, 100, 124, 148, 172]) {
    ctx.beginPath();
    ctx.moveTo(IX + 12, IY + yy);
    ctx.lineTo(IX + IW - 12, IY + yy);
    ctx.stroke();
  }
  // two tanker silhouettes
  ctx.fillStyle = '#050a18';
  ctx.fillRect(IX + 26, IY + 128, 110, 16);
  ctx.fillRect(IX + 108, IY + 116, 22, 12);
  ctx.fillRect(IX + 196, IY + 140, 96, 14);
  ctx.fillRect(IX + 196, IY + 130, 18, 10);
  // missile arcs: bright trails arcing down to the sea
  arcLine(ctx, [IX + 40, IY + 40], [IX + 120, IY + 10], [IX + 190, IY + 96], '#ffb347', 3);
  arcLine(ctx, [IX + 250, IY + 44], [IX + 290, IY + 20], [IX + 312, IY + 108], '#ffb347', 3);
  arcLine(ctx, [IX + 150, IY + 36], [IX + 210, IY + 8], [IX + 262, IY + 82], '#ff8c1a', 2);
  // burst where the first arc lands
  dot(ctx, IX + 190, IY + 96, 15, '#ff7a1a');
  dot(ctx, IX + 190, IY + 96, 8, '#ffd23f');
  dot(ctx, IX + 312, IY + 108, 10, '#ff7a1a');
  dot(ctx, IX + 312, IY + 108, 5, '#ffd23f');
  // stars
  dot(ctx, IX + 60, IY + 52, 2, '#ffffff');
  dot(ctx, IX + 160, IY + 60, 2, '#ffffff');
  dot(ctx, IX + 300, IY + 56, 2, '#ffffff');
  dot(ctx, IX + 230, IY + 66, 2, '#ffffff');
  ctx.fillStyle = '#f7f2e7';
  font(ctx, 11, 'SansBold');
  ctx.fillText('THE GULF, OVERNIGHT: MISSILES OVER BAHRAIN', IX + 8, IY + IH - 8);

  // caption strip under the lead text
  rule(ctx, 24, deckBottom + 10, 600, LINE, 1);
  ctx.fillStyle = GREY;
  font(ctx, 12, 'Sans');
  ctx.fillText(LEAD.caption, 24, deckBottom + 28);

  // ===== world map band =====
  const MY = 322;
  rule(ctx, 24, MY, 976, INK, 2);
  ctx.fillStyle = INK;
  font(ctx, 13, 'SansBold');
  ctx.fillText('WHERE THE DAY HAPPENED', 24, MY + 18);
  ctx.fillStyle = RED;
  ctx.fillText('8 PLACES', 904, MY + 18);
  const mapX = 24, mapY = MY + 26, mapW = 640, mapH = 108;
  box(ctx, mapX, mapY, mapW, mapH, '#dfe7ee');
  const px = (lon) => mapX + ((lon + 180) / 360) * mapW;
  const py = (lat) => mapY + ((84 - lat) / 168) * mapH;
  for (const cont of CONTINENTS) {
    poly(ctx, cont.map(([lo, la]) => [px(lo), py(la)]), '#8fa8bf');
  }
  // pins — offsets spread the clustered Gulf pins so numbers stay readable
  const PIN_OFF = { 1: [0, -13], 2: [-15, 11], 3: [15, -3], 4: [13, -6], 5: [-13, 9], 7: [11, 11] };
  for (const [n, lon, lat] of PINS) {
    const off = PIN_OFF[n] || [0, 0];
    const x = px(lon) + off[0], y = py(lat) + off[1];
    dot(ctx, x, y, 9, RED);
    ctx.fillStyle = '#ffffff';
    font(ctx, 10, 'SansBold');
    ctx.fillText(String(n), x - 3, y + 4);
  }
  // pin legend (right of map)
  let ly = mapY + 12;
  for (const [n, , , label] of PINS) {
    dot(ctx, 692, ly - 4, 9, RED);
    ctx.fillStyle = '#ffffff';
    font(ctx, 10, 'SansBold');
    ctx.fillText(String(n), 689, ly);
    ctx.fillStyle = INK;
    font(ctx, 12, 'Sans');
    ctx.fillText(label, 710, ly);
    ly += 15;
  }

  // ===== story grid: 4 columns x 7 rows =====
  const GY = 478;
  rule(ctx, 24, GY, 976, INK, 2);
  ctx.fillStyle = INK;
  font(ctx, 13, 'SansBold');
  ctx.fillText('THE DAY IN FULL', 24, GY + 18);
  const colW = 244, rowH = 57;
  const gx0 = 24, gy0 = GY + 28;
  GRID.forEach((s, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = gx0 + col * colW, y = gy0 + row * rowH;
    if (col > 0) rule(ctx, x - 8, y, 1, LINE, rowH - 10);
    ctx.fillStyle = RED;
    font(ctx, 10, 'SansBold');
    ctx.fillText(s.tag, x, y + 10);
    ctx.fillStyle = INK;
    font(ctx, 11, 'SansBold');
    const hl = wrap(ctx, s.head, colW - 16);
    hl.slice(0, 2).forEach((l, j) => ctx.fillText(l, x, y + 25 + j * 13));
    ctx.fillStyle = GREY;
    font(ctx, 10, 'Sans');
    const sl = wrap(ctx, s.sub, colW - 16);
    sl.slice(0, 1).forEach((l, j) => ctx.fillText(l, x, y + 25 + hl.slice(0, 2).length * 13 + j * 12));
  });

  // ===== more stories strip =====
  const SY = gy0 + 7 * rowH + 8;
  rule(ctx, 24, SY, 976, INK, 2);
  ctx.fillStyle = INK;
  font(ctx, 13, 'SansBold');
  ctx.fillText('ALSO TODAY', 24, SY + 18);
  MORE.forEach((m, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 24 + col * 328, y = SY + 28 + row * 11;
    ctx.fillStyle = RED;
    font(ctx, 10, 'Sans');
    ctx.fillText('▸', x, y);
    ctx.fillStyle = INK;
    ctx.fillText(m, x + 14, y, 306);
  });

  // ===== sources line + ticker =====
  ctx.fillStyle = GREY;
  font(ctx, 9, 'Sans');
  ctx.fillText(SOURCES, 24, H - 32);
  const TY = H - 24;
  box(ctx, 0, TY, W, 24, NAVY);
  ctx.fillStyle = '#ffd23f';
  font(ctx, 12, 'SansBold');
  ctx.fillText(TICKER, 12, TY + 17);

  const stream = fs.createWriteStream(OUT);
  await PImage.encodePNGToStream(img, stream);
  await new Promise((res, rej) => { stream.on('finish', res); stream.on('error', rej); });
  const size = fs.statSync(OUT).size;
  console.log(`wrote ${OUT} (${size} bytes, ${W}x${H})`);
}

draw().catch((e) => { console.error(e); process.exit(1); });
