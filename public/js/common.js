// Small helpers shared by the screens. Text from the server is always set as text, never as HTML.
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'value') el.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'selected') el[k] = Boolean(v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  // Tabler's component classes, so every screen gets them without repeating them.
  if (tag === 'button' && !/incident|choice/.test(el.className)) el.classList.add('btn', ...(el.classList.contains('primary') ? ['btn-danger'] : el.classList.contains('go') ? ['btn-success'] : []));
  if (tag === 'input') el.classList.add(attrs && attrs.type === 'checkbox' ? 'form-check-input' : 'form-control');
  if (tag === 'select') el.classList.add('form-select');
  if (tag === 'table') el.classList.add('table', 'table-vcenter');
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid);
  return el;
}

export async function api(path, body) {
  const res = await fetch('/api' + path, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !location.pathname.startsWith('/login')) { location.href = '/login'; throw new Error("Connectez-vous d'abord"); }
  if (!res.ok) throw new Error(data.error || 'La demande a échoué');
  return data;
}

// Re-reads the state whenever the server says something changed, and every 10 s in case the connection dropped.
export function live(draw) {
  let waiting = false, again = false;
  const run = async () => {
    if (waiting) { again = true; return; }
    waiting = true;
    try { draw(await api('/state')); } catch (e) { console.warn(e.message); }
    waiting = false;
    if (again) { again = false; run(); }
  };
  const es = new EventSource('/api/stream');
  es.onmessage = run;
  setInterval(run, 10000);
  run();
}

export const crescent = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 32'); svg.setAttribute('class', 'crescent'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path fill="#e5484d" d="M21 5.5a12 12 0 1 0 0 21 9.6 9.6 0 1 1 0-21Z"/><path d="M15 16h13m-4-4 4 4-4 4" fill="none" stroke="#2bb673" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
  return svg;
};

export const SEVERITY = { low: 'faible', medium: 'moyenne', high: 'élevée', critical: 'critique' };
export const STATUS = { new: 'Nouveau', located: 'Localisé', assessed: 'Évalué', dispatched: 'Unité envoyée', on_scene: 'Sur les lieux', to_hospital: "Vers l'hôpital", arrived: "Arrivé à l'hôpital", closed: 'Clôturé', cancelled: 'Annulé' };
export const MISSION = { sent: "En attente de l'équipage", accepted: "En route vers l'accident", on_scene: 'Sur les lieux', to_hospital: "Vers l'hôpital", at_hospital: "Arrivé à l'hôpital" };

export const severityPill = s => h('span', { class: `pill ${s || ''}` }, s ? `Gravité : ${SEVERITY[s]}` : 'Non évalué');
export const minutes = s => (s == null ? '—' : s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')} min`);
export const clock = t => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function topbar(title, extra = []) {
  return h('header', { class: 'topbar' },
    h('div', { class: 'brand' },
      crescent(),
      h('div', { class: 'brand-text' },
        h('a', { href: '/', class: 'product', style: 'color:#fff;' }, 'Couloir 14'),
        h('small', {}, 'Protection Civile 14 • Alger')
      ),
      h('span', { class: 'pill', style: 'margin-inline-start: 10px; font-weight:700;' }, title)
    ),
    extra,
    h('div', { class: 'spacer' }),
    h('div', { style: 'display:flex; align-items:center; gap:10px;' },
      h('span', { class: 'pill', style: 'font-size:12px; border-color:var(--line);' }, '👤 Cpt. Amine M.'),
      h('button', { type: 'button', class: 'btn btn-outline-danger', style: 'padding: 6px 14px; font-size:13px;', onclick: async () => { await api('/logout', {}); location.href = '/login'; } }, 'Déconnexion')
    )
  );
}

export const assessmentFacts = a => (a ? [
  ['Véhicules', a.vehicles], ['Victimes', a.victims], ['Bus', a.bus ? 'Oui' : 'Non'],
  ['Personnes coincées', a.trapped ? 'Oui' : 'Non'], ['Incendie', a.fire ? 'Oui' : 'Non'], ['Conscients', a.conscious ? 'Oui' : 'Non'],
].map(([k, v]) => h('div', { class: 'fact' }, h('span', { class: 'muted' }, k), h('b', {}, String(v)))) : [h('p', { class: 'muted' }, 'Pas encore évalué')]);

// Leaflet markers, all without any cross symbol.
export function marker(L, kind, lat, lon, title) {
  const colors = { accident: '#e5484d', unit: '#4a9bd9', hospital: '#ffffff', ambulance: '#ffffff', report: '#f0a52b' };
  const inner = kind === 'hospital' || kind === 'ambulance'
    ? '<svg viewBox="-13 -13 26 26" width="18" height="18"><path fill="#e5484d" d="M7.05 -7.09 A10 10 0 1 0 7.05 7.09 A7.8 7.8 0 1 1 7.05 -7.09 Z"/></svg>'
    : '';
  const size = kind === 'unit' ? 12 : 26;
  const icon = L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2], html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${colors[kind]};border:2px solid #0c1820;display:flex;align-items:center;justify-content:center">${inner}</div>` });
  const m = L.marker([lat, lon], { icon, title });
  if (title) m.bindTooltip(title);
  return m;
}

export function baseMap(L, el, center = [36.755, 3.06], zoom = 13) {
  // No fade or zoom animation: tiles fade in on animation frames, which stop in a background window, and a control room needs the map at once.
  const map = L.map(el, { fadeAnimation: false, zoomAnimation: false }).setView(center, zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  // Leaflet measures its box once; the screens lay out after that, and phones rotate.
  new ResizeObserver(() => map.invalidateSize()).observe(map.getContainer());
  return map;
}

export const lightColor = status => (status === 'active' ? '#2bb673' : '#f0a52b');
export const lightLabel = p => `${p.status === 'active' ? "Ouvert pour l'ambulance" : 'En transition : jaune puis rouge intégral'} (${p.live ? 'contrôleur réel' : 'simulation'})${p.source === 'hypothetical' ? ', feu hypothétique' : ''}`;
export const lightsNote = list => `Feux sur le trajet : ${list.length} (${list.some(p => p.live) ? 'contrôleur réel' : "simulation, aucun feu réel n'est commandé"})`;
