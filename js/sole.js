/* Sole di Parma · web demo */
const d = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plata = (n) => n == null ? 'A confirmar' : '$' + Number(n).toLocaleString('es-AR');
const NS = 'http://www.w3.org/2000/svg';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const celu = () => innerWidth < 768;

/* ---------- rayos dibujados a mano (un poco irregulares, como sus ilustraciones) ---------- */
function rayos(n, r0, r1, seed) {
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280; const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rnd() - .5) * .06, a2 = a + (rnd() - .5) * .05;
    const rr = r1 * (i % 2 ? .86 : 1) * (.96 + rnd() * .08);
    out.push([Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a2) * rr, Math.sin(a2) * rr]);
  }
  return out;
}
function pintarRayos(g, lista, { len = true } = {}) {
  lista.forEach(([x1, y1, x2, y2], i) => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', x1.toFixed(1)); l.setAttribute('y1', y1.toFixed(1)); l.setAttribute('x2', x2.toFixed(1)); l.setAttribute('y2', y2.toFixed(1));
    if (len) l.setAttribute('pathLength', '1');
    l.style.setProperty('--i', i); g.appendChild(l);
  });
}
const RAYOS_HERO = rayos(20, 64, 96, 3);
pintarRayos($('.rayos-a'), RAYOS_HERO);
pintarRayos($('.rayos-n'), rayos(18, 62, 92, 9), { len: false });

/* ---------- fotos: brillo mientras cargan ---------- */
function marcarCarga(root = document) {
  $$('.ph img', root).forEach((im) => {
    const ph = im.closest('.ph'); const ok = () => ph.classList.add('cargada');
    if (im.complete && im.naturalWidth) ok(); else { im.addEventListener('load', ok, { once: true }); im.addEventListener('error', ok, { once: true }); }
  });
}

/* ---------- estado abierto / cerrado (hora de Buenos Aires) ---------- */
function ahoraBA() {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t) => f.find((p) => p.type === t)?.value || '';
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'));
  return { dow, min: (+g('hour')) * 60 + (+g('minute')) };
}
function estado() {
  const { dow, min } = ahoraBA();
  const finde = dow === 5 || dow === 6;
  const cierra = finde ? 23 * 60 : 20 * 60;
  const abierto = min >= 8 * 60 + 30 && min < cierra;
  const manana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const txt = abierto ? `Abierto ahora · hasta las ${finde ? '23:00' : '20:00'} hs` : min < 8 * 60 + 30 ? 'Cerrado · abrimos hoy a las 8:30 hs' : `Cerrado · abrimos el ${manana[(dow + 1) % 7]} a las 8:30 hs`;
  $$('.estado').forEach((e) => { e.classList.toggle('cerrado', !abierto); $('.estado-t', e).textContent = txt; });
  $$('.horario tr').forEach((tr) => tr.classList.toggle('hoy', tr.dataset.d.split(' ').includes(String(dow))));
}
estado(); setInterval(estado, 60000);

/* =========================================================
   INTRO: el sol se dibuja justo donde va el plato del hero y el logo se
   escribe donde va el logo del hero: no se pisan y la página se abre desde el sol
   ========================================================= */
function abrirPagina() {
  if (d.classList.contains('abierta')) return;
  d.classList.add('lista');
  setTimeout(() => { d.classList.add('abierta'); }, 300);
  setTimeout(() => { $('.intro')?.remove(); }, 950);
  setTimeout(diferidas, 700);
}
function armarIntro() {
  const intro = $('.intro'); if (!intro) return;
  const disco = $('.ha-disco').getBoundingClientRect();
  const logo = $('.ha-logo img').getBoundingClientRect();
  const rayosR = $('.ha-rayos').getBoundingClientRect();
  const W = innerWidth, H = innerHeight;
  const cx = disco.left + disco.width / 2, cy = disco.top + disco.height / 2, r = disco.width / 2 + 3;
  intro.style.setProperty('--ox', cx + 'px'); intro.style.setProperty('--oy', cy + 'px'); intro.style.setProperty('--rd', (disco.width / 2) + 'px');
  const svg = $('.intro-sol'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const aro = $('.aro', svg); aro.setAttribute('cx', cx); aro.setAttribute('cy', cy); aro.setAttribute('r', r);
  // los mismos rayos del hero, en píxeles: cuando la intro se va, quedan exactamente donde estaban
  const k = rayosR.width / 200, ox = rayosR.left + rayosR.width / 2, oy = rayosR.top + rayosR.height / 2;
  const g = $('.rayos-i', svg);
  pintarRayos(g, RAYOS_HERO.map(([a, b, c, e]) => [ox + a * k, oy + b * k, ox + c * k, oy + e * k]));
  $$('line', g).forEach((l, i) => { l.style.animationDelay = (0.32 + i * 0.022) + 's'; l.style.strokeWidth = (3.2 * k).toFixed(2); });
  const il = $('.intro-logo'); Object.assign(il.style, { left: logo.left + 'px', top: logo.top + 'px', width: logo.width + 'px' });
}
if (d.classList.contains('con-intro')) {
  d.classList.add('desde-intro');
  armarIntro();
  const hero = $('.ha-disco img.on');
  const espera = Promise.all([
    document.fonts ? document.fonts.ready : 0,
    hero && !hero.complete ? new Promise((r) => { hero.addEventListener('load', r, { once: true }); hero.addEventListener('error', r, { once: true }); }) : 0,
    new Promise((r) => setTimeout(r, celu() ? 950 : 1350)),
  ]);
  Promise.race([espera, new Promise((r) => setTimeout(r, celu() ? 1450 : 2100))]).then(abrirPagina);
} else { d.classList.add('abierta'); addEventListener('load', diferidas, { once: true }); }
function diferidas() { $$('img[data-src]').forEach((im) => { im.srcset = im.dataset.srcset || ''; im.src = im.dataset.src; im.removeAttribute('data-src'); }); }

/* ---------- entradas al scroll ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: .14 });
$$('.rv').forEach((el) => io.observe(el));
$$('.ha-top > *, .ha-pie > *').forEach((el, i) => el.style.setProperty('--d', i));

/* =========================================================
   HERO: el día con el scroll
   ========================================================= */
const ha = $('.ha');
{
  const imgs = $$('.ha-disco img'), caps = $$('.cap'), horas = $$('.ha-horas button'), rayosEl = $('.ha-rayos');
  let m = -1, tick = false;
  const set = (n) => {
    if (n === m) return; m = n; ha.dataset.m = n;
    imgs.forEach((im, i) => im.classList.toggle('on', i === n));
    caps.forEach((c, i) => c.classList.toggle('on', i === n));
    horas.forEach((b, i) => { b.classList.toggle('on', i === n); b.setAttribute('aria-pressed', i === n); });
    $('meta[name=theme-color]').content = n === 3 ? '#1F3E8C' : '#FBF3EA';
    if (n > 0) diferidas();
  };
  const upd = () => {
    tick = false;
    const tot = ha.offsetHeight - innerHeight; const p = Math.min(1, Math.max(0, -ha.getBoundingClientRect().top / tot));
    set(Math.min(3, Math.floor(p * 4 * .999)));
    rayosEl.style.setProperty('--giro', (p * 120) + 'deg');
    d.classList.toggle('en-hero', ha.getBoundingClientRect().bottom > innerHeight * .6);
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd, { passive: true });
  horas.forEach((b, i) => b.addEventListener('click', () => {
    const tot = ha.offsetHeight - innerHeight;
    scrollTo({ top: ha.offsetTop + tot * (i + .5) / 4, behavior: reduce ? 'auto' : 'smooth' });
  }));
  set(0); upd();
}

/* =========================================================
   MENÚ (la pizarra)
   ========================================================= */
{
  const bt = $('.pizarra'), menu = $('#menu');
  $$('.menu-l li').forEach((li, i) => li.style.setProperty('--i', i));
  const abrir = () => { menu.hidden = false; bt.setAttribute('aria-expanded', 'true'); d.style.overflow = 'hidden'; $('.menu-x').focus(); };
  const cerrar = () => { menu.hidden = true; bt.setAttribute('aria-expanded', 'false'); d.style.overflow = ''; };
  bt.addEventListener('click', abrir);
  $('.menu-x').addEventListener('click', () => { cerrar(); bt.focus(); });
  $$('.menu-l a').forEach((a) => a.addEventListener('click', cerrar));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { cerrar(); bt.focus(); } });
}

/* =========================================================
   DATOS: la carta se pinta con cliente.json apenas carga; cuando llega el kit,
   se repinta con lo que el dueño editó en /admin y se enganchan los "+"
   ========================================================= */
let CFG = null, PRODS = [], CATS = [];
const prod = (id) => PRODS.find((p) => p.id === id);
let kit = null; let resolverKit; const kitP = new Promise((r) => (resolverKit = r));
const pintores = [];
function repintarTodo() { pintores.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); kit?.carrito?.sync?.(); }
fetch('cliente.json', { cache: 'no-cache' }).then((r) => r.json()).then((c) => {
  CFG = c;
  // si el dueño ya editó la carta en /admin (demo en este navegador), se usa esa y no la de cliente.json
  let guardada = null; try { const k = Object.keys(localStorage).find((x) => x.startsWith(`kit:${c.id}:v`) && !x.endsWith(':carrito')); if (k) guardada = JSON.parse(localStorage.getItem(k)); } catch (_) { /* nada */ }
  if (!kit) { PRODS = guardada?.productos || c.carta.productos; CATS = guardada?.categorias || c.carta.categorias; repintarTodo(); }
});

const arrancarKit = () => import('../kit/kit.js?v=1').then(({ initKit }) => initKit({
  config: 'cliente.json',
  imagenes: { lqip: 'img/lqip.json', selector: '.collage img, .nav-foto img, .fechas img, .pk-caja img, .plato-sol img' },
  carrito: { label: 'Tu cartoccio', icono: '<svg viewBox="0 0 24 24"><path d="M4 9h16l-2 11H6L4 9Z"/><path d="M8 9l4-5 4 5"/></svg>' },
  badge: true,
})).then(async (k) => {
  kit = k;
  const recargar = async () => { PRODS = await k.store.getProductos(); CATS = await k.store.getCategorias(); repintarTodo(); };
  await recargar();
  k.store.onChange(recargar);
  document.addEventListener('kit:carrito', pintarCartoccio);
  pintarCartoccio();
  resolverKit(k);
}).catch((err) => console.error('[sole] kit', err));
if (document.readyState === 'complete') setTimeout(arrancarKit, 300); else addEventListener('load', () => setTimeout(arrancarKit, 300), { once: true });

const qty = (id) => `<div data-kit-qty="${esc(id)}"></div>`;
const th = (p, cls = 'th') => p?.foto ? `<span class="${cls} ph"><img src="${esc(p.foto)}" alt="" width="480" height="480" loading="lazy" decoding="async"></span>` : '';

/* =========================================================
   WOW: la teglia al corte
   ========================================================= */
const SAB = {
  cherry: { id: 'foc-cherry', n: 'Cherrys, olivas y romero', d: 'Cherrys, olivas verdes, romero y muzza sobre masa madre y harina orgánica.', img: 'img/t-cherry.webp', promo: true },
  pomodoro: { id: 'foc-pomodoro', n: 'Pomodoro, pesto y cherrys', d: 'Pomodoro, muzza, pesto de albahaca y cherrys.', img: 'img/t-pomodoro.webp', promo: true },
  pera: { id: 'foc-pera', n: 'Pera, queso azul y nueces', d: 'Pera, queso azul, nueces y un hilo de syrup. El clásico de la casa.', img: 'img/t-pera.webp', promo: true },
  especial: { id: 'foc-especial', n: 'Especial de stracciatella', d: 'Pomodoro, muzza, pesto, cherrys, stracciatella con limón, syrup y parmesano.', img: 'img/t-especial.webp', promo: false },
};
const ORDEN = ['cherry', 'pomodoro', 'pera', 'especial'];
pintores.push(() => ORDEN.forEach((s) => { const p = prod(SAB[s].id); const li = $(`.sabores li[data-s="${s}"] i`); if (p && li) li.textContent = plata(p.precio); }));
const teglia = $('#teglia'), mesa = $('#mesa'), globo = $('.globo');
const ratio = {};
let sel = null;
ORDEN.forEach((s, col) => {
  for (let r = 0; r < 3; r++) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pz'; b.dataset.s = s; b.dataset.r = r;
    b.style.gridColumn = col + 1; b.style.gridRow = r + 1;
    b.setAttribute('aria-label', `Porción de ${SAB[s].n}`);
    b.innerHTML = '<svg aria-hidden="true"><rect x="0" y="0" width="100%" height="100%" rx="8" pathLength="1"/></svg>';
    teglia.appendChild(b);
  }
});
function encuadrar() {
  ORDEN.forEach((s) => {
    const R = ratio[s]; if (!R) return;
    const pzs = $$(`.pz[data-s="${s}"]`, teglia); if (!pzs.length) return;
    const W = pzs[0].offsetWidth, rowH = pzs[0].offsetHeight, gap = parseFloat(getComputedStyle(teglia).rowGap) || 0;
    const H = rowH * 3 + gap * 2;
    let w = W, h = W / R; if (h < H) { h = H; w = H * R; }
    pzs.forEach((pz) => {
      if (pz.classList.contains('vacia')) return;
      const r = +pz.dataset.r;
      pz.style.backgroundImage = `url(${SAB[s].img})`;
      pz.style.backgroundSize = `${w}px ${h}px`;
      pz.style.backgroundPosition = `${(W - w) / 2}px ${(H - h) / 2 - r * (rowH + gap)}px`;
    });
  });
}
new IntersectionObserver((es, o) => {
  if (!es.some((e) => e.isIntersecting)) return; o.disconnect();
  ORDEN.forEach((s) => { const im = new Image(); im.onload = () => { ratio[s] = im.naturalWidth / im.naturalHeight; encuadrar(); }; im.src = SAB[s].img; });
}, { rootMargin: '600px 0px' }).observe(teglia);
addEventListener('resize', () => { encuadrar(); if (sel) ubicarGlobo(sel); }, { passive: true });

function ubicarGlobo(pz) {
  const m = mesa.getBoundingClientRect(), p = pz.getBoundingClientRect();
  const gw = globo.offsetWidth, gh = globo.offsetHeight;
  const centro = p.left - m.left + p.width / 2;
  const left = Math.max(8, Math.min(m.width - gw - 8, centro - gw / 2));
  const abajo = +pz.dataset.r < 2;
  const top = abajo ? p.bottom - m.top + 16 : p.top - m.top - gh - 16;
  globo.classList.toggle('abajo', abajo); globo.classList.toggle('arriba', !abajo);
  globo.style.setProperty('--gx', left + 'px'); globo.style.setProperty('--gy', top + 'px');
  globo.style.setProperty('--px', Math.max(22, Math.min(gw - 22, centro - left)) + 'px');
}
function cerrarGlobo() { globo.hidden = true; teglia.classList.remove('atenuar'); if (sel) sel.classList.remove('alzada'); sel = null; }
teglia.addEventListener('click', (e) => {
  const pz = e.target.closest('.pz'); if (!pz || pz.classList.contains('vacia')) return;
  if (sel === pz) return cerrarGlobo();
  if (sel) sel.classList.remove('alzada');
  sel = pz; pz.classList.add('alzada'); teglia.classList.add('atenuar');
  const s = SAB[pz.dataset.s], p = prod(s.id);
  $('#gl-n').textContent = s.n; $('.gl-d', globo).textContent = p?.descripcion && pz.dataset.s === 'especial' ? p.descripcion : s.d;
  $('.gl-p', globo).textContent = plata(p?.precio ?? (s.promo ? 6500 : 9000));
  globo.hidden = false; globo.style.animation = 'none'; void globo.offsetWidth; globo.style.animation = '';
  ubicarGlobo(pz);
});
$('.x', globo).addEventListener('click', (e) => { e.stopPropagation(); cerrarGlobo(); });
document.addEventListener('click', (e) => { if (!globo.hidden && !globo.contains(e.target) && !teglia.contains(e.target)) cerrarGlobo(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !globo.hidden) cerrarGlobo(); });

const PROMO = ['foc-cherry', 'foc-pomodoro', 'foc-pera'];
$('[data-cortar]', globo).addEventListener('click', async (e) => {
  e.stopPropagation(); if (!sel) return;
  const pz = sel, s = pz.dataset.s;
  const r = pz.getBoundingClientRect(), dst = $('.ca-lista').getBoundingClientRect();
  if (!reduce) {
    const v = document.createElement('div'); v.className = 'vuela';
    Object.assign(v.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', backgroundImage: pz.style.backgroundImage, backgroundSize: pz.style.backgroundSize, backgroundPosition: pz.style.backgroundPosition });
    document.body.appendChild(v);
    requestAnimationFrame(() => requestAnimationFrame(() => { v.style.transform = `translate(${dst.left + 30 - r.left}px,${dst.top - 10 - r.top}px) scale(.25) rotate(-12deg)`; v.style.opacity = '.3'; }));
    setTimeout(() => v.remove(), 760);
  }
  pz.classList.remove('alzada'); pz.classList.add('vacia'); pz.disabled = true; pz.setAttribute('aria-label', 'Porción vendida');
  ['backgroundImage', 'backgroundSize', 'backgroundPosition'].forEach((k) => (pz.style[k] = ''));
  if (!$$(`.pz[data-s="${s}"]:not(.vacia)`, teglia).length) $(`.sabores li[data-s="${s}"]`).classList.add('agotada');
  sel = null; globo.hidden = true; teglia.classList.remove('atenuar');
  const k = kit || await kitP;
  if (s === 'especial') k.carrito.agregar('foc-especial', 1);
  else {
    const suelta = k.carrito.lineas.find((l) => PROMO.includes(l.id) && l.cant > 0);
    if (suelta) {
      k.carrito.agregar(suelta.id, -1);
      k.carrito.agregar('promo-2-focaccias', 1, { opc: { primera: suelta.id.slice(4), segunda: s } });
    } else k.carrito.agregar(SAB[s].id, 1);
  }
});
const CORTO = { cherry: 'Cherrys', pomodoro: 'Pomodoro', pera: 'Pera' };
function pintarCartoccio() {
  if (!kit) return;
  const ls = kit.carrito.lineas.filter((l) => l.id === 'promo-2-focaccias' || l.id.startsWith('foc-'));
  const lista = $('.ca-lista');
  lista.innerHTML = ls.length ? ls.map((l) => {
    const n = l.id === 'promo-2-focaccias' ? `Promo: ${CORTO[l.opc?.primera] || ''} + ${CORTO[l.opc?.segunda] || ''}` : (SAB[l.id.slice(4)]?.n || prod(l.id)?.nombre || '');
    return `<li><b>${l.cant}</b>${esc(n)}</li>`;
  }).join('') : '<li class="ca-vacio">Todavía no cortaste nada</li>';
  const tot = ls.reduce((a, l) => a + (prod(l.id)?.precio || 0) * l.cant, 0);
  $('.ca-tot b').textContent = plata(tot);
  $('.sello').classList.toggle('on', ls.some((l) => l.id === 'promo-2-focaccias'));
}
$('[data-pedir]').addEventListener('click', async () => { const k = kit || await kitP; k.carrito.abrir(); });

/* =========================================================
   DEL MOSTRADOR
   ========================================================= */
const MOSTRADOR = ['pa-croissant-almendras', 'to-caprese-frosting', 'to-vasca', 'to-caprese', 'pan-centeno', 'pan-brioche', 'pan-integral'];
const FOTO_M = (id) => `img/m/${id}.webp`;
pintores.push(() => {
  const fila = $('#estante');
  const items = MOSTRADOR.map(prod).filter((p) => p && p.disponible !== false);
  fila.innerHTML = items.map((p) => `
    <article class="mo">
      <div class="mo-foto ph"><img src="${FOTO_M(p.id)}" alt="${esc(p.nombre)}" width="720" height="720" loading="lazy" decoding="async"></div>
      <svg class="mo-hilo" viewBox="0 0 2 26" aria-hidden="true"><path d="M1 0 V26" pathLength="1"/></svg>
      <div class="mo-tag"><p class="mo-n">${esc(p.nombre)}</p><p class="mo-p">${plata(p.precio)}</p>${qty(p.id)}</div>
    </article>`).join('');
  marcarCarga(fila); flechas();
});
function flechas() {
  const f = $('#estante'); const [a, b] = $$('.flecha');
  a.disabled = f.scrollLeft < 8; b.disabled = f.scrollLeft + f.clientWidth > f.scrollWidth - 8;
}
$('#estante').addEventListener('scroll', flechas, { passive: true });
$$('.flecha').forEach((b) => b.addEventListener('click', () => { const f = $('#estante'); f.scrollBy({ left: +b.dataset.dir * f.clientWidth * .8, behavior: 'smooth' }); }));

/* arrastre con el mouse en filas deslizables (desde cualquier punto, sin agarrar la foto) */
function arrastrable(el) {
  let x0 = 0, s0 = 0, mov = false, activo = false, vel = 0, ult = 0, ultT = 0, raf = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button, a, input, [data-kit-qty]')) return;
    activo = true; mov = false; x0 = e.clientX; s0 = el.scrollLeft; ult = e.clientX; ultT = performance.now(); vel = 0; cancelAnimationFrame(raf);
  });
  addEventListener('pointermove', (e) => {
    if (!activo) return; const dx = e.clientX - x0;
    if (!mov && Math.abs(dx) > 5) { mov = true; el.classList.add('arrastrando'); }
    if (mov) { el.scrollLeft = s0 - dx; const t = performance.now(); vel = (e.clientX - ult) / Math.max(1, t - ultT); ult = e.clientX; ultT = t; }
  });
  addEventListener('pointerup', () => {
    if (!activo) return; activo = false;
    if (!mov) return;
    let v = vel * 16;
    const paso = () => { if (Math.abs(v) < .5) { el.classList.remove('arrastrando'); return; } el.scrollLeft -= v; v *= .93; raf = requestAnimationFrame(paso); };
    paso();
    el.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); }, { capture: true, once: true });
  });
}
arrastrable($('#estante')); arrastrable($('#collage'));

/* =========================================================
   NOTTE: menú de pastas (pestañas de alto fijo)
   ========================================================= */
let mnTab = 'noche-pastas';
function itemsNoche(cat) {
  return PRODS.filter((p) => p.categoria === cat && p.disponible !== false).sort((a, b) => (a.orden || 0) - (b.orden || 0));
}
function htmlNoche(cat) {
  return itemsNoche(cat).map((p, i) => `
    <div class="mn-it" style="--i:${i}">
      ${p.foto ? th(p) : '<span class="th no" aria-hidden="true"></span>'}
      <p class="mn-n"><span>${esc(p.nombre)}</span><i></i><b>${plata(p.precio)}</b></p>
      <p class="mn-d">${esc(p.descripcion || '')}</p>
    </div>`).join('');
}
function pintarNoche() {
  const c = $('#mn-cuerpo'); if (!PRODS.length) return;
  // alto fijo: el de la pestaña más larga, así cambiar de pestaña no mueve nada
  const tmp = document.createElement('div'); tmp.className = 'mn-cuerpo'; tmp.style.cssText = `position:absolute;visibility:hidden;left:0;right:0;min-height:0;width:${c.clientWidth}px`;
  c.parentNode.appendChild(tmp); let max = 0;
  $$('.mn-tabs button').forEach((b) => { tmp.innerHTML = htmlNoche(b.dataset.t); max = Math.max(max, tmp.offsetHeight); });
  tmp.remove(); c.style.setProperty('--mn-h', max + 'px');
  c.innerHTML = htmlNoche(mnTab); marcarCarga(c);
}
pintores.push(pintarNoche);
$$('.mn-tabs button').forEach((b) => b.addEventListener('click', () => {
  mnTab = b.dataset.t; $$('.mn-tabs button').forEach((x) => x.setAttribute('aria-selected', x === b)); const c = $('#mn-cuerpo'); c.innerHTML = htmlNoche(mnTab); marcarCarga(c);
}));
pintarRayosNoche();
function pintarRayosNoche() { /* ya dibujados arriba */ }

/* =========================================================
   LA CARTA (vidriera)
   ========================================================= */
const GRUPOS = [
  { id: 'cafe', n: 'Café', cats: ['cafe-chico', 'cafe-mediano', 'cafe-grande', 'cafe-frio'], subs: ['Chico', 'Mediano', 'Grande', 'Fríos'] },
  { id: 'pasticceria', n: 'Pasticceria', cats: ['pasticceria', 'tortas'], subs: ['Pasticceria', 'Tortas y postres'] },
  { id: 'focacce', n: 'Focacce y sándwiches', cats: ['focaccias', 'sandwiches'], subs: ['Focaccias', 'Sándwiches'] },
  { id: 'brunch', n: 'Brunch', cats: ['brunch'] },
  { id: 'antipasti', n: 'Antipasti', cats: ['antipasti'] },
  { id: 'bebidas', n: 'Jugos y tragos', cats: ['jugos', 'sin-alcohol', 'con-alcohol'], subs: ['Jugos', 'Sin alcohol', 'Con alcohol'] },
  { id: 'panes', n: 'Panes', cats: ['panes'] },
];
const PEDIBLES = new Set(['focaccias', 'sandwiches', 'antipasti', 'pasticceria', 'tortas', 'panes']);
let gi = 0, si = 0;
const catPor = (id) => CATS.find((c) => c.id === id);
function htmlCat(cid) {
  const c = catPor(cid); if (!c) return '';
  const ps = PRODS.filter((p) => p.categoria === cid && p.disponible !== false).sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const ped = PEDIBLES.has(cid);
  return `<div class="cat"><h3>${esc(c.nombre.replace(/^Café · /, 'Café · '))}</h3>${c.bajada ? `<p class="cat-b">${esc(c.bajada)}</p>` : ''}<ul role="list">${ps.map((p) => `
    <li class="it${p.foto ? ' con-foto' : ''}${ped ? '' : ' sin-q'}">
      ${th(p)}
      <div><p class="it-l"><span>${esc(p.nombre)}</span><i></i><b>${plata(p.precio)}</b></p>${p.descripcion ? `<p class="it-d">${esc(p.descripcion)}</p>` : ''}</div>
      ${ped ? `<div class="it-q">${qty(p.id)}</div>` : ''}
    </li>`).join('')}</ul></div>`;
}
const visiblesCarta = (g) => (celu() && g.cats.length > 1 ? [g.cats[si]] : g.cats);
function htmlGrupo(g) { return visiblesCarta(g).map(htmlCat).join(''); }
function pintarCarta() {
  if (!CATS.length) return;
  const gr = $('#grupos'), sb = $('#subs'), cuerpo = $('#hoja-cuerpo');
  gr.innerHTML = GRUPOS.map((g, i) => `<button type="button" role="tab" aria-selected="${i === gi}" data-g="${i}">${esc(g.n)}</button>`).join('');
  const g = GRUPOS[gi];
  sb.innerHTML = (g.subs || []).map((s, i) => `<button type="button" role="tab" aria-selected="${i === si}" data-s="${i}">${esc(s)}</button>`).join('');
  sb.style.visibility = g.subs ? 'visible' : 'hidden';
  // alto reservado: el del grupo (o parte) más largo en esta pantalla
  const tmp = document.createElement('div'); tmp.className = 'hoja-cuerpo';
  tmp.style.cssText = `position:absolute;visibility:hidden;min-height:0;width:${cuerpo.clientWidth}px`;
  cuerpo.parentNode.appendChild(tmp); let max = 0;
  GRUPOS.forEach((G) => { const partes = celu() && G.cats.length > 1 ? G.cats.map((c) => [c]) : [G.cats]; partes.forEach((cs) => { tmp.innerHTML = cs.map(htmlCat).join(''); max = Math.max(max, tmp.offsetHeight); }); });
  tmp.remove(); cuerpo.style.setProperty('--hc-h', max + 'px');
  cuerpo.innerHTML = htmlGrupo(g); marcarCarga(cuerpo);
  const [ant, sig] = $$('.pag');
  ant.disabled = gi === 0; sig.disabled = gi === GRUPOS.length - 1;
  $('em', ant).textContent = GRUPOS[gi - 1]?.n || ''; $('em', sig).textContent = GRUPOS[gi + 1]?.n || '';
  ant.setAttribute('aria-label', 'Sección anterior: ' + (GRUPOS[gi - 1]?.n || '')); sig.setAttribute('aria-label', 'Sección siguiente: ' + (GRUPOS[gi + 1]?.n || ''));
  kit?.carrito?.sync?.();
}
pintores.push(pintarCarta);
function irGrupo(i, foco) {
  gi = Math.max(0, Math.min(GRUPOS.length - 1, i)); si = 0; pintarCarta();
  const b = $(`#grupos [data-g="${gi}"]`); b?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  if (foco) b?.focus({ preventScroll: true });
}
$('#grupos').addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (b) irGrupo(+b.dataset.g); });
$('#subs').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; si = +b.dataset.s; pintarCarta(); });
$$('.pag').forEach((b) => b.addEventListener('click', () => { irGrupo(gi + +b.dataset.pag); $('#carta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }));
let anchoAnt = innerWidth;
addEventListener('resize', () => { if ((anchoAnt < 768) !== (innerWidth < 768) || Math.abs(anchoAnt - innerWidth) > 60) { anchoAnt = innerWidth; si = 0; pintarCarta(); pintarNoche(); } }, { passive: true });

/* =========================================================
   NAVIDAD: pan dulce y caja por encargo
   ========================================================= */
pintores.push(() => {
  const c = $('#pandulces');
  const ps = ['pan-dulce-medio', 'pan-dulce-cuarto', 'pan-dulce-pistacho'].map(prod).filter(Boolean);
  c.innerHTML = ps.map((p) => `<div class="pd">${p.foto ? th(p) : '<span class="th no" aria-hidden="true"><img src="img/isotipo.svg" alt="" width="40" height="40" style="width:30px;height:30px"></span>'}<div><p class="pd-n">${esc(p.nombre)}</p><p class="pd-p">${plata(p.precio)}</p></div>${qty(p.id)}</div>`).join('');
  marcarCarga(c);
});
$('[data-encargar]').addEventListener('click', async (e) => {
  const k = kit || await kitP; const id = e.currentTarget.dataset.encargar;
  if (!k.carrito.lineas.some((l) => l.id === id)) k.carrito.agregar(id, 1, { origen: e.currentTarget });
  setTimeout(() => k.carrito.abrir(), 420);
});

/* =========================================================
   GIFT CARD: se da vuelta, y el mensaje se escribe en el dorso
   ========================================================= */
{
  const gc = $('#gc'); let monto = 25000;
  const fmt = (n) => '$' + Number(n).toLocaleString('es-AR');
  gc.addEventListener('click', () => gc.classList.toggle('vuelta'));
  $$('.montos button').forEach((b) => b.addEventListener('click', () => {
    $$('.montos button').forEach((x) => x.setAttribute('aria-checked', x === b));
    if (b.dataset.monto === 'otro') { abrirGC(true); return; }
    monto = +b.dataset.monto; $('#gcd-monto').textContent = fmt(monto); gc.classList.add('vuelta');
  }));
  $('[data-gc-abrir]').addEventListener('click', () => abrirGC(false));
  async function abrirGC(otro) {
    const k = kit || await kitP;
    const { popup } = await import('../kit/core/ui.js?v=1');
    const f = document.createElement('form'); f.className = 'gc-form'; f.noValidate = true;
    f.innerHTML = `
      <label>Monto<input name="monto" type="number" inputmode="numeric" min="10000" max="150000" step="500" value="${otro ? '' : monto}" placeholder="Entre $10.000 y $150.000" required></label>
      <div class="fila"><label>Para<input name="para" maxlength="40" autocomplete="off" placeholder="Sofi" required></label><label>De<input name="de" maxlength="40" autocomplete="name" placeholder="Juli" required></label></div>
      <label>Mensaje<textarea name="mensaje" maxlength="160" placeholder="Para tu próximo café con medialunas."></textarea></label>
      <p class="nota">Se paga con Mercado Pago y te llega el código para regalar. Vale 90 días en el local.</p>
      <button type="submit" class="b-toldo"><span>Sumar al cartoccio</span></button>`;
    const pop = popup({ titulo: 'Tu gift card', contenido: f, clase: 'kit-pop--sm pop-gc' });
    const vivo = () => {
      $('#gcd-para').textContent = f.para.value || 'Sofi'; $('#gcd-de').textContent = f.de.value || 'Juli';
      $('#gcd-msg').textContent = f.mensaje.value || 'Para tu próximo café con medialunas. ¡Feliz cumple!';
      if (+f.monto.value) $('#gcd-monto').textContent = fmt(+f.monto.value);
    };
    f.addEventListener('input', vivo);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const m = Math.round(+f.monto.value);
      if (!k.giftcards.montoValido(m)) { f.monto.setCustomValidity('Elegí un monto entre $10.000 y $150.000'); f.monto.reportValidity(); f.monto.setCustomValidity(''); return; }
      if (!f.para.value.trim() || !f.de.value.trim()) { (f.para.value.trim() ? f.de : f.para).focus(); return; }
      k.giftcards.agregar({ monto: m, para: f.para.value, de: f.de.value, mensaje: f.mensaje.value }, { origen: f.querySelector('[type=submit]') });
      monto = m; vivo(); gc.classList.add('vuelta'); pop.close();
    });
    setTimeout(() => (otro ? f.monto : f.para).focus(), 300);
  }
}

/* =========================================================
   MAPA (Leaflet, se carga al acercarse)
   ========================================================= */
new IntersectionObserver((es, o) => {
  if (!es.some((e) => e.isIntersecting)) return; o.disconnect();
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'vendor/leaflet/leaflet.css'; document.head.appendChild(css);
  const s = document.createElement('script'); s.src = 'vendor/leaflet/leaflet.js'; s.async = true;
  s.onload = () => {
    const L = window.L; const pos = [-34.4166101, -58.5848826];
    const mapa = L.map('mapa', { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView(pos, 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, className: 'tiles-papel', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(mapa);
    L.marker(pos, { icon: L.divIcon({ className: 'pin-sole', html: '<img src="img/pin.svg" alt="Sole di Parma" width="64" height="64">', iconSize: [64, 64] }), title: 'Sole di Parma · Eduardo Madero 537' }).addTo(mapa);
    mapa.on('click', () => mapa.scrollWheelZoom.enable());
  };
  document.head.appendChild(s);
}, { rootMargin: '500px 0px' }).observe($('#mapa'));

/* ---------- botones flotantes: se esconden en el hero y en la teglia del celu ---------- */
{
  const vis = new Map();
  const ob = new IntersectionObserver((es) => {
    es.forEach((e) => vis.set(e.target, e.isIntersecting && e.intersectionRatio > .25));
    const tapan = [...vis.values()].some(Boolean);
    d.classList.toggle('oculta-flotantes', tapan && celu());
  }, { threshold: [0, .25, .5] });
  ob.observe($('.ha-stage')); ob.observe($('#mesa'));

}

/* ---------- anclas con scroll suave (sin scroll-behavior global: así el scroll por código es inmediato) ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const el = document.getElementById(a.getAttribute('href').slice(1)); if (!el) return;
  e.preventDefault(); el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', a.getAttribute('href'));
});
