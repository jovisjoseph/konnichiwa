'use strict';
// ---------- helpers
const $ = (s, r = document) => r.querySelector(s);
const ap = (h, mm) => (h % 12 || 12) + ':' + mm + (h < 12 ? ' am' : ' pm');
const t12 = s => String(s ?? '').replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b(?!\s?[ap]m)/g, (_, h, mm) => ap(+h, mm));
const esc = s => t12(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const fmt = m => { m = Math.round(m); const d = ((m % 1440) + 1440) % 1440; return ap(Math.floor(d / 60), String(d % 60).padStart(2, '0')); };
const tcol = m => fmt(m).replace(' ', '<i>') + '</i>';
const dur = m => m >= 60 ? (Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) : '')) : m + ' min';
const r5 = m => Math.max(5, Math.round(m / 5) * 5);
const jst = () => { const d = new Date(Date.now() + 9 * 3600e3); return { date: d.toISOString().slice(0, 10), min: d.getUTCHours() * 60 + d.getUTCMinutes() }; };
const DAY = id => DAYS.find(d => d.id === id);
const ITEM = {}; DAYS.forEach(d => d.items.forEach(it => { ITEM[it.id] = it; it.day = d.id; }));
const LEGS = {}; DAYS.forEach(d => d.items.forEach((it, i) => { const nx = d.items[i + 1]; if (nx && it.go) LEGS[it.id + '>' + nx.id] = it.go; }));
const STAY_LL = { bites: [35.6996, 139.7186], villa: [35.497, 138.7709], smile: [34.9983, 135.7594], centara: [34.6551, 135.4993] };
const END_LL = { fexc: [35.488, 138.7993], bus: [35.1265, 138.911], hikari: [34.9858, 135.7588], aoni: [34.6844, 135.8278], rapid: [34.6627, 135.5016], apx: [34.4347, 135.244] };
const START_LL = { fexc: [35.6896, 139.7006], bus: [35.4985, 138.7686], hikari: [35.1265, 138.911], aoni: [34.9858, 135.7588], vn335: [34.4347, 135.244], vn982: [13.199, 77.706] };
const llOf = (it, end) => (end && END_LL[it.id]) || it.ll || START_LL[it.id] || (it.stay && STAY_LL[it.stay]) || null;
const qOf = it => it.q || (it.stay && STAYS[it.stay] ? STAYS[it.stay].n + ' ' + STAYS[it.stay].en : it.n);
const PR = { s: 0, n: 1, m: 2 };

// ---------- icons
const I = {
  torii: '<path d="M3 6c6 1.2 12 1.2 18 0M5 9.5h14M7 7v14M17 7v14M11.9 9.5v3.5" stroke-width="2.2"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-2 2-2 2-4M12 7c0-2 2-2 2-4M9 20h6" stroke-width="2"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="4"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="14" r=".6" fill="currentColor"/><circle cx="15" cy="14" r=".6" fill="currentColor"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6 3 3v3M8 12l3-4 3 2 2 3M12 8l-1 6"/>',
  bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 10h16M7 21v-3M17 21v-3"/><circle cx="8" cy="14" r=".6" fill="currentColor"/><circle cx="16" cy="14" r=".6" fill="currentColor"/>',
  taxi: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM9 3h6"/><circle cx="7.5" cy="13" r=".7" fill="currentColor"/><circle cx="16.5" cy="13" r=".7" fill="currentColor"/>',
  plane: '<path d="M2 14l20-7-6 13-3-5-5 2zM13 15l3-6"/>',
  home: '<path d="M3 11l9-7 9 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  bed: '<path d="M3 19V7M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/>',
  task: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  grip: '<circle cx="9" cy="6" r="1.4" fill="currentColor"/><circle cx="15" cy="6" r="1.4" fill="currentColor"/><circle cx="9" cy="12" r="1.4" fill="currentColor"/><circle cx="15" cy="12" r="1.4" fill="currentColor"/><circle cx="9" cy="18" r="1.4" fill="currentColor"/><circle cx="15" cy="18" r="1.4" fill="currentColor"/>',
  back: '<path d="M15 5l-7 7 7 7" stroke-width="2.6"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3zM14 4v16" stroke-dasharray="0"/>',
  sync: '<path d="M4 10a8 8 0 0 1 14-4l2 2M20 14a8 8 0 0 1-14 4l-2-2M20 4v4h-4M4 20v-4h4"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  cam: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  trip: '<path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6M2 20h20"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="4"/><path d="M3 10h18M16 15h2M7 6l8-3 2 3"/>',
  reorder: '<path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3"/>',
  undo: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>'
};
const ic = (n, sw = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;
const KIND = { place: ['torii', '#e8452c'], meal: ['bowl', '#f2643f'], task: ['task', '#7b5a69'], ride: ['train', '#2c62b8'], stay: ['bed', '#8a55c9'], home: ['home', '#4f9a3c'] };
const MODE = { walk: 'walk', train: 'train', bus: 'bus', taxi: 'taxi', coach: 'bus', ride: 'train' };
const kindIcon = it => it.id.startsWith('vn') ? 'plane' : (it.id === 'bus' ? 'bus' : KIND[it.k][0]);
function fox(mood = 'happy', extra = '') {
  const eyes = mood === 'worry'
    ? '<circle cx="45" cy="60" r="4.5" fill="#3a1c2d"/><circle cx="75" cy="60" r="4.5" fill="#3a1c2d"/><path d="M98 34c4 6 4 10 0 13-4-3-4-7 0-13z" fill="#7fc4ff"/>'
    : '<path d="M38 61q7-8 14 0M68 61q7-8 14 0" stroke="#3a1c2d" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  const mouth = mood === 'worry' ? '<path d="M54 87q6-4 12 0" stroke="#3a1c2d" stroke-width="3" fill="none" stroke-linecap="round"/>' : '<path d="M53 84q7 6 14 0" stroke="#3a1c2d" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 120 112" class="fox" aria-hidden="true" ${extra}><g class="ears"><path d="M20 54L29 6l27 30z" fill="#ff8a3d"/><path d="M29 42l4-24 14 16z" fill="#ffe1c7"/><path d="M100 54L91 6 64 36z" fill="#ff8a3d"/><path d="M91 42l-4-24-14 16z" fill="#ffe1c7"/></g><path d="M12 58c0-22 22-32 48-32s48 10 48 32c0 26-22 46-48 46S12 84 12 58z" fill="#ff8a3d"/><path d="M60 52c-13 0-31 8-35 23 8 16 22 29 35 29s27-13 35-29c-4-15-22-23-35-23z" fill="#fff7ee"/><path d="M60 30c-4 6-4 11 0 15 4-4 4-9 0-15z" fill="#e23b2a"/>${eyes}<ellipse cx="60" cy="76" rx="6.5" ry="4.8" fill="#3a1c2d"/>${mouth}<circle cx="34" cy="75" r="6.5" fill="#ff9aa2" opacity=".75"/><circle cx="86" cy="75" r="6.5" fill="#ff9aa2" opacity=".75"/></svg>`;
}

// ---------- state
const KEY = 'kitsune.v1', UNDO = 'kitsune.undo', ME = 'kitsune.me', TK = 'kitsune.tasks';
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };
let S = store.get(KEY) || { v: 1, ts: 0, by: '', d: {}, c: {} };
S.d = S.d || {}; S.c = S.c || {};
let me = store.get(ME) || '';
const save = () => { S.ts = Date.now(); S.by = me; store.set(KEY, S); };
const dS = id => (S.d[id] = S.d[id] || { o: null, x: {} });
const X = (dayId, itId) => (dS(dayId).x[itId] = dS(dayId).x[itId] || {});
const changed = id => { const s = S.d[id]; return !!(s && (s.o || Object.keys(s.x || {}).some(k => Object.keys(s.x[k]).length))); };

// ---------- engine
function order(day, st = S.d[day.id]) {
  const def = day.items.map(i => i.id);
  if (!st || !st.o) return def;
  const o = st.o.filter(id => def.includes(id));
  def.forEach((id, i) => { if (!o.includes(id)) o.splice(Math.min(i, o.length), 0, id); });
  return o;
}
function haversine(a, b) { const R = 6371, r = x => x * Math.PI / 180; const dl = r(b[0] - a[0]), dn = r(b[1] - a[1]); const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function legBetween(a, b) {
  const k = LEGS[a.id + '>' + b.id]; if (k) return k;
  const A = llOf(a, true), B = llOf(b);
  if (!A || !B) return { m: 'walk', t: 'Short hop', min: 5, est: true };
  const km = haversine(A, B);
  if (km < 0.25) return { m: 'walk', t: 'Next door', min: 3, est: true };
  if (km < 1.1) return { m: 'walk', t: 'Walk, about ' + Math.round(km * 10) / 10 + ' km', min: Math.round(km * 1.3 / 4.5 * 60) + 2, est: true };
  return { m: 'train', t: 'Train or taxi, about ' + Math.round(km) + ' km', min: r5(12 + km * 1.4 / 24 * 60), est: true };
}
function compute(day, st = S.d[day.id] || { x: {} }) {
  const ids = order(day, st), x = st.x || {}, rows = [];
  let t = null, prev = null;
  ids.forEach(id => {
    const it = ITEM[id], ov = x[id] || {};
    if (ov.sk) { rows.push({ it, skip: true }); return; }
    const row = { it, done: !!ov.dn, du: ov.du ?? it.dur };
    if (!prev) { row.start = toMin(it.at || '08:00'); }
    else {
      row.leg = legBetween(prev, it); row.arrive = t + row.leg.min;
      if (it.fx) { row.start = toMin(it.at); row.wait = row.start - row.arrive; if (row.wait < 0) row.late = -row.wait; }
      else { row.start = row.arrive; if (it.op && row.start < toMin(it.op)) { row.wait = toMin(it.op) - row.start; row.start = toMin(it.op); } }
      if (it.by && row.start > toMin(it.by)) row.soft = row.start - toMin(it.by);
    }
    row.end = row.start + row.du; t = row.end; prev = it; rows.push(row);
  });
  // leave-by hints on the stop before each fixed item
  let lastActive = null;
  rows.forEach(r => { if (r.skip) return; if (r.it.fx && lastActive && !lastActive.it.fx && r.leg) lastActive.leaveBy = { at: r.start - r.leg.min, to: r.it }; lastActive = r; });
  return rows;
}
const curIdx = rows => rows.findIndex(r => !r.skip && !r.done);
const conflictIdx = (rows, from) => rows.findIndex((r, i) => i > from && !r.skip && (r.late > 0 || r.soft > 0));
const flexible = r => !r.skip && !r.it.fx && r.it.k !== 'home' && r.it.k !== 'ride' && r.it.mn != null;
function plan(day, mode) {
  const base = JSON.parse(JSON.stringify(S.d[day.id] || { o: null, x: {} })); base.x = base.x || {};
  const T = JSON.parse(JSON.stringify(base));
  const rows0 = compute(day, base), cur = Math.max(0, curIdx(rows0));
  const ch = [];
  const set = (id, k, v) => { (T.x[id] = T.x[id] || {})[k] = v; };
  if (mode === 'late') {
    for (let guard = 0; guard < 60; guard++) {
      const rows = compute(day, T), k = conflictIdx(rows, cur); if (k < 0) break;
      const need = rows[k].late ? rows[k].late + 5 : rows[k].soft;
      const cands = rows.slice(cur + 1, k).filter(r => flexible(r));
      const shrink = cands.filter(r => r.du > r.it.mn).sort((a, b) => PR[a.it.p] - PR[b.it.p] || rows.indexOf(b) - rows.indexOf(a))[0];
      if (shrink) { const cut = Math.min(need, shrink.du - shrink.it.mn); set(shrink.it.id, 'du', Math.max(shrink.it.mn, shrink.du - r5(cut))); continue; }
      const drop = cands.filter(r => r.it.p !== 'm').sort((a, b) => PR[a.it.p] - PR[b.it.p] || rows.indexOf(b) - rows.indexOf(a))[0];
      if (drop) { set(drop.it.id, 'sk', 1); continue; }
      break;
    }
    const rowsT = compute(day, T), left = conflictIdx(rowsT, cur);
    Object.keys(T.x).forEach(id => { const a = T.x[id], b = base.x[id] || {}; const it = ITEM[id];
      if (a.sk && !b.sk) ch.push({ id, kind: 'skip', label: 'Skip ' + it.n, note: 'Saves ' + dur(b.du ?? it.dur) + ' plus travel' });
      else if (!a.sk && a.du !== b.du && a.du != null) ch.push({ id, kind: 'du', v: a.du, label: 'Shorten ' + it.n, note: dur(b.du ?? it.dur) + ' → ' + dur(a.du) }); });
    const first = conflictIdx(rows0, cur);
    return { ch, target: first >= 0 ? rows0[first] : null, left: left >= 0 ? rowsT[left] : null };
  }
  // early: give spare minutes to stops that can stretch, before the next fixed item
  const rows = compute(day, base); const k = rows.findIndex((r, i) => i > cur && !r.skip && r.it.fx && r.wait >= 15);
  if (k < 0) return { ch, spare: 0 };
  let spare = rows[k].wait - 5; const spareAll = spare;
  rows.slice(cur + 1, k).filter(r => flexible(r) && r.du < r.it.mx).sort((a, b) => PR[b.it.p] - PR[a.it.p]).forEach(r => {
    if (spare < 5) return; const add = Math.min(spare, r.it.mx - r.du); const a5 = Math.floor(add / 5) * 5; if (a5 < 5) return; spare -= a5;
    ch.push({ id: r.it.id, kind: 'du', v: r.du + a5, label: 'More time at ' + r.it.n, note: dur(r.du) + ' → ' + dur(r.du + a5) });
  });
  return { ch, spare: spareAll, target: rows[k] };
}

// ---------- ui core
const app = $('#app');
let stack = [], tab = 'home', pushed = 0;
function mount(html, anim) {
  const v = document.createElement('div'); v.className = 'view' + (anim ? ' ' + anim : ''); v.innerHTML = html;
  app.appendChild(v); return v;
}
function render(r, anim) {
  const old = [...app.querySelectorAll('.view')];
  const v = mount(VIEWS[r.v](r), anim.in);
  v.dataset.r = JSON.stringify(r);
  if (r.scroll) v.scrollTop = r.scroll;
  old.forEach(o => { if (anim.out) { o.classList.add(anim.out); setTimeout(() => o.remove(), 380); } else o.remove(); });
  bind(v, r); paintTabs();
}
function go(r) { const top = app.querySelector('.view:last-child'); if (stack.length && top) stack[stack.length - 1].scroll = top.scrollTop; stack.push(r); try { history.pushState({ n: stack.length }, ''); pushed++; } catch (e) { } render(r, { in: 'in-r', out: 'out-l' }); }
function back() { if (stack.length < 2) return; stack.pop(); render(stack[stack.length - 1], { in: 'in-l', out: 'out-r' }); }
function root(t, r) { tab = t; stack = [r]; pushed = 0; render(r, { in: 'in-f' }); }
function refresh(keepScroll = true) { const top = app.querySelector('.view:last-child'); const r = stack[stack.length - 1]; if (keepScroll && top) r.scroll = top.scrollTop; render(r, {}); }
window.addEventListener('popstate', () => { if (stack.length > 1) { pushed = Math.max(0, pushed - 1); back(); } });
function toast(t) { document.querySelectorAll('.toast').forEach(e => e.remove()); const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2700); }
function sheet(html, onBind) {
  closeSheet(true);
  const s = document.createElement('div'); s.className = 'scrim'; s.onclick = () => closeSheet();
  const p = document.createElement('div'); p.className = 'sheet'; p.setAttribute('role', 'dialog'); p.innerHTML = '<div class="grab"></div>' + html;
  document.body.append(s, p); onBind && onBind(p); return p;
}
function closeSheet(now) { const p = $('.sheet'), s = $('.scrim'); if (!p) return; if (now) { p.remove(); s && s.remove(); return; } p.classList.add('closing'); s && (s.style.opacity = 0); setTimeout(() => { p.remove(); s && s.remove(); }, 280); stopCam(); }
function paintTabs() { document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === tab)); }

// ---------- views
const dayNo = d => DAYS.indexOf(d);
const cityOf = d => CITY[d.city];
const dateLabel = d => { const n = +d.date.slice(8); return d.dow + ' ' + n + ' Oct'; };
function todayDay() { const t = jst().date; return DAYS.find(d => d.date === t) || (t < DAYS[0].date ? DAYS[0] : null); }
// art: images from Nano Banana land in art/. Anything missing falls back to drawn placeholders.
const ART = { ok: {} };
const cityArt = k => 'art/city-' + (k === 'blr' ? 'depart' : k) + '.webp';
[['dishes', 'webp'], ['mascot', 'webp']].forEach(([n, x]) => { const im = new Image(); im.onload = () => { ART.ok[n] = 1; if (stack.length) refresh(); }; im.src = 'art/' + n + '.' + x; });
const img = (src, cls = '', alt = '') => `<img src="${src}" class="${cls}" alt="${esc(alt)}" loading="lazy" onerror="this.remove()">`;
const clouds = (fill = 'var(--sky)') => `<div class="clouds"><svg viewBox="0 0 400 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 46V30c14-10 30-12 44-4 8-16 34-20 48-6 12-12 34-12 44 2 14-14 40-12 50 4 10-10 30-10 40 2 14-16 42-16 54 0 10-10 28-10 38 2 12-12 34-12 46 0 12-8 26-8 36 2V46z" fill="${fill}"/></svg></div>`;
const MOOD = { happy: 0, worry: 50, proud: 100 };
const mascot = (mood = 'happy', style = '') => ART.ok.mascot ? `<span class="mimg" style="background-image:url(art/mascot.webp);background-position:${MOOD[mood] ?? 0}% 0;${style}"></span>` : fox(mood === 'proud' ? 'happy' : mood, style ? `style="${style}"` : '');
const DISH_KEYS = [['yakitori', 'torien', 'kabuto'], ['curry'], ['ramen', 'tsukemen', 'duck'], ['sushi', 'kaiten', 'inari', 'kakinoha', 'kaisendon', 'saba', 'tuna', 'maguro'], ['tempura', 'tendon'], ['okonomiyaki', 'monja', 'yakiniku'], ['takoyaki', 'octopus'], ['hoto', 'udon', 'yoshida'], ['soba', 'yuba'], ['gyoza', 'dumpling', 'butaman', 'bun'], ['crepe', 'cotton', 'melon'], ['mochi', 'manju', 'ningyo', 'yatsuhashi', 'shingen', 'dango'], ['unagi', 'unaju', 'eel'], ['kushikatsu', 'dote', 'skewer', 'wagyu', 'scallop', 'gyukatsu', 'tonkatsu', 'karaage'], ['matcha', 'soft serve', 'ice cream', 'sesame', 'soft'], ['tamagoyaki', 'tako tamago', 'omelette', 'tofu', 'onigiri', 'ekiben', 'bento']];
function dishIdx(text) { const t = String(text).toLowerCase(); for (let i = 0; i < DISH_KEYS.length; i++) if (DISH_KEYS[i].some(k => t.includes(k))) return i; return -1; }
const sprite = (i, cls = 'sprite') => ART.ok.dishes && i >= 0 ? `<span class="${cls}" style="background-image:url(art/dishes.webp);background-position:${(i % 4) * 33.333}% ${Math.floor(i / 4) * 33.333}%"></span>` : '';
const itemDish = it => { if (it.k !== 'meal') return -1; for (const e of (it.eat && it.eat.d) || []) { const i = dishIdx(e[0]); if (i >= 0) return i; } return dishIdx(it.n); };
const bubble = it => { const di = itemDish(it), sp = sprite(di); return sp ? `<div class="bub dish">${sp}</div>` : `<div class="bub" style="--k:${KIND[it.k][1]}">${ic(kindIcon(it))}</div>`; };
const CITIES = ['all', 'tokyo', 'nikko', 'fuji', 'kyoto', 'nara', 'osaka'];
// install: Android gives a prompt event, iOS needs Share > Add to Home Screen
const INSTALLED = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (stack.length) refresh(false); });
addEventListener('appinstalled', () => { installEvt = null; toast('Installed. Open it from your home screen'); });
async function install() {
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice; installEvt = null; if (r.outcome !== 'accepted') toast('Maybe later'); return refresh(false); }
  sheet(IOS ? `<h2>Add to your home screen</h2><p>Open this page in <b>Safari</b>, then:</p><ol class="steps"><li>Tap the <b>Share</b> button (square with an arrow)</li><li>Scroll down and tap <b>Add to Home Screen</b></li><li>Tap <b>Add</b></li></ol><p>It then opens full screen and works offline.</p>` : `<h2>Add to your home screen</h2><p>In Chrome, tap the <b>⋮</b> menu, then <b>Add to Home screen</b> or <b>Install app</b>.</p><p>It then opens full screen and works offline.</p>`);
}
const VIEWS = {
  home(r) {
    const t = jst().date, td = todayDay(), live = td && td.date === t, filt = r.city || 'all';
    const dleft = Math.round((Date.parse(DAYS[0].date) - Date.parse(t)) / 864e5);
    let banner = '';
    if (td) {
      const rows = compute(td), ci = curIdx(rows), cur = ci >= 0 ? rows[ci] : null;
      banner = `<button class="banner lift" data-day="${td.id}"><div class="bt"><small>${live ? '今日 Today · Day ' + dayNo(td) : (dleft > 1 ? dleft + ' days to go' : dleft === 1 ? 'Tomorrow' : 'Up next')}</small><b>${esc(td.title)}</b><span>${cur ? (live ? 'Now: ' : 'First up: ') + esc(cur.it.n) : 'All done for today'}</span><br><span class="go">Open day ${ic('back').replace('<svg', '<svg style="transform:rotate(180deg)"')}</span></div>${mascot('happy', 'width:86px;flex:none')}</button>`;
    }
    const list = DAYS.filter(d => filt === 'all' || d.city === filt || (filt === 'fuji' && d.id === 'd7'));
    const tiles = list.map((d, i) => { const c = cityOf(d), n = d.items.filter(x => x.k !== 'home').length; return `<button class="dcard rise ${d.date < t ? 'past' : ''} ${d.date === t ? 'now' : ''}" style="--c:${c.c};--i:${i}" data-day="${d.id}"><div class="pic"><span class="k">${c.jp}</span>${img(cityArt(d.city))}<span class="no">Day ${dayNo(d)}</span></div>${changed(d.id) ? `<span class="chg" title="Changed on this phone">${ic('sync', 2.6)}</span>` : ''}<div class="t">${esc(d.title)}</div><div class="m"><b class="num">${dateLabel(d)}</b><span>${n} stops</span></div></button>`; }).join('');
    return `<header class="hero home-hero"><div class="topbar"><span class="brand">KONNICHIWA</span><button class="iconbtn" data-me aria-label="Whose phone">${ic('user')}</button></div><div class="stage">${img('art/hero.webp', '', 'Two couples travelling in Japan')}<div class="ph">${ART.ok.mascot ? mascot('happy', 'width:62%;max-width:260px') : fox('happy', 'style="width:64%;max-width:250px;margin-bottom:30px"')}</div></div>${clouds()}</header>
      ${banner}
      <div class="catbar" role="tablist">${CITIES.map(k => `<button class="${k === filt ? 'on' : ''}" data-city="${k}">${k === 'all' ? 'All days' : CITY[k].n}</button>`).join('')}</div>
      <div class="section-t"><h2>${filt === 'all' ? 'Every day' : CITY[filt].n + ' days'}</h2><span>${list.length} day${list.length > 1 ? 's' : ''}</span></div><div class="days">${tiles}</div>`;
  },
  day(r) {
    const d = DAY(r.id), c = cityOf(d), rows = compute(d), live = jst().date === d.date, ci = curIdx(rows), nowM = jst().min;
    const active = rows.filter(x => !x.skip), last = active[active.length - 1];
    const ticks = store.get(TK) || {}; const tk = ticks[d.id] || [];
    const tasks = d.tasks && d.tasks.length ? `<div class="tasks rise"><h3>Today's checklist</h3>${d.tasks.map((t, i) => `<button class="task ${tk.includes(i) ? 'on' : ''}" data-task="${i}"><i class="cb"></i><span>${esc(t)}</span></button>`).join('')}</div>` : '';
    let tl = '';
    if (r.reorder) {
      tl = `<p class="hint rise">Drag the handles to change the order. Booked items stay put; everything else moves around them.</p><div class="rlist" id="rlist">${rows.map(x => { const it = x.it, lock = it.fx || it.k === 'home'; return `<div class="rrow ${lock ? 'lock' : ''} ${x.skip ? 'sk' : ''}" data-id="${it.id}">${bubble(it)}<div class="nm">${esc(it.n)}<small>${x.skip ? 'Skipped' : fmt(x.start) + ' · ' + dur(x.du)}</small></div><div class="grip" ${lock ? '' : 'data-grip'} aria-label="${lock ? 'Fixed' : 'Drag to reorder'}">${ic(lock ? 'lock' : 'grip')}</div></div>`; }).join('')}</div>`;
    } else {
      let n = 0;
      rows.forEach((x, i) => {
        const it = x.it;
        if (x.skip) { tl += `<div class="row"><div></div><div class="skipcard rise" style="--i:${n++}"><span>Skipped · ${esc(it.n)}</span><button data-restore="${it.id}">Restore</button></div></div>`; return; }
        if (x.leg) {
          const prevIt = rows.slice(0, i).reverse().find(p => !p.skip).it;
          const url = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(qOf(prevIt)) + '&destination=' + encodeURIComponent(qOf(it)) + '&travelmode=' + (x.leg.m === 'walk' ? 'walking' : 'transit');
          tl += `<div class="leg"><div class="line"></div><div class="lb"><span class="mi">${ic(MODE[x.leg.m] || 'walk')}</span><span class="lt">${esc(x.leg.t)} · <b>${dur(x.leg.min)}</b>${x.leg.est ? ' <span class="est">≈ estimate</span>' : ''}${x.wait > 4 ? `<span class="wait">${dur(x.wait)} spare before this</span>` : ''}</span><a href="${url}" target="_blank" rel="noopener">${ic('map')}Route</a></div></div>`;
        }
        const isCur = i === ci;
        const tags = [];
        if (it.fx) tags.push(`<span class="tag fx">Booked</span>`);
        if (x.du > 0 && it.k !== 'home') tags.push(`<span class="tag">${dur(x.du)}${it.mx ? ' · up to ' + dur(it.mx) : ''}</span>`);
        if (it.p && !it.fx && it.k !== 'home') tags.push(`<span class="tag ${it.p}">${{ m: 'Must', n: 'Nice to have', s: 'Optional' }[it.p]}</span>`);
        if (x.late) tags.push(`<span class="tag warn">${dur(x.late)} late</span>`);
        if (x.soft) tags.push(`<span class="tag soft">${dur(x.soft)} past ${t12(it.by)}</span>`);
        if (x.leaveBy && !x.done) tags.push(`<span class="tag ok">Leave by ${fmt(x.leaveBy.at)}</span>`);
        tl += `<div class="row rise" style="--i:${n++}"><div class="time num">${tcol(x.start)}${x.du ? `<small>${fmt(x.end)}</small>` : ''}</div><button class="card ${x.done ? 'done' : ''} ${isCur ? 'cur' : ''}" data-item="${it.id}">${bubble(it)}<div class="body"><div class="nm">${esc(it.n)}</div>${it.jp ? `<div class="jp">${esc(it.jp)}</div>` : ''}<div class="meta">${tags.join('')}</div></div>${x.done ? `<span class="hanko ${r.stamped === it.id ? 'new' : ''}">済</span>` : ''}</button></div>`;
        if (isCur) {
          const fixed = it.fx || it.k === 'ride';
          tl += `<div class="ctrls rise">${it.k === 'home' && it.at
            ? `<button class="ctrl main" data-act="leave">Leaving now</button><button class="ctrl" data-act="+15">+15 late</button><button class="ctrl" data-act="+30">+30</button>`
            : `<button class="ctrl main" data-act="done">${live && !fixed ? 'Done, moving on' : 'Done'}</button>${fixed ? '' : '<button class="ctrl" data-act="+15">+15 min</button><button class="ctrl" data-act="+30">+30</button><button class="ctrl" data-act="-15">Left 15 early</button>'}`}</div>`;
        }
      });
      tl += `<div class="endnote">${mascot(active.some(a => a.late) ? 'worry' : 'proud', 'width:84px;margin:4px auto')}${last ? 'Day wraps up around <b class="num">' + fmt(last.end) + '</b>' : ''}${d.stay ? ' · ' + esc(STAYS[d.stay].n) : ''}</div>`;
    }
    return `<header class="hero dayhero"><div class="topbar"><button class="iconbtn" data-back aria-label="Back">${ic('back')}</button><span class="pill am num">Day ${dayNo(d)} · ${dateLabel(d)}</span></div><span class="kanji">${c.jp}</span>${img(cityArt(d.city), 'art')}<div class="eyebrow">${c.n}${live ? ' · 今日 Today' : ''}</div><h1>${esc(d.title)}</h1><div class="daymeta"><span class="pill">${active.length} stops</span>${d.stay ? `<span class="pill">${ic('bed').replace('<svg', '<svg style="width:14px"')} ${esc(STAYS[d.stay].n)}</span>` : ''}</div>${clouds()}</header>
      <div class="toolbar"><button class="chip ${r.reorder ? 'on' : ''}" data-reorder>${ic('reorder')} ${r.reorder ? 'Done reordering' : '並べ替え Reorder'}</button>${changed(d.id) ? `<button class="chip" data-reset>${ic('undo')} Reset day</button>` : ''}</div>${r.reorder ? '' : tasks}<div class="${r.reorder ? '' : 'tl'}">${tl}</div>`;
  },
  item(r) {
    const it = ITEM[r.id], d = DAY(it.day), c = cityOf(d), rows = compute(d), x = rows.find(y => y.it.id === it.id) || {};
    const tabs = [['see', '見る', 'See', it.see], ['story', '物語', 'Story', it.story], ['eat', '食べる', 'Eat', it.eat], ['tix', '券', 'Ticket', it.bk || (it.stay && it.k === 'stay')]].filter(t => t[3]);
    const cur = r.tab && tabs.some(t => t[0] === r.tab) ? r.tab : (tabs[0] ? tabs[0][0] : null);
    let pane = '';
    if (cur === 'see') pane = `<div class="box"><h3>${it.k === 'meal' ? 'Good to know' : 'Things to see'}</h3><ul class="list">${it.see.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>${it.op ? `<div class="box"><b>Opens ${t12(it.op)}</b></div>` : ''}${it.by ? `<div class="box"><b>Best to arrive by ${t12(it.by)}</b></div>` : ''}`;
    if (cur === 'story') pane = `<div class="box story">${it.story.map(p => `<p>${esc(p)}</p>`).join('')}</div>`;
    if (cur === 'eat') pane = `${it.eat.d ? `<div class="box"><h3>Dishes to try</h3>${it.eat.d.map(e => { const sp = sprite(dishIdx(e[0] + ' ' + e[1])); return `<div class="dish"><span class="bowl">${sp || ic('bowl')}</span><div><b>${esc(e[0])}</b><span class="j">${esc(e[1])}</span><p>${esc(e[2])}</p></div></div>`; }).join('')}</div>` : ''}${it.eat.s ? `<div class="box"><h3>Where to go</h3>${it.eat.s.map(e => `<div class="spot"><b>${esc(e[0])}</b><span>${esc(e[1])}</span></div>`).join('')}</div>` : ''}`;
    if (cur === 'tix') pane = `${it.bk ? `<div class="box"><h3>Booking details</h3>${it.bk.map(b => `<div class="tk">${esc(b)}</div>`).join('')}</div>` : ''}${it.stay && STAYS[it.stay] ? `<button class="btn full blue" data-taxi="${it.stay}">${ic('taxi')} Show taxi card (Japanese)</button>` : ''}`;
    const canStep = flexible(x) && !x.skip;
    const di = itemDish(it), sp = sprite(di);
    const pic = sp ? `<div class="dpic food">${sp}` : (it.k === 'place' ? `<div class="dpic" style="--c:${c.c}">${img(cityArt(d.city))}<span class="k">${c.jp}</span>` : `<div class="dpic ${it.k === 'meal' ? 'food' : ''}" style="--c:${c.c}"><span class="bigic">${ic(kindIcon(it), 1.6)}</span><span class="k">${c.jp}</span>`);
    const badge = it.fx ? ['fx', '券', 'Booked'] : ({ m: ['m', '!', 'Must see'], n: ['n', '★', 'Nice to have'], s: ['s', '?', 'Optional'] }[it.p] || null);
    return `<header class="hero dhero"><div class="topbar"><button class="iconbtn" data-back aria-label="Back">${ic('back')}</button><span class="pill am num">Day ${dayNo(d)} · ${dateLabel(d)}</span></div><span class="kanji">${c.jp}</span><div class="eyebrow">${c.n}</div></header>
      <div class="dsheet rise"><div class="grab"></div>${pic}${badge ? `<span class="badge ${badge[0]}"><i>${badge[1]}</i>${badge[2]}</span>` : ''}</div>
        <div class="dtitle"><div class="r">${x.skip ? 'Skipped' : `<span class="num">${fmt(x.start)} to ${fmt(x.end)}</span>`}</div><h2>${esc(it.n)}</h2>${it.jp ? `<div class="jp">${esc(it.jp)}</div>` : ''}</div>
        ${x.skip ? '' : `<div class="facts"><div class="fact"><small>Arrive</small><b class="num">${fmt(x.start)}</b></div><div class="fact"><small>Leave</small><b class="num">${fmt(x.end)}</b></div><div class="fact"><small>${it.mx ? 'Max here' : 'Length'}</small><b class="num">${dur(it.mx || x.du)}</b></div></div>`}
      </div>
      ${tabs.length > 1 ? `<div class="seg">${tabs.map(t => `<button class="${t[0] === cur ? 'on' : ''}" data-tab="${t[0]}">${t[2]}<small>${t[1]}</small></button>`).join('')}</div>` : ''}
      <div class="pane"><div class="pc">${pane || '<div class="empty">' + mascot('happy', 'width:110px;margin:0 auto') + 'Nothing to read here, just go!</div>'}</div></div>
      ${canStep ? `<div class="paybar"><div><small>Planned time · ${dur(it.mn)} to ${dur(it.mx)}</small><b class="num">${dur(x.du)}</b></div><div class="sb"><button data-step="-5" aria-label="5 minutes less">−</button><span class="num" style="font-weight:800;min-width:26px;text-align:center">5m</span><button data-step="5" aria-label="5 minutes more">+</button></div></div>` : ''}
      <div class="actions">${it.k !== 'home' && it.k !== 'ride' ? `<a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qOf(it))}" target="_blank" rel="noopener">${ic('map')} Map</a>` : ''}${x.skip ? `<button class="btn pri" data-restore="${it.id}">Restore</button>` : `<button class="btn ${x.done ? '' : 'pri'}" data-done>${x.done ? 'Undo done' : '済 Mark done'}</button>`}${!x.skip && !it.fx && it.k !== 'home' && it.p !== 'm' ? `<button class="btn full" data-skip>Skip this stop</button>` : ''}</div>`;
  },
  wallet() {
    const stays = Object.entries(STAYS).map(([k, s], i) => `<div class="box rise" style="--i:${i}"><button class="stay" data-taxi="${k}"><span class="bub" style="--k:#1f6feb">${ic('bed')}</span><span style="flex:1"><b>${esc(s.n)}</b><br><small style="color:var(--ink-2)">${esc(s.dates)} · ${esc(s.ref)}</small></span><span class="tag fx">Taxi card</span></button></div>`).join('');
    const bks = DAYS.map(d => { const its = d.items.filter(i => i.bk && i.k !== 'stay'); if (!its.length) return ''; return `<div class="box"><h3 style="color:var(--blue-d)">Day ${dayNo(d)} · ${dateLabel(d)}</h3>${its.map(i => `<button class="spot" data-item="${i.id}" style="display:block;width:100%;text-align:left"><b>${i.at ? '<span class="num">' + t12(i.at) + '</span> · ' : ''}${esc(i.n)}</b>${i.bk.map(b => `<span style="display:block">${esc(b)}</span>`).join('')}</button>`).join('')}</div>`; }).join('');
    return `<header class="hero">${mascot('proud', 'position:absolute;right:12px;top:calc(12px + env(safe-area-inset-top,0px));width:96px;z-index:2')}<div class="eyebrow">券 Wallet</div><h1>Tickets and taxi cards</h1><div class="sub">Every booking in one place.</div>${clouds()}</header><div class="wal"><div class="section-t" style="margin:8px 4px 10px"><h2>Where we sleep</h2><span>Tap for Japanese</span></div>${stays}<div class="section-t" style="margin:20px 4px 10px"><h2>Bookings</h2></div>${bks}</div>`;
  },
  shop() {
    const L = shop(), todo = L.filter(x => x.p == null), got = L.filter(x => x.p != null).sort((a, b) => b.at - a.at), total = got.reduce((a, x) => a + x.p, 0);
    const row = (x, i) => `<div class="shoprow rise ${x.p != null ? 'got' : ''}" style="--i:${i}"><span class="bub" style="--k:${x.p != null ? '#20a464' : '#f08a00'}">${ic(x.p != null ? 'check' : 'bag')}</span><div class="nm">${esc(x.n)}${x.p != null ? `<small>Bought ${new Date(x.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small>` : ''}</div>${x.p != null ? `<button class="price num" data-price="${x.id}">${yen(x.p)}<small>${inr(x.p)}</small></button>` : `<button class="buy" data-buy="${x.id}">Buy</button>`}<button class="x" data-del="${x.id}" aria-label="Remove">×</button></div>`;
    return `<header class="hero">${mascot('proud', 'position:absolute;right:12px;top:calc(12px + env(safe-area-inset-top,0px));width:96px;z-index:2')}<div class="eyebrow">買い物 Shopping</div><h1>Souvenir list</h1><div class="total"><small>Spent this trip</small><b class="num">${yen(total)}</b><em class="num">≈ ${inr(total)}</em><span>${got.length} bought · ${todo.length} to buy</span></div>${clouds()}</header>
      <form class="addform rise" data-add><input name="n" type="text" placeholder="Add something to buy" autocomplete="off" enterkeyhint="done" maxlength="80"><button class="btn pri" type="submit">Add</button></form>
      ${todo.length ? `<div class="section-t"><h2>To buy</h2><span>${todo.length}</span></div><div class="shoplist">${todo.map(row).join('')}</div>` : ''}
      ${got.length ? `<div class="section-t"><h2>Bought</h2><span class="num">${yen(total)} · ${inr(total)}</span></div><div class="shoplist">${got.map(row).join('')}</div>` : ''}
      ${L.length ? '' : `<div class="empty">${mascot('happy', 'width:110px;margin:0 auto 6px')}Add the Seiko watch, the KitKats and whatever else is on everyone's list. Tap Buy when you get it.</div>`}
      <p class="hint" style="margin:6px 20px 0;text-align:center">Saved on this phone only.</p>`;
  },
  sync() {
    const u = store.get(UNDO), nch = DAYS.filter(d => changed(d.id)).length;
    return `<header class="hero">${mascot('happy', 'position:absolute;right:12px;top:calc(12px + env(safe-area-inset-top,0px));width:96px;z-index:2')}<div class="eyebrow">同期 Sync</div><h1>Sync my app with others</h1><div class="sub">${nch ? nch + ' day' + (nch > 1 ? 's' : '') + ' changed on this phone' : 'No changes yet: same plan as everyone'}</div>${clouds()}</header>
      <div class="syncgrid">
      ${INSTALLED() ? '' : `<button class="big rise install" style="--i:0" data-install><span class="bub" style="--k:#f08a00">${ic('phone')}</span><span><b>Install the app</b><span>Home screen icon, works offline</span></span></button>`}
      <button class="big rise" style="--i:0" data-me><span class="bub" style="--k:#0f1b3d">${ic('user')}</span><span><b>${me ? 'This is ' + esc(me) + '\'s phone' : 'Whose phone is this?'}</b><span>Shown to others when you share</span></span></button>
      <button class="big rise" style="--i:1" data-qr><span class="bub" style="--k:#f08a00">${ic('qr')}</span><span><b>Show my QR code</b><span>Others scan it to copy your plan</span></span></button>
      <button class="big rise" style="--i:2" data-scan><span class="bub" style="--k:#1f6feb">${ic('cam')}</span><span><b>Scan a QR code</b><span>Replace your plan with someone else's</span></span></button>
      <button class="big rise" style="--i:3" data-link><span class="bub" style="--k:#20a464">${ic('link')}</span><span><b>Share as a link</b><span>Send it in the WhatsApp group</span></span></button>
      ${u ? `<button class="big rise" style="--i:4" data-undo><span class="bub" style="--k:#4b5a7c">${ic('undo')}</span><span><b>Undo last sync</b><span>Go back to your plan before the import</span></span></button>` : ''}
      ${nch ? `<button class="big rise" style="--i:5" data-resetall><span class="bub" style="--k:#e8452c">${ic('sync')}</span><span><b>Reset to the original plan</b><span>Clears every change on this phone</span></span></button>` : ''}
      </div>
      <div class="section-t" style="margin:22px 20px 10px"><h2>Our itinerary</h2></div>
      <div class="syncgrid" style="padding-top:0"><a class="big rise itin" style="--i:6" href="itinerary/"><span class="bub" style="--k:#e8452c">${ic('map')}</span><span><b>Day-by-day itinerary</b><span>The full plan with bookings, as one page</span></span></a></div>`;
  }
};

// ---------- actions
function stamp(dayId, itId) { const r = stack[stack.length - 1]; r.stamped = itId; refresh(); r.stamped = null; }
function afterChange(day, mode) {
  save();
  if (!mode) { refresh(); return toast('Have a great day!'); }
  const p = plan(day, mode);
  if (mode === 'late' && p.ch.length) return showPlan(day, p, mode);
  if (mode === 'late' && p.target && !p.ch.length) { refresh(); return toast('Can\'t catch up by shortening; ' + p.target.it.n + ' is at risk'); }
  if (mode === 'early' && p.ch.length) return showPlan(day, p, mode);
  refresh(); toast(mode === 'early' ? 'Day moved earlier' : 'Day updated');
}
function showPlan(day, p, mode) {
  refresh();
  const sel = p.ch.map(() => true);
  const head = mode === 'late'
    ? `<div class="foxrow">${mascot('worry')}<div><h2>Running behind</h2><p>To stay on time for <b>${esc(p.target.it.n)}</b>${p.target.it.fx ? ' at ' + p.target.it.at : ''}, the app suggests:</p></div></div>`
    : `<div class="foxrow">${mascot('proud')}<div><h2>${dur(p.spare)} to spare</h2><p>Before <b>${esc(p.target.it.n)}</b>. Spend it here, or keep it as free time.</p></div></div>`;
  const body = () => p.ch.map((c, i) => `<button class="opt ${sel[i] ? 'on' : ''}" data-i="${i}"><i class="cb"></i><span><b>${esc(c.label)}</b><span>${esc(c.note)}</span></span></button>`).join('') + (p.left ? `<p style="color:var(--red);font-weight:700;margin-top:8px">Even then you'd be ${dur(p.left.late || p.left.soft)} late for ${esc(p.left.it.n)}. A taxi may help.</p>` : '');
  sheet(`${head}<div id="opts">${body()}</div><div class="actions" style="padding:8px 0 0"><button class="btn" data-keep>${mode === 'late' ? 'Keep as is' : 'Free time'}</button><button class="btn pri" data-apply>Apply</button></div>`, el => {
    el.addEventListener('click', e => {
      const o = e.target.closest('.opt'); if (o) { sel[+o.dataset.i] ^= 1; o.classList.toggle('on'); return; }
      if (e.target.closest('[data-keep]')) { closeSheet(); return; }
      if (e.target.closest('[data-apply]')) { p.ch.forEach((c, i) => { if (!sel[i]) return; const x = X(day.id, c.id); if (c.kind === 'skip') x.sk = 1; else x.du = c.v; }); save(); closeSheet(); refresh(); toast('Plan updated'); }
    });
  });
}
function liveDone(day, row) { const x = X(day.id, row.it.id); const now = jst().min; if (jst().date === day.date && !row.it.fx && row.it.k !== 'ride' && now > row.start) { const was = row.du; x.du = Math.max(0, now - row.start); x.dn = 1; return x.du < was - 4 ? 'early' : (x.du > was + 4 ? 'late' : null); } x.dn = 1; return null; }
function bind(v, r) {
  const af = v.querySelector('[data-add]'); if (af) af.onsubmit = e => { e.preventDefault(); const n = af.n.value.trim(); if (!n) return; const L = shop(); L.push({ id: Date.now().toString(36), n }); store.set(SH, L); refresh(); setTimeout(() => { const i = app.querySelector('.view:last-child [data-add] input'); i && i.focus(); }, 50); };
  v.addEventListener('click', e => {
    const t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.buy) return askPrice(t.dataset.buy);
    if (t.dataset.price) return askPrice(t.dataset.price);
    if (t.dataset.del) { const L = shop(), x = L.find(y => y.id === t.dataset.del); return confirmSheet('Remove ' + x.n + '?', x.p != null ? 'Its ' + yen(x.p) + ' comes off the total.' : 'It comes off the list.', 'Remove', () => { store.set(SH, L.filter(y => y !== x)); refresh(); }); }
    if (t.matches('[data-back]')) return pushed > 0 ? history.back() : back();
    if (t.dataset.day) return go({ v: 'day', id: t.dataset.day });
    if (t.dataset.item) return go({ v: 'item', id: t.dataset.item });
    if (t.dataset.tab) { r.tab = t.dataset.tab; return refresh(); }
    if (t.dataset.city) { r.city = t.dataset.city; return refresh(); }
    if (t.dataset.taxi) return taxi(t.dataset.taxi);
    const day = r.v === 'day' ? DAY(r.id) : (r.v === 'item' ? DAY(ITEM[r.id].day) : null);
    if (t.dataset.task != null) { const all = store.get(TK) || {}; const a = all[day.id] = all[day.id] || []; const i = +t.dataset.task; const k = a.indexOf(i); k < 0 ? a.push(i) : a.splice(k, 1); store.set(TK, all); t.classList.toggle('on'); return; }
    if (t.dataset.restore) { delete X(day.id, t.dataset.restore).sk; return afterChange(day, 'late'); }
    if (t.matches('[data-reorder]')) { r.reorder = !r.reorder; if (!r.reorder) { const p = plan(day, 'late'); if (p.ch.length) return showPlan(day, p, 'late'); } return refresh(false); }
    if (t.matches('[data-reset]')) return confirmSheet('Reset this day?', 'Undo every change you made to Day ' + dayNo(day) + ' on this phone.', 'Reset', () => { delete S.d[day.id]; save(); refresh(); toast('Day reset'); });
    if (t.dataset.act) {
      const rows = compute(day), row = rows[curIdx(rows)]; if (!row) return;
      const x = X(day.id, row.it.id); const a = t.dataset.act;
      if (a === 'done') { const m = liveDone(day, row); save(); if (m) return afterChange(day, m); return stamp(day.id, row.it.id); }
      if (a === 'leave') { const now = jst().min; if (jst().date === day.date && now > row.start) x.du = now - row.start; x.dn = 1; return afterChange(day, x.du > 4 ? 'late' : null); }
      const dlt = +a; x.du = Math.max(row.it.k === 'home' ? 0 : (row.it.mn || 0), (x.du ?? row.it.dur) + dlt);
      return afterChange(day, dlt > 0 ? 'late' : 'early');
    }
    if (t.dataset.step) { const rows = compute(day), row = rows.find(y => y.it.id === r.id); const x = X(day.id, r.id); const nv = Math.min(row.it.mx, Math.max(row.it.mn, row.du + +t.dataset.step)); if (nv === row.du) return toast('That\'s the ' + (+t.dataset.step > 0 ? 'max' : 'min') + ' for this stop'); x.du = nv; return afterChange(day, +t.dataset.step > 0 ? 'late' : 'early'); }
    if (t.matches('[data-done]')) { const x = X(day.id, r.id); x.dn ? delete x.dn : (x.dn = 1); save(); refresh(); return toast(x.dn ? '済 Done!' : 'Marked not done'); }
    if (t.matches('[data-skip]')) { X(day.id, r.id).sk = 1; save(); return afterChange(day, 'early'); }
    if (t.matches('[data-install]')) return install();
    if (t.matches('[data-me]')) return pickMe();
    if (t.matches('[data-qr]')) return showQR();
    if (t.matches('[data-scan]')) return scan();
    if (t.matches('[data-link]')) return shareLink();
    if (t.matches('[data-undo]')) return confirmSheet('Undo the last sync?', 'Your plan goes back to how it was before you imported.', 'Undo', () => { S = store.get(UNDO); store.del(UNDO); store.set(KEY, S); refresh(); toast('Restored your plan'); });
    if (t.matches('[data-resetall]')) return confirmSheet('Reset everything?', 'Every day goes back to the original plan on this phone.', 'Reset all', () => { store.set(UNDO, S); S = { v: 1, ts: 0, by: '', d: {}, c: {} }; save(); refresh(); toast('Back to the original plan'); });
  });
  if (r.v === 'day' && r.reorder) dragList(v, DAY(r.id));
}
function confirmSheet(t, p, ok, fn) { sheet(`<h2>${esc(t)}</h2><p>${esc(p)}</p><div class="actions" style="padding:8px 0 0"><button class="btn" data-no>Cancel</button><button class="btn pri" data-yes>${esc(ok)}</button></div>`, el => { el.querySelector('[data-no]').onclick = () => closeSheet(); el.querySelector('[data-yes]').onclick = () => { closeSheet(); fn(); }; }); }
function taxi(k) { const s = STAYS[k]; const d = document.createElement('div'); d.className = 'taxi'; d.innerHTML = `<div class="t1">${esc(s.n)}</div><div class="t2">${esc(s.jp)}</div><div class="t3">${esc(s.addr)}</div><div class="t1" style="margin-top:8px">${esc(s.near)}</div><div class="t4">この住所までお願いします</div><div class="t1">"To this address, please" · ${esc(s.tel)}</div><div class="t5">Tap anywhere to close</div>`; d.onclick = () => d.remove(); document.body.appendChild(d); }
function pickMe(after) { sheet(`<h2>Whose phone is this?</h2><p>Your name goes on the plan you share.</p><div class="who">${PEOPLE.map(p => `<button class="${p === me ? 'on' : ''}" data-p="${p}">${p}</button>`).join('')}</div>`, el => el.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; me = b.dataset.p; store.set(ME, me); closeSheet(); refresh(); toast('Hi ' + me + '!'); after && after(); })); }

// ---------- drag to reorder
function dragList(v, day) {
  const list = v.querySelector('#rlist'); if (!list) return;
  list.addEventListener('pointerdown', e => {
    const g = e.target.closest('[data-grip]'); if (!g) return; e.preventDefault();
    const row = g.closest('.rrow'), rect = row.getBoundingClientRect(), off = e.clientY - rect.top;
    const ghost = row.cloneNode(true); ghost.classList.add('ghost'); Object.assign(ghost.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', margin: 0 }); document.body.appendChild(ghost);
    row.classList.add('ph'); g.setPointerCapture(e.pointerId);
    const move = ev => {
      ghost.style.top = (ev.clientY - off) + 'px';
      const sibs = [...list.querySelectorAll('.rrow:not(.ph)')];
      let before = sibs.find(s => { const b = s.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; });
      if (before === sibs[0] && sibs[0].querySelector('.grip:not([data-grip])') && order(day)[0] === sibs[0].dataset.id) before = sibs[1];
      const lastS = sibs[sibs.length - 1]; if (!before && ITEM[lastS.dataset.id].k === 'home') before = lastS;
      before ? list.insertBefore(row, before) : list.appendChild(row);
      const vb = v.getBoundingClientRect(); if (ev.clientY > vb.bottom - 120) v.scrollTop += 8; if (ev.clientY < vb.top + 90) v.scrollTop -= 8;
    };
    const up = () => { g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up); ghost.remove(); row.classList.remove('ph');
      const o = [...list.querySelectorAll('.rrow')].map(n => n.dataset.id); const def = day.items.map(i => i.id); dS(day.id).o = o.join() === def.join() ? null : o; save(); refresh(); };
    g.addEventListener('pointermove', move); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
  });
}

// ---------- sync
const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
function payload() {
  const d = {}; Object.keys(S.d).forEach(id => { if (!changed(id)) return; const s = S.d[id], x = {}; Object.keys(s.x || {}).forEach(k => { const v = s.x[k]; if (Object.keys(v).length) x[k] = [v.du ?? null, v.sk ? 1 : 0, v.dn ? 1 : 0]; }); d[id] = s.o ? { o: s.o, x } : { x }; });
  return 'KT1.' + b64e(JSON.stringify({ t: S.ts || Date.now(), b: me, d }));
}
function parse(txt) {
  const m = String(txt).match(/KT1\.[A-Za-z0-9_-]+/); if (!m) return null;
  try { const j = JSON.parse(b64d(m[0].slice(4))); const d = {}; Object.keys(j.d || {}).forEach(id => { if (!DAY(id)) return; const s = j.d[id], x = {}; Object.keys(s.x || {}).forEach(k => { if (!ITEM[k]) return; const a = s.x[k], o = {}; if (a[0] != null) o.du = a[0]; if (a[1]) o.sk = 1; if (a[2]) o.dn = 1; x[k] = o; }); d[id] = { o: s.o || null, x }; }); return { v: 1, ts: j.t, by: j.b || 'someone', d, c: {} }; } catch (e) { return null; }
}
function offerImport(N) {
  const n = Object.keys(N.d).length, when = new Date(N.ts + 9 * 3600e3).toISOString();
  sheet(`<div class="foxrow">${mascot('happy')}<div><h2>Use ${esc(N.by)}'s plan?</h2><p>Updated ${when.slice(5, 10).replace('-', '/')} at ${when.slice(11, 16)} JST · ${n ? n + ' changed day' + (n > 1 ? 's' : '') : 'the original plan'}. Your current plan is kept for Undo.</p></div></div><div class="actions" style="padding:8px 0 0"><button class="btn" data-no>Cancel</button><button class="btn pri" data-yes>Replace mine</button></div>`, el => { el.querySelector('[data-no]').onclick = () => closeSheet(); el.querySelector('[data-yes]').onclick = () => { store.set(UNDO, S); S = N; store.set(KEY, S); closeSheet(); root(tab, stack[0] || { v: 'home' }); toast('Synced with ' + N.by); }; });
}
function showQR() {
  if (!me) return pickMe(showQR);
  const p = payload(); let svg = '';
  try { const q = qrcode(0, 'L'); q.addData(p); q.make(); svg = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { svg = ''; }
  sheet(`<h2>${esc(me)}'s plan</h2><p>Ask the others to open Sync → Scan a QR code.</p>${svg ? `<div class="qrbox">${svg}</div>` : '<p style="color:var(--red)">Too many changes for one QR code. Share it as a link instead.</p>'}<div class="actions" style="padding:0"><button class="btn full" data-close>Done</button></div>`, el => el.querySelector('[data-close]').onclick = () => closeSheet());
}
let camStream = null, camRAF = 0;
function stopCam() { cancelAnimationFrame(camRAF); if (camStream) camStream.getTracks().forEach(t => t.stop()); camStream = null; }
async function scan() {
  const el = sheet(`<h2>Scan a QR code</h2><p>Point the camera at the other phone's sync code.</p><div class="cam"><video playsinline muted></video></div><p id="camerr" style="color:var(--red);margin-top:10px"></p><div class="actions" style="padding:0"><button class="btn full" data-close>Cancel</button></div>`, e => e.querySelector('[data-close]').onclick = () => closeSheet());
  const video = el.querySelector('video'), err = el.querySelector('#camerr');
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = camStream; await video.play();
  } catch (e) { err.textContent = 'The camera isn\'t available here. Open the app from its own link in Safari or Chrome, or use a sync link instead.'; return; }
  const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  const tick = () => {
    if (!camStream) return;
    if (video.readyState >= 2) { const w = 480, h = Math.round(480 * video.videoHeight / video.videoWidth) || 480; cv.width = w; cv.height = h; cx.drawImage(video, 0, 0, w, h); const img = cx.getImageData(0, 0, w, h); const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' }); if (code && code.data) { const N = parse(code.data); if (N) { stopCam(); closeSheet(true); return offerImport(N); } } }
    camRAF = requestAnimationFrame(tick);
  };
  tick();
}
async function shareLink() {
  if (!me) return pickMe(shareLink);
  const url = location.href.split('#')[0] + '#' + payload();
  try { if (navigator.share) { await navigator.share({ title: me + '\'s Konnichiwa plan', text: 'Tap to sync our Japan plan', url }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch (e) { sheet(`<h2>Copy this link</h2><p>Long-press to copy, then send it in the group.</p><div class="tk">${esc(url)}</div>`); }
}

// ---------- shopping (this phone only)
const SH = 'kitsune.shop';
const shop = () => store.get(SH) || [];
const yen = n => '¥' + Math.round(n).toLocaleString('en-US');
const INR = 0.60; // rupees per yen, fixed for the trip
const inr = n => '₹' + Math.round(n * INR).toLocaleString('en-IN');
function askPrice(id) {
  const L = shop(), it = L.find(x => x.id === id); if (!it) return;
  sheet(`<h2>${it.p != null ? 'Change the price' : 'Bought it!'}</h2><p>How much was <b>${esc(it.n)}</b>?</p><form class="priceform"><span>¥</span><input name="p" type="text" inputmode="numeric" pattern="[0-9,]*" placeholder="0" value="${it.p ?? ''}" autocomplete="off"></form><div class="pricehint num" data-inr>${it.p != null ? '≈ ' + inr(it.p) : '≈ ₹0'}</div><div class="actions" style="padding:12px 0 0">${it.p != null ? '<button class="btn" data-unbuy>Not bought</button>' : '<button class="btn" data-no>Cancel</button>'}<button class="btn pri" data-yes>Save</button></div>`, el => {
    const inp = el.querySelector('input'); setTimeout(() => inp.focus(), 350); const hint = el.querySelector('[data-inr]'); inp.oninput = () => { hint.textContent = '≈ ' + inr(+inp.value.replace(/[^0-9]/g, '') || 0); };
    const done = () => { const v = +inp.value.replace(/[^0-9]/g, ''); if (!inp.value.trim()) return toast('Enter the price in yen'); it.p = v; it.at = Date.now(); store.set(SH, L); closeSheet(); refresh(); toast(yen(v) + ' added'); };
    el.querySelector('form').onsubmit = e => { e.preventDefault(); done(); };
    el.querySelector('[data-yes]').onclick = done;
    const no = el.querySelector('[data-no]'); if (no) no.onclick = () => closeSheet();
    const ub = el.querySelector('[data-unbuy]'); if (ub) ub.onclick = () => { delete it.p; delete it.at; store.set(SH, L); closeSheet(); refresh(); };
  });
}

// ---------- boot
document.body.insertAdjacentHTML('beforeend', `<div class="tabs"><nav>${[['home', 'trip', 'Trip', '旅'], ['today', 'sun', 'Today', '今日'], ['wallet', 'wallet', 'Wallet', '券'], ['shop', 'bag', 'Shop', '買'], ['sync', 'sync', 'Sync', '同期']].map(t => `<button class="tab" data-t="${t[0]}"><span class="ti">${ic(t[1])}</span><span>${t[2]} ${t[3]}</span></button>`).join('')}</nav></div>`);
document.querySelector('.tabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return; const t = b.dataset.t;
  if (t === 'home') return root('home', { v: 'home' });
  if (t === 'today') { const d = todayDay() || DAYS[DAYS.length - 1]; return root('today', { v: 'day', id: d.id }); }
  if (t === 'wallet') return root('wallet', { v: 'wallet' });
  if (t === 'shop') return root('shop', { v: 'shop' });
  if (t === 'sync') return root('sync', { v: 'sync' });
});
root('home', { v: 'home' });
(() => { const N = parse(location.hash); if (N) { try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) { } offerImport(N); } else if (!me) setTimeout(() => pickMe(), 600); })();
