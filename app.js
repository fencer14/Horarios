const TZ = "America/Argentina/Mendoza";
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const NOMBRES = { E: "Ezequiel", M: "Matteo", A: "Ambos" };

// Pixel art 12x12 ('#' = píxel encendido)
const ICONS = {
  sun: [".....##.....", ".#...##...#.", "..#......#..", "....####....", "...######...", "##.######.##", "##.######.##", "...######...", "....####....", "..#......#..", ".#...##...#.", ".....##....."],
  cloud: ["............", "....####....", "..########..", ".##########.", ".##########.", "############", "############", "############", ".##########.", "..########..", "............", "............"],
  rain: ["............", "....####....", "..########..", ".##########.", ".##########.", "############", "############", ".##########.", "..#..#..#...", ".#..#..#....", "..#..#..#...", "............"],
  flag: ["..###.......", "..#####.....", "..#######...", "..#########.", "..#######...", "..#####.....", "..###.......", "..#.........", "..#.........", "..#.........", "..#.........", ".###........"],
};
const pix = (rows) =>
  `<svg class="pix" viewBox="0 0 12 12" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">` +
  rows.map((r, y) => [...r].map((c, x) => (c === "#" ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : "")).join("")).join("") +
  `</svg>`;

// Dígitos 5x7 del reloj de puntos
const FONT = {
  0: "01110 10001 10011 10101 11001 10001 01110", 1: "00100 01100 00100 00100 00100 00100 01110",
  2: "01110 10001 00001 00010 00100 01000 11111", 3: "11110 00001 00001 01110 00001 00001 11110",
  4: "00010 00110 01010 10010 11111 00010 00010", 5: "11111 10000 11110 00001 00001 10001 01110",
  6: "00110 01000 10000 11110 10001 10001 01110", 7: "11111 00001 00010 00100 01000 01000 01000",
  8: "01110 10001 10001 01110 10001 10001 01110", 9: "01110 10001 10001 01111 00001 00010 01100",
};
function clockSVG(hhmm) {
  const [a, b, , d, e] = hhmm; // "HH:MM"
  const cols = [[a, 0], [b, 6], [d, 14], [e, 20]];
  let dots = "";
  const dot = (x, y, on) => `<circle cx="${x + .5}" cy="${y + .5}" r=".36" fill="${on ? "#b4b2ac" : "#262626"}"/>`;
  for (const [ch, x0] of cols) FONT[ch].split(" ").forEach((row, y) => [...row].forEach((v, x) => (dots += dot(x0 + x, y, v === "1"))));
  dots += dot(12, 2, true) + dot(12, 4, true);
  return `<svg viewBox="0 0 25 7">${dots}</svg>`;
}

const mins = (s) => +s.slice(0, 2) * 60 + +s.slice(3);
const hhmm = (n) => String((n / 60) | 0).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");

// Eventos de HORARIOS: t = primera hora del texto, to = última (para apagar la bandera)
const parse = (d) => ([k, text, ...rest]) => {
  const flag = rest.find((x) => typeof x === "boolean") ?? true, mat = rest.find((x) => typeof x === "string") ?? "";
  const h = (text.match(/\d\d:\d\d/g) || []).map(mins);
  if (!h.length) { console.error(`Hora inválida en ${d}:`, text); return null; }
  return { k, text, t: h[0], to: h[h.length - 1], flags: flag ? 1 : 0, mat };
};
const DAYS = {
  E: DIAS.map((d) => (HORARIOS.Ezequiel[d] || []).map(parse(d)).filter(Boolean)),
  M: DIAS.map((d) => (HORARIOS.Matteo[d] || []).map(parse(d)).filter(Boolean)),
};

// Filas de un día, ordenadas por hora. Con ambos, el mismo evento (mismo tipo y hora)
// de los dos se junta en una fila "Ambos" que suma las banderas y las materias de cada uno.
function rowsFor(who, di) {
  const key = (e) => e.k + e.text;
  const rows = [];
  for (const w of who)
    for (const e of DAYS[w][di]) {
      const m = rows.find((r) => r.w !== w && r.w !== "A" && key(r) === key(e));
      const mats = e.mat ? [[w, e.mat]] : [];
      if (m) { m.w = "A"; m.flags += e.flags; m.mats.push(...mats); } else rows.push({ ...e, w, mats });
    }
  return rows.sort((a, b) => a.t - b.t);
}

// Estado y tiempo
const state = { persona: "A", vista: "hoy", now: null };
function ahora() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hourCycle: "h23", weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  const off = wd >= 1 ? (wd <= 5 ? 1 - wd : 8 - wd) : 1; // desplazamiento al lunes mostrado (fin de semana: próximo lunes)
  return { today: wd >= 1 && wd <= 5 ? wd - 1 : -1, min: (+p.hour % 24) * 60 + +p.minute, base: Date.UTC(+p.year, +p.month - 1, +p.day + off) };
}
const dayNum = (i) => new Date(state.now.base + i * 864e5).getUTCDate();
// En fin de semana se muestra la semana próxima: nada pasó todavía.
const passed = (di, t) => state.now.today >= 0 && (di < state.now.today || (di === state.now.today && state.now.min >= t));

// Render
const flagHTML = (off, n) => (n ? `<span class="flag${off ? " off" : ""}">${pix(ICONS.flag).repeat(n)}</span>` : "");
const abiertos = new Set(); // filas desplegadas; sobreviven al refresco por minuto
function rowHTML(r, di, tag) {
  const off = passed(di, r.to);
  const mat = r.mats.map(([w, m]) => (r.w === "A" ? `${NOMBRES[w]}: ${m}` : m)).join("<br>");
  return `<details class="ev${off ? " off" : ""}${mat ? "" : " nomat"}" data-k="${di}${r.w}${r.k}${r.text}"><summary>` +
    `${tag ? `<span class="tag ${r.w}">${NOMBRES[r.w]}</span>` : ""}<span class="t">${r.text}</span>${flagHTML(off, r.flags)}</summary>` +
    (mat ? `<p class="mat">${mat}</p>` : "") + `</details>`;
}
function listHTML(who, di) {
  const rows = rowsFor(who, di);
  return rows.length ? rows.map((r) => rowHTML(r, di, who.length > 1)).join("") : `<div class="empty">Sin horario</div>`;
}
const whoHTML = (who) => (who.length === 1 ? `<div class="who ${who[0]}">${NOMBRES[who[0]]}</div>` : "");

function render() {
  const who = state.persona === "A" ? ["E", "M"] : [state.persona];
  const today = state.now.today;
  let h;
  if (state.vista === "hoy") {
    const di = today >= 0 ? today : 0;
    h = `<h2>${DIAS[di]} ${dayNum(di)}</h2>` + (today < 0 ? `<p class="note">Próximo día</p>` : "") +
      `<div class="grid"><section class="card">${whoHTML(who)}${listHTML(who, di)}</section></div>`;
  } else {
    h = `<div class="grid">` + DIAS.map((n, di) =>
      `<section class="card${di === today ? " hoy" : ""}"><h3>${n} ${dayNum(di)}</h3>${listHTML(who, di)}</section>`).join("") + `</div>`;
  }
  const main = document.getElementById("main");
  main.className = state.vista;
  main.innerHTML = h;
  main.querySelectorAll("details").forEach((d) => (d.open = abiertos.has(d.dataset.k)));
  document.getElementById("clock").innerHTML = clockSVG(hhmm(state.now.min));
}

document.getElementById("main").addEventListener("toggle", (e) => abiertos[e.target.open ? "add" : "delete"](e.target.dataset.k), true);

// Clima (Open-Meteo, sin clave): soleado / nublado / lluvioso
async function clima() {
  const el = document.getElementById("wx");
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-34.6177&longitude=-68.3301&current=weather_code&timezone=" + encodeURIComponent(TZ));
    const c = (await r.json()).current.weather_code;
    const rain = (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95;
    const [icon, label] = rain ? ["rain", "Lluvioso"] : c <= 1 ? ["sun", "Soleado"] : ["cloud", "Nublado"];
    el.innerHTML = pix(ICONS[icon]) + `<span>${label}</span>`;
  } catch { /* sin conexión: se conserva el último estado */ }
}

// Leyenda (botón ?)
document.getElementById("leyenda").innerHTML =
  `<p>${flagHTML(false, 1)} Entrada o salida.</p>` +
  `<p>${flagHTML(false, 2)} Ezequiel y Matteo entran o salen a la misma hora.</p>` +
  `<p>${flagHTML(true, 1)} Ya pasó.</p>`;
const ayuda = document.getElementById("ayuda");
ayuda.addEventListener("click", () => {
  const open = ayuda.getAttribute("aria-expanded") !== "true";
  ayuda.setAttribute("aria-expanded", open);
  document.getElementById("leyenda").hidden = !open;
});

// Controles
for (const id of ["persona", "vista"])
  document.getElementById(id).addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    state[id] = b.dataset.v;
    document.querySelectorAll(`#${id} button`).forEach((x) => x.setAttribute("aria-pressed", x === b));
    render();
  });

function tick() {
  const n = ahora();
  if (!state.now || n.min !== state.now.min || n.base !== state.now.base) { state.now = n; render(); }
}
tick();
setInterval(tick, 5000);
clima();
setInterval(clima, 15 * 60 * 1000);

// Autoverificación: abrir index.html?test y revisar la consola
if (location.search === "?test") {
  const a = (c, m) => console.assert(c, m);
  const n = (o) => DIAS.reduce((c, d) => c + (o[d] || []).length, 0);
  a(DAYS.E.flat().length === n(HORARIOS.Ezequiel) && DAYS.M.flat().length === n(HORARIOS.Matteo), "hay eventos con hora inválida en horarios.js");
  // Coincidencias con datos de prueba (no dependen de horarios.js)
  const bk = [DAYS.E[0], DAYS.M[0]], p = parse("test");
  DAYS.E[0] = [p(["sale", "10:00", "X"]), p(["entra", "09:00", false])];
  DAYS.M[0] = [p(["sale", "10:00", "Y"]), p(["entra", "09:00"]), p(["entra", "10:00"])];
  const s = rowsFor(["E", "M"], 0).map((r) => `${r.w}${r.flags} ${r.text}`).join(" | ");
  a(s === "A1 09:00 | A2 10:00 | M1 10:00", "coincidencias: " + s);
  a(rowsFor(["E", "M"], 0)[1].mats.length === 2 && p(["sale", "10:00", false, "Z"]).mat === "Z" && p(["sale", "10:00", false, "Z"]).flags === 0, "materias y orden flexible");
  [DAYS.E[0], DAYS.M[0]] = bk;
  console.log("self-test OK");
}
