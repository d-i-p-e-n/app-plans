#!/usr/bin/env node
// Builds the animated intellidip logo system from the static wordmark SVG.
//
// Everything here is DERIVED from firebase/intellidip/public/assets/brand/intellidip-wordmark-*.svg,
// so regenerating the static system (tools/generate-intellidip-logo.ps1) and re-running this script
// keeps the animation locked to the wordmark. Nothing is hand-transcribed.
//
//   node tools/build-intellidip-animation.mjs [outputDirectory]
//
// Choreography (see assets/brand/README.md):
//   act 1  three amber dots pop in left-to-right  .. a "thinking" ellipsis
//   act 2  the middle dot extrudes the i stem     .. the lockup is now the app icon
//   act 3  camera pulls back, dots fly outward,
//          letters fade+rise staggered by distance .. the full wordmark
//
// The anchor -- the middle dot at the wordmark's second i -- never moves relative to the letters.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.resolve(root, process.argv[2] ?? "firebase/intellidip/public/assets/brand");

/* ------------------------------------------------------------------ timeline */
// Absolute seconds. Every CSS duration/delay is emitted as calc(var(--id-t) * f)
// where f = seconds / T, so overriding --id-t rescales the whole sequence.
const T = 2.6;
const HOLD = 0.6; // Lottie only: beat on the finished wordmark before the comp ends

const TL = {
  dotPopDur: 0.34,
  dotPopDelay: [0.0, 0.24, 0.48],
  stemDelay: 1.1,
  stemDur: 0.42,
  camDelay: 1.8,
  camDur: 0.44,
  travelDelay: 1.8,
  travelDur: [0.8, 0, 0.5], // dot 1 travels ~3x farther than dot 3, at equal speed
  growDelay: 1.8,
  growDur: 0.44,
  letterStart: 2.0,
  letterSpan: 0.32, // stagger window for the first->last letter start
  letterDur: 0.28,
  letterRise: 14, // wordmark units
};

// Easing shared by the SVG (cubic-bezier) and the Lottie (in/out tangents).
const EASE_OUT_SOFT = [0.22, 1, 0.36, 1]; // camera pull-back, dot travel
const EASE_OUT_LETTER = [0.16, 1, 0.3, 1];
const EASE_OUT = [0.25, 1, 0.5, 1];

/* ---------------------------------------------------------------- geometry */
// Framing: the icon-stage lockup is proportioned exactly like intellidip-app-icon.svg
// (mark height / dot gap / dot radius all relative to the i stem width), so act 2 reads
// as the app icon at ANY camera zoom. Zoom only decides how large it sits in frame.
const ICON_DOT_R = 10; // from intellidip-app-icon.svg, same units as the wordmark
const ICON_DOT_GAP = 36;

const WEB_ZOOM = 1.45; // capped by the 250-unit tall wordmark viewBox
const SPLASH_ZOOM = 4.2; // square comp: matches the app icon's 59%-of-frame mark height
const SPLASH_SIZE = 1024;
const SPLASH_WORDMARK_WIDTH_RATIO = 0.7;

const COLORS = {
  ink: "#0E1017",
  ivory: "#FFF8E7",
  amber: "#F3A30F",
  amberOnLight: "#B87300",
};

/* ------------------------------------------------------------ path parsing */

function parseSubpaths(d) {
  const tokens = d.match(/[A-Za-z]|[-+]?[0-9]*\.?[0-9]+/g) ?? [];
  const subs = [];
  let cur = null;
  let i = 0;
  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    const t = tokens[i++];
    switch (t) {
      case "M": {
        if (cur) subs.push(cur);
        const x = num();
        const y = num();
        cur = { start: [x, y], segs: [], closed: false };
        break;
      }
      case "L": {
        const x = num();
        const y = num();
        cur.segs.push({ t: "L", p: [[x, y]] });
        break;
      }
      case "C": {
        const p = [];
        for (let k = 0; k < 3; k++) p.push([num(), num()]);
        cur.segs.push({ t: "C", p });
        break;
      }
      case "Z":
      case "z":
        cur.closed = true;
        break;
      default:
        throw new Error(`Unsupported path command "${t}" — the generator only emits M/L/C/Z.`);
    }
  }
  if (cur) subs.push(cur);
  for (const s of subs) s.bbox = subpathBBox(s);
  return subs;
}

// Control-point bbox: a superset of the true bbox, which is all we need for
// classifying tittles, nesting counters inside their outer contour, and
// measuring how far each glyph sits from the anchor.
function subpathBBox(sub) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const eat = ([x, y]) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  eat(sub.start);
  for (const s of sub.segs) for (const p of s.p) eat(p);
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

function subpathToPathData(sub, fmt = num) {
  const parts = [`M${fmt(sub.start[0])} ${fmt(sub.start[1])}`];
  for (const s of sub.segs) {
    if (s.t === "L") parts.push(`L${fmt(s.p[0][0])} ${fmt(s.p[0][1])}`);
    else parts.push(`C${s.p.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(" ")}`);
  }
  if (sub.closed) parts.push("Z");
  return parts.join(" ");
}

const num = (v) => {
  const r = Math.round(v * 1000) / 1000;
  return String(r);
};

function contains(outer, inner) {
  return (
    outer.minX <= inner.minX &&
    outer.maxX >= inner.maxX &&
    outer.minY <= inner.minY &&
    outer.maxY >= inner.maxY
  );
}

// Splits the compound wordmark path into glyphs: one outer contour each, with its
// counters nested inside, plus the ink tittle paired to whichever stem sits under it.
function groupGlyphs(subs) {
  const isTittle = (s) =>
    s.bbox.maxX - s.bbox.minX < 40 && s.bbox.maxY - s.bbox.minY < 40 && s.bbox.maxY < 70;

  const tittles = subs.filter(isTittle);
  const body = subs.filter((s) => !isTittle(s));

  const outers = body.filter((s) => !body.some((o) => o !== s && contains(o.bbox, s.bbox)));
  const glyphs = outers
    .map((outer) => ({ paths: [outer], tittle: null, bbox: outer.bbox }))
    .sort((a, b) => a.bbox.minX - b.bbox.minX);

  for (const s of body) {
    if (outers.includes(s)) continue;
    const host = glyphs.find((g) => contains(g.paths[0].bbox, s.bbox));
    if (!host) throw new Error("Found a counter contour with no containing glyph.");
    host.paths.push(s);
  }

  for (const t of tittles) {
    const host = glyphs.find((g) => g.bbox.minX <= t.bbox.cx && g.bbox.maxX >= t.bbox.cx);
    if (!host) throw new Error("Found a tittle with no stem beneath it.");
    if (host.tittle) throw new Error("Two tittles resolved to the same stem.");
    host.tittle = t;
  }

  if (glyphs.length !== 10) {
    throw new Error(`Expected 10 glyphs for "intellidip", found ${glyphs.length}.`);
  }
  const dotted = glyphs.map((g, i) => (g.tittle ? i : -1)).filter((i) => i >= 0);
  if (dotted.join(",") !== "0,6,8") {
    throw new Error(`Expected tittles on glyphs 0/6/8 (i-n-t-e-l-l-i-d-i-p), got ${dotted}.`);
  }
  return glyphs;
}

/* ------------------------------------------------------- read static source */

function readWordmark(file) {
  const svg = fs.readFileSync(path.join(outDir, file), "utf8");
  const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  const d = /<path[^>]*\sd="([^"]+)"/.exec(svg);
  if (!viewBox || !d) throw new Error(`Could not read geometry from ${file}.`);
  const dots = [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
    r: Number(m[3]),
  }));
  if (dots.length !== 3) throw new Error(`Expected 3 amber dots in ${file}, found ${dots.length}.`);
  return {
    width: Number(viewBox[1]),
    height: Number(viewBox[2]),
    subs: parseSubpaths(d[1]),
    dots: dots.sort((a, b) => a.x - b.x),
  };
}

const wordmark = readWordmark("intellidip-wordmark-dark.svg");
const glyphs = groupGlyphs(wordmark.subs);
const DOT_R = wordmark.dots[1].r;

// The anchor: the middle dot, which is the second i of intell-i-dip.
const anchor = { x: wordmark.dots[1].x, y: wordmark.dots[1].y };

// The stem that extrudes from the anchor dot in act 2.
const anchorGlyphIndex = 6;

// Ink extent of the finished wordmark, used to centre the splash composition.
const inkBox = (() => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const g of glyphs) {
    for (const p of [...g.paths, g.tittle].filter(Boolean)) {
      minX = Math.min(minX, p.bbox.minX);
      minY = Math.min(minY, p.bbox.minY);
      maxX = Math.max(maxX, p.bbox.maxX);
      maxY = Math.max(maxY, p.bbox.maxY);
    }
  }
  for (const dt of wordmark.dots) {
    minX = Math.min(minX, dt.x - dt.r);
    minY = Math.min(minY, dt.y - dt.r);
    maxX = Math.max(maxX, dt.x + dt.r);
    maxY = Math.max(maxY, dt.y + dt.r);
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
})();

// Vertical extent of the icon-stage lockup, in wordmark units, measured from the dot row.
const lockup = (() => {
  const stem = glyphs[anchorGlyphIndex].paths[0].bbox;
  const top = anchor.y - ICON_DOT_R;
  const bottom = stem.maxY;
  return { top, bottom, height: bottom - top, cy: (top + bottom) / 2 };
})();

/* --------------------------------------------------------- act 3 stagger */
// Letters reveal outward from the anchor, delay proportional to distance. This makes each
// dot land at almost exactly the moment its own stem appears, with no hand-tuning.
const letters = glyphs
  .map((g, i) => ({ g, i, dist: Math.abs(g.bbox.cx - anchor.x) }))
  .filter((l) => l.i !== anchorGlyphIndex)
  .sort((a, b) => a.dist - b.dist);

const distMin = letters[0].dist;
const distMax = letters[letters.length - 1].dist;
for (const l of letters) {
  const f = (l.dist - distMin) / (distMax - distMin);
  l.delay = TL.letterStart + f * TL.letterSpan;
}

// Travel offsets: dots start at the app icon's spacing around the anchor and fly to their i's.
const dotPlan = wordmark.dots.map((dt, i) => {
  const iconX = anchor.x + (i - 1) * ICON_DOT_GAP;
  return {
    index: i,
    finalX: dt.x,
    y: dt.y,
    startOffset: iconX - dt.x, // translateX at t=0 of act 3
    travelDur: TL.travelDur[i],
    popDelay: TL.dotPopDelay[i],
  };
});

// Each tittle is hidden until its own dot has landed on top of it, so the ink tittle is
// never visible uncovered. i2's tittle appears with the middle dot's pop.
const tittlePlan = [
  { glyph: 0, end: TL.travelDelay + TL.travelDur[0], dur: 0.06 },
  { glyph: 6, start: TL.dotPopDelay[1], dur: 0.2 },
  { glyph: 8, end: TL.travelDelay + TL.travelDur[2], dur: 0.06 },
].map((t) => ({ ...t, start: t.start ?? t.end - t.dur }));

/* --------------------------------------------------------- camera framing */
// A camera that only zoomed (never panned) about a screen-fixed anchor would leave one of
// the two key states badly framed, because the anchor dot is up-and-right of the finished
// wordmark's optical centre. Zoom + a small simultaneous pan centres BOTH the icon stage
// and the final wordmark. Nothing moves relative to the letters; only the camera moves.
function cameraStart(zoom, frameW, frameH, place) {
  // place: maps wordmark units -> frame units for the FINAL state (scale s, offset ox/oy).
  const { s, ox, oy } = place;
  const anchorFrame = { x: anchor.x * s + ox, y: anchor.y * s + oy };
  // Where the icon-stage lockup's centre lands with pan = 0.
  const iconCx = anchorFrame.x;
  const iconCy = anchorFrame.y + (lockup.cy - anchor.y) * s * zoom;
  return {
    anchorFrame,
    pan: { x: frameW / 2 - iconCx, y: frameH / 2 - iconCy },
  };
}

/* --------------------------------------------------------------- SVG build */

const f = (seconds) => Math.round((seconds / T) * 10000) / 10000;
const cb = ([a, b, c, d]) => `cubic-bezier(${a},${b},${c},${d})`;
const anim = (name, dur, easing, delay) =>
  `animation:${name} calc(var(--id-t)*${f(dur)}) ${cb(easing)} calc(var(--id-t)*${f(delay)}) both;`;

function buildSvg({ file, letterColor, dotColor, desc }) {
  const place = { s: 1, ox: 0, oy: 0 };
  const cam = cameraStart(WEB_ZOOM, wordmark.width, wordmark.height, place);

  const rules = [];
  rules.push(
    `svg{--id-t:${T}s}`,
    `.id-cam{transform-origin:${num(anchor.x)}px ${num(anchor.y)}px;${anim(
      "id-cam",
      TL.camDur,
      EASE_OUT_SOFT,
      TL.camDelay
    )}}`,
    `.id-letter{${anim("id-letter", TL.letterDur, EASE_OUT_LETTER, 0)}}`,
    `.id-stem{transform-origin:${num(anchor.x)}px ${num(anchor.y)}px;${anim(
      "id-stem",
      TL.stemDur,
      EASE_OUT,
      TL.stemDelay
    )}}`,
    `.id-pop{transform-box:fill-box;transform-origin:center;${anim(
      "id-pop",
      TL.dotPopDur,
      EASE_OUT,
      0
    )}}`,
    `.id-grow{${anim("id-grow", TL.growDur, EASE_OUT_SOFT, TL.growDelay)}}`,
    `.id-travel{${anim("id-travel", 1, EASE_OUT_SOFT, TL.travelDelay)}}`
  );

  for (const l of letters) {
    rules.push(`.id-l${l.i}{animation-delay:calc(var(--id-t)*${f(l.delay)})}`);
  }
  for (const t of tittlePlan) {
    rules.push(
      `.id-tit${t.glyph}{${anim("id-fade", t.dur, EASE_OUT, t.start)}}`
    );
  }
  for (const d of dotPlan) {
    rules.push(`.id-pop${d.index}{animation-delay:calc(var(--id-t)*${f(d.popDelay)})}`);
    rules.push(
      `.id-grow${d.index}{transform-origin:${num(d.finalX)}px ${num(d.y)}px}`,
      `.id-travel${d.index}{animation-duration:calc(var(--id-t)*${f(d.travelDur)});--id-dx:${num(
        d.startOffset
      )}px}`
    );
  }

  rules.push(
    `@keyframes id-cam{from{transform:translate(${num(cam.pan.x)}px,${num(
      cam.pan.y
    )}px) scale(${WEB_ZOOM})}to{transform:translate(0,0) scale(1)}}`,
    `@keyframes id-letter{from{opacity:0;transform:translateY(${TL.letterRise}px)}to{opacity:1;transform:translateY(0)}}`,
    `@keyframes id-stem{0%{opacity:0;transform:scaleY(.05)}45%{opacity:1}72%{transform:scaleY(1.045)}100%{opacity:1;transform:scaleY(1)}}`,
    `@keyframes id-pop{0%{opacity:0;transform:scale(0)}55%{opacity:1;transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}`,
    `@keyframes id-grow{from{transform:scale(${num(ICON_DOT_R / DOT_R)})}to{transform:scale(1)}}`,
    `@keyframes id-fade{from{opacity:0}to{opacity:1}}`,
    `@keyframes id-travel{from{transform:translateX(var(--id-dx))}to{transform:translateX(0)}}`,
    // Static markup is already the finished wordmark, so switching the animations off
    // lands exactly on the final frame.
    `@media (prefers-reduced-motion:reduce){.id-cam,.id-cam *{animation:none!important}}`
  );

  const glyphMarkup = [];
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const d = g.paths.map((p) => subpathToPathData(p)).join(" ");
    if (i === anchorGlyphIndex) {
      glyphMarkup.push(`    <path class="id-stem" d="${d}"/>`);
    } else {
      glyphMarkup.push(`    <path class="id-letter id-l${i}" d="${d}"/>`);
    }
    if (g.tittle) {
      glyphMarkup.push(
        `    <path class="id-tit${i}" d="${subpathToPathData(g.tittle)}"/>`
      );
    }
  }

  const dotMarkup = dotPlan.map(
    (d) => `    <g class="id-travel id-travel${d.index}"><g class="id-grow id-grow${
      d.index
    }"><circle class="id-pop id-pop${d.index}" cx="${num(d.finalX)}" cy="${num(d.y)}" r="${num(
      DOT_R
    )}"/></g></g>`
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wordmark.width} ${
    wordmark.height
  }" role="img" aria-labelledby="idTitle idDesc">
  <title id="idTitle">intellidip</title>
  <desc id="idDesc">${desc}</desc>
  <style>
${rules.map((r) => `    ${r}`).join("\n")}
  </style>
  <g class="id-cam">
    <g fill="${letterColor}" fill-rule="evenodd">
${glyphMarkup.join("\n")}
    </g>
    <g fill="${dotColor}">
${dotMarkup.join("\n")}
    </g>
  </g>
</svg>
`;
  fs.writeFileSync(path.join(outDir, file), svg, "utf8");
  return file;
}

/* ------------------------------------------------------------ Lottie build */

const FPS = 60;
const fr = (seconds) => Math.round(seconds * FPS * 1000) / 1000;

function hexToLottie(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
}

// Two-or-more keyframe animated property with per-segment cubic easing.
function prop(stops) {
  const k = stops.map((s, i) => {
    const kf = { t: fr(s.t), s: s.v };
    if (i < stops.length - 1) {
      const [x1, y1, x2, y2] = s.ease ?? EASE_OUT;
      kf.o = { x: [x1], y: [y1] };
      kf.i = { x: [x2], y: [y2] };
    }
    return kf;
  });
  return { a: 1, k };
}
const still = (v) => ({ a: 0, k: v });

// SVG cubic path -> Lottie bezier (vertices with tangents relative to each vertex).
function subpathToLottie(sub, map) {
  const verts = [{ v: map(sub.start), i: [0, 0], o: [0, 0] }];
  let cur = sub.start;
  for (const seg of sub.segs) {
    if (seg.t === "L") {
      verts.push({ v: map(seg.p[0]), i: [0, 0], o: [0, 0] });
      cur = seg.p[0];
    } else {
      const [c1, c2, end] = seg.p;
      const last = verts[verts.length - 1];
      const mc = map(cur);
      const m1 = map(c1);
      last.o = [m1[0] - mc[0], m1[1] - mc[1]];
      const me = map(end);
      const m2 = map(c2);
      verts.push({ v: me, i: [m2[0] - me[0], m2[1] - me[1]], o: [0, 0] });
      cur = end;
    }
  }
  // A closed contour that returns to its start carries a duplicate final vertex.
  if (sub.closed && verts.length > 1) {
    const a = verts[0].v;
    const b = verts[verts.length - 1].v;
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6) {
      verts[0].i = verts[verts.length - 1].i;
      verts.pop();
    }
  }
  return {
    i: verts.map((p) => p.i),
    o: verts.map((p) => p.o),
    v: verts.map((p) => p.v),
    c: sub.closed,
  };
}

function buildLottie({ file, name, background, letterColor, dotColor }) {
  const s =
    (SPLASH_SIZE * SPLASH_WORDMARK_WIDTH_RATIO) / (inkBox.maxX - inkBox.minX);
  const ox = SPLASH_SIZE / 2 - inkBox.cx * s;
  const oy = SPLASH_SIZE / 2 - inkBox.cy * s;
  const place = { s, ox, oy };
  const map = ([x, y]) => [round(x * s + ox), round(y * s + oy)];
  const cam = cameraStart(SPLASH_ZOOM, SPLASH_SIZE, SPLASH_SIZE, place);
  const A = cam.anchorFrame;
  const op = fr(T + HOLD);

  const layers = [];
  let ind = 1;
  const CAM_IND = ind++;

  const base = (nm, extra = {}) => ({
    ddd: 0,
    ind: ind++,
    ty: 4,
    nm,
    parent: CAM_IND,
    sr: 1,
    ao: 0,
    ip: 0,
    op,
    st: 0,
    bm: 0,
    ...extra,
  });

  const group = (paths, color) => [
    {
      ty: "gr",
      nm: "glyph",
      it: [
        ...paths.map((p, i) => ({
          ty: "sh",
          ind: i,
          nm: `path ${i}`,
          ks: still(subpathToLottie(p, map)),
        })),
        {
          ty: "fl",
          nm: "fill",
          c: still(hexToLottie(color)),
          o: still(100),
          r: 2, // even-odd, matching the static SVG's fill-rule
          bm: 0,
        },
        {
          ty: "tr",
          p: still([0, 0]),
          a: still([0, 0]),
          s: still([100, 100]),
          r: still(0),
          o: still(100),
          sk: still(0),
          sa: still(0),
        },
      ],
    },
  ];

  /* dots -------------------------------------------------------------- */
  for (const d of [...dotPlan].reverse()) {
    const finish = [round(d.finalX * s + ox), round(d.y * s + oy)];
    const start = [round((d.finalX + d.startOffset) * s + ox), finish[1]];
    const iconSize = round(2 * ICON_DOT_R * s);
    const finalSize = round(2 * DOT_R * s);

    layers.push({
      ddd: 0,
      ind: ind++,
      ty: 4,
      nm: `dot ${d.index + 1}`,
      parent: CAM_IND,
      sr: 1,
      ao: 0,
      ip: 0,
      op,
      st: 0,
      bm: 0,
      ks: {
        o: prop([
          { t: d.popDelay, v: [0], ease: EASE_OUT },
          { t: d.popDelay + TL.dotPopDur * 0.55, v: [100] },
        ]),
        r: still(0),
        p:
          d.travelDur > 0
            ? prop([
                { t: TL.travelDelay, v: start, ease: EASE_OUT_SOFT },
                { t: TL.travelDelay + d.travelDur, v: finish },
              ])
            : still([...finish, 0]),
        a: still([0, 0, 0]),
        s: still([100, 100, 100]),
      },
      shapes: [
        {
          ty: "gr",
          nm: "dot",
          it: [
            {
              ty: "el",
              nm: "ellipse",
              p: still([0, 0]),
              s: prop([
                { t: TL.growDelay, v: [iconSize, iconSize], ease: EASE_OUT_SOFT },
                { t: TL.growDelay + TL.growDur, v: [finalSize, finalSize] },
              ]),
              d: 1,
            },
            { ty: "fl", nm: "fill", c: still(hexToLottie(dotColor)), o: still(100), r: 1, bm: 0 },
            {
              ty: "tr",
              // Pop happens about the dot's own centre; travel lives on the layer transform.
              p: still([0, 0]),
              a: still([0, 0]),
              s: prop([
                { t: d.popDelay, v: [0, 0], ease: EASE_OUT },
                { t: d.popDelay + TL.dotPopDur * 0.55, v: [112, 112], ease: EASE_OUT },
                { t: d.popDelay + TL.dotPopDur, v: [100, 100] },
              ]),
              r: still(0),
              o: still(100),
              sk: still(0),
              sa: still(0),
            },
          ],
        },
      ],
    });
  }

  /* glyphs ------------------------------------------------------------ */
  // Painted below the dots, ordered so the leftmost glyph sits on top (irrelevant
  // visually — they never overlap — but keeps the layer list readable).
  const glyphLayers = [];
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const nm = `glyph ${i}`;

    if (i === anchorGlyphIndex) {
      glyphLayers.push({
        ...base(`${nm} (anchor stem)`),
        ks: {
          o: prop([
            { t: TL.stemDelay, v: [0], ease: EASE_OUT },
            { t: TL.stemDelay + TL.stemDur * 0.45, v: [100] },
          ]),
          r: still(0),
          p: still([A.x, A.y, 0]),
          a: still([A.x, A.y, 0]),
          s: prop([
            { t: TL.stemDelay, v: [100, 5, 100], ease: EASE_OUT },
            { t: TL.stemDelay + TL.stemDur * 0.72, v: [100, 104.5, 100], ease: EASE_OUT },
            { t: TL.stemDelay + TL.stemDur, v: [100, 100, 100] },
          ]),
        },
        shapes: group(g.paths, letterColor),
      });
    } else {
      const plan = letters.find((l) => l.i === i);
      const rise = round(TL.letterRise * s);
      glyphLayers.push({
        ...base(nm),
        ks: {
          o: prop([
            { t: plan.delay, v: [0], ease: EASE_OUT_LETTER },
            { t: plan.delay + TL.letterDur, v: [100] },
          ]),
          r: still(0),
          p: prop([
            { t: plan.delay, v: [0, rise], ease: EASE_OUT_LETTER },
            { t: plan.delay + TL.letterDur, v: [0, 0] },
          ]),
          a: still([0, 0, 0]),
          s: still([100, 100, 100]),
        },
        shapes: group(g.paths, letterColor),
      });
    }

    if (g.tittle) {
      const t = tittlePlan.find((p) => p.glyph === i);
      glyphLayers.push({
        ...base(`${nm} tittle`),
        ks: {
          o: prop([
            { t: t.start, v: [0], ease: EASE_OUT },
            { t: t.start + t.dur, v: [100] },
          ]),
          r: still(0),
          p: still([0, 0, 0]),
          a: still([0, 0, 0]),
          s: still([100, 100, 100]),
        },
        shapes: group([g.tittle], letterColor),
      });
    }
  }
  layers.push(...glyphLayers);

  /* camera + background ---------------------------------------------- */
  layers.unshift({
    ddd: 0,
    ind: CAM_IND,
    ty: 3,
    nm: "camera",
    sr: 1,
    ao: 0,
    ip: 0,
    op,
    st: 0,
    bm: 0,
    ks: {
      o: still(100),
      r: still(0),
      p: prop([
        {
          t: TL.camDelay,
          v: [round(A.x + cam.pan.x), round(A.y + cam.pan.y)],
          ease: EASE_OUT_SOFT,
        },
        { t: TL.camDelay + TL.camDur, v: [round(A.x), round(A.y)] },
      ]),
      a: still([A.x, A.y, 0]),
      s: prop([
        { t: TL.camDelay, v: [SPLASH_ZOOM * 100, SPLASH_ZOOM * 100, 100], ease: EASE_OUT_SOFT },
        { t: TL.camDelay + TL.camDur, v: [100, 100, 100] },
      ]),
    },
  });

  layers.push({
    ddd: 0,
    ind: ind++,
    ty: 1,
    nm: "background",
    sr: 1,
    ao: 0,
    ip: 0,
    op,
    st: 0,
    bm: 0,
    sc: background,
    sw: SPLASH_SIZE,
    sh: SPLASH_SIZE,
    ks: {
      o: still(100),
      r: still(0),
      p: still([SPLASH_SIZE / 2, SPLASH_SIZE / 2, 0]),
      a: still([SPLASH_SIZE / 2, SPLASH_SIZE / 2, 0]),
      s: still([100, 100, 100]),
    },
  });

  const json = {
    v: "5.9.0",
    fr: FPS,
    ip: 0,
    op,
    w: SPLASH_SIZE,
    h: SPLASH_SIZE,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
    meta: {
      g: "tools/build-intellidip-animation.mjs",
      d: "intellidip splash animation, generated from the static wordmark.",
    },
  };
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(json), "utf8");
  return file;
}

function round(v) {
  return Math.round(v * 1000) / 1000;
}

/* --------------------------------------------------------------- generate */

const written = [];

written.push(
  buildSvg({
    file: "intellidip-wordmark-animated-dark.svg",
    letterColor: COLORS.ivory,
    dotColor: COLORS.amber,
    desc:
      "Animated ivory wordmark for dark backgrounds: three amber thinking dots appear, the i stem drops from the middle dot, then the word expands outward.",
  }),
  buildSvg({
    file: "intellidip-wordmark-animated-light.svg",
    letterColor: COLORS.ink,
    dotColor: COLORS.amberOnLight,
    desc:
      "Animated near-black wordmark for light backgrounds: three amber thinking dots appear, the i stem drops from the middle dot, then the word expands outward.",
  }),
  buildSvg({
    file: "intellidip-wordmark-animated-mono-light.svg",
    letterColor: COLORS.ivory,
    dotColor: COLORS.ivory,
    desc: "Single-color ivory animated wordmark.",
  }),
  buildSvg({
    file: "intellidip-wordmark-animated-mono-dark.svg",
    letterColor: COLORS.ink,
    dotColor: COLORS.ink,
    desc: "Single-color near-black animated wordmark.",
  }),
  buildLottie({
    file: "intellidip-splash-dark.json",
    name: "intellidip splash (dark)",
    background: COLORS.ink,
    letterColor: COLORS.ivory,
    dotColor: COLORS.amber,
  }),
  buildLottie({
    file: "intellidip-splash-light.json",
    name: "intellidip splash (light)",
    background: COLORS.ivory,
    letterColor: COLORS.ink,
    dotColor: COLORS.amberOnLight,
  })
);

const manifest = {
  generatedAt: new Date().toISOString(),
  source: "intellidip-wordmark-dark.svg",
  totalDuration: `${T}s`,
  splashHold: `${HOLD}s`,
  anchor: { x: anchor.x, y: anchor.y, glyph: anchorGlyphIndex, note: "second i of intell-i-dip" },
  webZoom: WEB_ZOOM,
  splashZoom: SPLASH_ZOOM,
  splashComposition: `${SPLASH_SIZE}x${SPLASH_SIZE} @ ${FPS}fps`,
  letterOrder: letters.map((l) => ({ glyph: l.i, distance: round(l.dist), delay: round(l.delay) })),
  files: written,
};
fs.writeFileSync(
  path.join(outDir, "animation-system.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

console.log(`Generated intellidip animated logo system at ${outDir}`);
for (const w of written) console.log(`  ${w}`);
