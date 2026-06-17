const THUMB = "https://images.ygoprodeck.com/images/cards_cropped";
const FULL  = "https://images.ygoprodeck.com/images/cards";
const CODE_FIXES = { "Meteor B. Dragon": "90660762" };

const TYPE_COLORS = {
  Dragon:"#c44",Spellcaster:"#84a",Zombie:"#5a7",Warrior:"#a83",
  "Beast-Warrior":"#976",Beast:"#6a4","Winged Beast":"#69b",Fiend:"#855",
  Fairy:"#b8b",Insect:"#7a5",Dinosaur:"#a64",Reptile:"#4a6",
  Fish:"#48b","Sea Serpent":"#37a",Machine:"#777",Thunder:"#aa4",
  Aqua:"#4ab",Pyro:"#c73",Rock:"#885",Plant:"#4a4",
  Magic:"#46a",Trap:"#a46",Ritual:"#77a",Equip:"#6a8",
};

function atkColor(atk) {
  if (atk >= 3000) return "#f44";
  if (atk >= 2500) return "#f80";
  if (atk >= 2000) return "#fa0";
  if (atk >= 1500) return "#cc0";
  return "#888";
}

// ── indices ──────────────────────────────────────────────
let byId = {}, mat2Idx = {}, fusionResultIds = new Set(), monster2Equips = {};

// Field card ID → monster type indices boosted (YGOFM game mechanics)
const FIELD_BOOSTS = {
  330: [5, 4, 9, 19],   // Forest:    Beast, Beast-Warrior, Insect, Plant
  331: [2, 18, 10],     // Wasteland: Zombie, Rock, Dinosaur
  332: [0, 6, 15],      // Mountain:  Dragon, Winged Beast, Thunder
  333: [3, 4],          // Sogen:     Warrior, Beast-Warrior
  334: [16, 13, 12],    // Umi:       Aqua, Sea Serpent, Fish
  335: [7, 1],          // Yami:      Fiend, Spellcaster
};

function buildIndices() {
  for (const c of card_db) {
    byId[c.Id] = c;
    if (c.Equip && c.Equip.length) {
      for (const mid of c.Equip) {
        if (!monster2Equips[mid]) monster2Equips[mid] = [];
        monster2Equips[mid].push(c.Id);
      }
    }
  }

  for (let i = 1; i < fusionsList.length; i++) {
    if (!fusionsList[i]) continue;
    for (const fu of fusionsList[i]) {
      fusionResultIds.add(fu.result);
      if (!mat2Idx[fu.card]) mat2Idx[fu.card] = [];
      mat2Idx[fu.card].push([i, fu.result]);
    }
  }
}

// ── image helpers ─────────────────────────────────────────
function cardCode(c) {
  let code = c.CardCode || "";
  if (!code || code === "00000000") code = CODE_FIXES[c.Name] || "";
  return code;
}
function thumbUrl(c) { const k = cardCode(c); return k ? THUMB+"/"+k+".jpg" : ""; }
function fullUrl(c)  { const k = cardCode(c); return k ? FULL+"/"+k+".jpg" : ""; }

function localUrl(c) {
  return (localImages && localImages[c.Id]) || (fandomImages && fandomImages[c.Id]) || "";
}

function imgEl(src, full, cls, local) {
  if (!src && !full && !local) return null;
  const img = document.createElement("img");
  img.className = cls;
  img.src = src || full || local;
  img.onerror = () => {
    if (full && img.src !== full) { img.src = full; }
    else if (local && img.src !== local) { img.src = local; }
    else { img.style.display = "none"; }
  };
  return img;
}

function miniThumb(card, cls="fi-thumb") {
  const src = thumbUrl(card), full = fullUrl(card);
  const el = imgEl(src, full, cls, localUrl(card));
  if (!el) {
    const ph = document.createElement("div");
    ph.className = cls + "-ph";
    ph.textContent = (card.Name||"?").slice(0,4);
    return ph;
  }
  return el;
}

// ── grid ─────────────────────────────────────────────────
function buildGrid(filterQ) {
  const q = (filterQ||"").toLowerCase().trim();
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";

  // gather result cards
  const allResults = [...fusionResultIds].map(id => byId[id]).filter(Boolean);

  // group by type, sort by ATK desc within group
  const groups = {};
  for (const c of allResults) {
    const t = cardTypes[c.Type] || "Unknown";
    const sr = (c.Name+" "+t).toLowerCase();
    if (q && !sr.includes(q)) continue;
    if (!groups[t]) groups[t] = [];
    groups[t].push(c);
  }
  for (const t in groups) groups[t].sort((a,b) => b.Attack - a.Attack);

  // order types by max ATK
  const typeOrder = Object.keys(groups).sort((a,b) => {
    const maxA = Math.max(...groups[a].map(c=>c.Attack));
    const maxB = Math.max(...groups[b].map(c=>c.Attack));
    return maxB - maxA;
  });

  let total = 0;
  for (const t of typeOrder) {
    const color = TYPE_COLORS[t] || "#555";
    const cards = groups[t];
    total += cards.length;

    // type header
    const hdr = document.createElement("div");
    hdr.className = "type-hdr";
    hdr.style.cssText = `color:${color};border-color:${color};background:${color}22`;
    hdr.innerHTML = typeIcon(cards[0].Type, 14) + `${t.toUpperCase()} <span style="float:right;opacity:.7">${cards.length}</span>`;
    gridEl.appendChild(hdr);

    // card grid
    const row = document.createElement("div");
    row.className = "card-grid";
    for (const c of cards) {
      row.appendChild(makeCell(c));
    }
    gridEl.appendChild(row);
  }

  document.getElementById("hdr-count").textContent =
    total + " cards • " + typeOrder.length + " types";
}

function makeCell(c) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.style.borderBottomColor = atkColor(c.Attack);
  cell.dataset.id = c.Id;

  const src = thumbUrl(c), full = fullUrl(c), local = localUrl(c);
  if (src || full || local) {
    const img = document.createElement("img");
    img.src = src || full || local;
    img.loading = "lazy";
    img.alt = c.Name;
    img.onerror = () => {
      if (full && img.src !== full) img.src = full;
      else if (local && img.src !== local) img.src = local;
      else img.replaceWith(makePlaceholder(c));
    };
    cell.appendChild(img);
  } else {
    cell.appendChild(makePlaceholder(c));
  }

  cell.addEventListener("mouseenter", e => showTip(c, e));
  cell.addEventListener("mousemove",  e => moveTip(e));
  cell.addEventListener("mouseleave", hideTip);
  cell.addEventListener("click", () => openModal(c.Id));

  return cell;
}

function makePlaceholder(c) {
  const d = document.createElement("div");
  d.className = "ni";
  d.textContent = (c.Name||"?").slice(0,5);
  return d;
}

// ── tooltip ──────────────────────────────────────────────
const tip = document.getElementById("tip");
const tipImg  = document.getElementById("tip-img");
const tipName = document.getElementById("tip-name");
const tipStat = document.getElementById("tip-stats");
let tipTimer = null;

function showTip(c, e) {
  clearTimeout(tipTimer);
  tipName.textContent = c.Name;
  const t = cardTypes[c.Type]||"";
  const isMonster = c.Type < 20;
  tipStat.innerHTML = (isMonster ? `ATK ${c.Attack} / DEF ${c.Defense} &nbsp;` : "") + typeIcon(c.Type, 13) + escHtml(t);

  const src = fullUrl(c) || thumbUrl(c), local = localUrl(c);
  if (src || local) {
    tipImg.src = src || local; tipImg.style.display = "block";
    tipImg.onerror = () => {
      if (local && tipImg.src !== local) { tipImg.src = local; }
      else { tipImg.style.display = "none"; }
    };
  } else {
    tipImg.style.display = "none";
  }

  tip.style.display = "block";
  moveTip(e);
}

function moveTip(e) {
  const W = window.innerWidth, H = window.innerHeight;
  const tw = 240, th = tip.offsetHeight;
  let x = e.clientX + 14, y = e.clientY - 8;
  if (x + tw > W) x = e.clientX - tw - 10;
  if (y + th > H) y = H - th - 4;
  if (y < 0) y = 4;
  tip.style.left = x + "px";
  tip.style.top  = y + "px";
}

function hideTip() {
  tipTimer = setTimeout(() => { tip.style.display = "none"; }, 80);
}

// ── modal row tooltip ────────────────────────────────────
const mTip = document.getElementById("m-tip");
let mTipTimer = null, _expandT = null, _expandPartners = null, _expandRowId = null, _cwTypeFilter = null, _mfTypeFilter = null;
const _expandedIds = new Set();

function moveMTip(e) {
  const W = window.innerWidth, H = window.innerHeight;
  const tw = 300, th = mTip.offsetHeight;
  let x = e.clientX + 16, y = e.clientY - 8;
  if (x + tw > W) x = e.clientX - tw - 12;
  if (y + th > H) y = H - th - 4;
  if (y < 0) y = 4;
  mTip.style.left = x + "px";
  mTip.style.top  = y + "px";
}

function hideMTip() {
  clearTimeout(_expandT);
  _expandPartners = null;
  _expandRowId = null;
  mTipTimer = setTimeout(() => { mTip.style.display = "none"; }, 60);
}

// Global fallback handler for tooltip img elements (called from onerror attribute)
window._mImgFb = function(el, full, local) {
  if (full && el.src !== full) { el.src = full; }
  else if (local && el.src !== local) { el.src = local; }
  else { el.style.display = "none"; }
};

function mCardImg(card, w) {
  const thumb = thumbUrl(card), full = fullUrl(card), local = localUrl(card);
  const src = thumb || full || local;
  if (!src) return `<div style="width:${w}px;height:${w}px;background:#0a0a12;border-radius:2px;display:block;margin:0 auto 3px"></div>`;
  const f = escHtml(full || ""), l = escHtml(local || "");
  return `<img src="${escHtml(src)}" style="width:${w}px;height:auto;border-radius:2px;display:block;margin:0 auto 3px" onerror="_mImgFb(this,'${f}','${l}')">`;
}

function typeIcon(typeIdx, h) {
  const url = typeImages && typeImages[typeIdx];
  if (!url) return "";
  h = h || 14;
  return `<img src="${url}" style="width:${h}px;height:${h}px;vertical-align:middle;margin-right:3px;display:inline-block" title="${escHtml(cardTypes[typeIdx]||"")}">`;
}

function attrIcon(attrIdx, h) {
  const url = attributeImages && attributeImages[attrIdx];
  if (!url) return "";
  h = h || 14;
  const names = ["Dark","Earth","Fire","Light","Water","Wind","Divine"];
  return `<img src="${url}" style="width:${h}px;height:${h}px;vertical-align:middle;margin-right:3px;display:inline-block" title="${names[attrIdx]||""}">`;
}

function showMTipFusesInto(rc, partners, e) {
  clearTimeout(mTipTimer);
  const typeName = cardTypes[rc.Type] || "";
  const isM = rc.Type < 20;
  const fullyLoaded = _expandedIds.has(rc.Id);
  const shown = fullyLoaded ? partners : partners.slice(0, 8);
  mTip.innerHTML =
    `<div class="mt-header">${mCardImg(rc,80)}` +
    `<div class="mt-info">` +
    `<div class="mt-name">${escHtml(rc.Name)}</div>` +
    (isM ? `<div class="mt-stats" style="color:${atkColor(rc.Attack)}">ATK ${rc.Attack} / DEF ${rc.Defense}</div>` : "") +
    `<div class="mt-type">${typeIcon(rc.Type, 13)}${escHtml(typeName)}</div></div></div>` +
    `<div class="mt-materials-box"><span class="mt-materials-label">Materials</span><div class="mt-partners-row">` +
    shown.map(p =>
      `<div class="mt-partner-card">${mCardImg(p, 44)}<div class="mt-partner-name">${escHtml(p.Name)}</div></div>`
    ).join("") +
    (!fullyLoaded && partners.length > 8 ? `<div class="mt-partner-more">+${partners.length - 8}</div>` : "") +
    `</div></div>`;
  mTip.style.display = "block";
  moveMTip(e);
  if (!fullyLoaded && _expandRowId !== rc.Id) {
    clearTimeout(_expandT);
    _expandRowId = rc.Id;
    _expandPartners = partners.length > 8 ? partners : null;
    if (_expandPartners) _expandT = setTimeout(_expandMTipMaterials, 700);
  }
}

function _expandMTipMaterials() {
  if (!_expandPartners) return;
  const row = mTip.querySelector(".mt-partners-row");
  const more = mTip.querySelector(".mt-partner-more");
  if (!row) return;
  _expandPartners.slice(8).forEach(p => {
    const el = document.createElement("div");
    el.className = "mt-partner-card";
    el.innerHTML = `${mCardImg(p, 44)}<div class="mt-partner-name">${escHtml(p.Name)}</div>`;
    row.appendChild(el);
    _pf(thumbUrl(p)); _pf(fullUrl(p)); _pf(localUrl(p));
  });
  if (more) more.remove();
  _expandedIds.add(_expandRowId);
  _expandPartners = null;
}

function showMTipCombinesWith(partner, result, e) {
  clearTimeout(mTipTimer);
  const pType = cardTypes[partner.Type] || "";
  const rType = result ? (cardTypes[result.Type] || "") : "";
  mTip.innerHTML =
    `<div class="mt-pair">` +
    `<div class="mt-card-sm">${mCardImg(partner,66)}` +
    `<div class="mt-name-sm">${escHtml(partner.Name)}</div>` +
    `<div class="mt-sub-sm">${typeIcon(partner.Type,12)}${escHtml(pType)}${partner.Type < 20 ? " &middot; " + partner.Attack : ""}</div></div>` +
    `<span class="mt-sep">&rarr;</span>` +
    (result
      ? `<div class="mt-card-sm">${mCardImg(result,66)}` +
        `<div class="mt-name-sm">${escHtml(result.Name)}</div>` +
        `<div class="mt-sub-sm" style="color:${result.Type < 20 ? atkColor(result.Attack) : "#555"}">${typeIcon(result.Type,12)}${escHtml(rType)}${result.Type < 20 ? " &middot; " + result.Attack : ""}</div></div>`
      : "") +
    `</div>`;
  mTip.style.display = "block";
  moveMTip(e);
}

function showMTipEquip(card, e) {
  clearTimeout(mTipTimer);
  const typeName = cardTypes[card.Type] || "";
  const desc = (card.Description || "").replace(/\r\n|\r/g, " ").replace(/\s+/g, " ").trim();
  mTip.innerHTML =
    `<div class="mt-header">${mCardImg(card, 80)}` +
    `<div class="mt-info">` +
    `<div class="mt-name">${escHtml(card.Name)}</div>` +
    `<div class="mt-type" style="margin-top:3px">${typeIcon(card.Type, 13)}${escHtml(typeName)}</div>` +
    (desc ? `<div style="margin-top:5px;font-size:10px;color:#99aacc;line-height:1.55;font-style:italic">${escHtml(desc)}</div>` : "") +
    `</div></div>`;
  mTip.style.display = "block";
  moveMTip(e);
}

function showMTipMadeFrom(m1, m2, result, e) {
  clearTimeout(mTipTimer);
  mTip.innerHTML =
    `<div class="mt-pair">` +
    `<div class="mt-card-sm">${mCardImg(m1,60)}<div class="mt-name-sm">${escHtml(m1.Name)}</div></div>` +
    `<span class="mt-sep" style="font-size:14px">+</span>` +
    `<div class="mt-card-sm">${mCardImg(m2,60)}<div class="mt-name-sm">${escHtml(m2.Name)}</div></div>` +
    `<span class="mt-sep">&rarr;</span>` +
    `<div class="mt-card-sm">${mCardImg(result,60)}<div class="mt-name-sm">${escHtml(result.Name)}</div></div>` +
    `</div>`;
  mTip.style.display = "block";
  moveMTip(e);
}

// ── modal ─────────────────────────────────────────────────
const overlay = document.getElementById("overlay");
const mImg    = document.getElementById("m-img");
const mName   = document.getElementById("m-name");
const mStats  = document.getElementById("m-stats");
const mBody   = document.getElementById("m-body");

const mFilter           = document.getElementById("m-filter");
const mIncompatiblePanel = document.getElementById("m-right-panel");
const modalEl           = document.getElementById("modal");
let   modalCardId       = null;

document.getElementById("m-close").onclick = closeModal;
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });

function closeModal() {
  overlay.classList.remove("open");
  mFilter.value = "";
  modalCardId = null;
  _cwTypeFilter = null;
  _mfTypeFilter = null;
  applyPartnerFilter("");
}

function applyPartnerFilter(q) {
  const lq = q.toLowerCase().trim();

  // Remove previous combined incompat section
  const oldSec = mBody.querySelector(".incompat-all-sec");
  if (oldSec) oldSec.remove();

  if (!lq) {
    for (const row of mBody.querySelectorAll(".row-hidden")) row.classList.remove("row-hidden");
    for (const sec of mBody.querySelectorAll(".m-section")) sec.style.display = "";
    updateIncompatiblePanel("", 1);
    return;
  }

  let totalMatches = 0;
  const incompatItems = []; // {kind, card?, m1?, m2?}

  for (const row of mBody.querySelectorAll(".fi-group")) {
    const matches = (row.dataset.partners||"").includes(lq);
    row.classList.toggle("row-hidden", !matches);
    if (matches) { totalMatches++; }
    else {
      const card = byId[Number(row.dataset.cardId)];
      if (card) incompatItems.push({kind:"fi", card});
    }
  }

  for (const row of mBody.querySelectorAll(".eq-row")) {
    const matches = (row.dataset.name||"").includes(lq);
    row.classList.toggle("row-hidden", !matches);
    if (matches) { totalMatches++; }
    else {
      const card = byId[Number(row.dataset.cardId)];
      if (card) incompatItems.push({kind:"eq", card});
    }
  }

  for (const row of mBody.querySelectorAll(".cw-row")) {
    const textOk = (row.dataset.partners||"").includes(lq);
    const typeOk = _cwTypeFilter === null || Number(row.dataset.typeIdx) === _cwTypeFilter;
    const matches = textOk && typeOk;
    row.classList.toggle("row-hidden", !matches);
    if (matches) { totalMatches++; }
    else {
      const card = byId[Number(row.dataset.cardId)];
      if (card) incompatItems.push({kind:"cw", card});
    }
  }

  for (const row of mBody.querySelectorAll(".mf-row")) {
    const textOk = (row.dataset.materials||"").includes(lq);
    const typeOk = _mfTypeFilter === null ||
      (row.dataset.types||"").split("|").map(Number).includes(_mfTypeFilter);
    const matches = textOk && typeOk;
    row.classList.toggle("row-hidden", !matches);
    if (matches) { totalMatches++; }
    else {
      const m1 = byId[Number(row.dataset.cardId)];
      const m2 = byId[Number(row.dataset.card2Id)];
      if (m1 && m2) incompatItems.push({kind:"mf", m1, m2});
    }
  }

  // Hide sections whose rows are all hidden
  for (const sec of mBody.querySelectorAll(".m-section")) {
    const hasVisible = sec.querySelector(
      ".fi-group:not(.row-hidden),.cw-row:not(.row-hidden),.mf-row:not(.row-hidden),.eq-row:not(.row-hidden)"
    );
    sec.style.display = hasVisible ? "" : "none";
  }

  // Single combined incompat section at bottom
  if (incompatItems.length > 0) {
    const sec = document.createElement("div");
    sec.className = "m-section incompat-all-sec";

    const title = document.createElement("div");
    title.className = "m-section-title incompat-all-title";
    title.textContent = `✕ INCOMPATIBLE (${incompatItems.length})`;
    sec.appendChild(title);

    for (const item of incompatItems) {
      const row = document.createElement("div");
      row.className = "cw-row";

      if (item.kind === "mf") {
        const t1 = miniThumb(item.m1, "fi-thumb");
        t1.style.cssText = "width:36px;height:36px;flex-shrink:0";
        row.appendChild(t1);
        const n1 = document.createElement("div");
        n1.className = "mp-name";
        n1.textContent = item.m1.Name;
        row.appendChild(n1);
        const plus = document.createElement("span");
        plus.className = "plus";
        plus.textContent = "+";
        row.appendChild(plus);
        const t2 = miniThumb(item.m2, "fi-thumb");
        t2.style.cssText = "width:36px;height:36px;flex-shrink:0";
        row.appendChild(t2);
        const n2 = document.createElement("div");
        n2.className = "mp-name";
        n2.textContent = item.m2.Name;
        row.appendChild(n2);
        row.addEventListener("click", () => openModal(item.m1.Id));
      } else {
        const thumb = miniThumb(item.card, "fi-thumb");
        thumb.style.cssText = "width:36px;height:36px;flex-shrink:0";
        row.appendChild(thumb);
        const info = document.createElement("div");
        info.style.cssText = "flex:1;min-width:0";
        const name = document.createElement("div");
        name.className = "mp-name";
        name.textContent = item.card.Name;
        const sub = document.createElement("div");
        sub.className = "mp-type";
        sub.innerHTML = typeIcon(item.card.Type, 12) + escHtml(cardTypes[item.card.Type]||"") +
          (item.card.Type < 20 ? " · " + item.card.Attack : "");
        info.appendChild(name);
        info.appendChild(sub);
        row.appendChild(info);
        row.addEventListener("click", () => openModal(item.card.Id));
      }

      sec.appendChild(row);
    }

    mBody.appendChild(sec);
  }

  updateIncompatiblePanel(lq, totalMatches);
}

function updateIncompatiblePanel(lq, sectionMatches) {
  if (!lq) {
    mIncompatiblePanel.classList.remove("active");
    mIncompatiblePanel.innerHTML = "";
    modalEl.classList.remove("has-panel");
    return;
  }

  // Build set of all related card IDs (visible in any section)
  const partnerIds = new Set();
  if (modalCardId !== null) {
    if (fusionsList[modalCardId]) {
      for (const fu of fusionsList[modalCardId]) {
        partnerIds.add(fu.card);   // fusion partner (material 2)
        partnerIds.add(fu.result); // fusion result
      }
    }
    if (mat2Idx[modalCardId]) {
      for (const [mat1Id, resId] of mat2Idx[modalCardId]) {
        partnerIds.add(mat1Id); // fusion partner (material 1)
        partnerIds.add(resId);  // fusion result
      }
    }
    const pairs = resultsList[modalCardId] || [];
    for (const pair of pairs) {
      partnerIds.add(pair.card1);
      partnerIds.add(pair.card2);
    }
    for (const eid of (monster2Equips[modalCardId] || [])) partnerIds.add(eid);
    partnerIds.add(modalCardId);
  }

  // Cards matching query that are NOT related to current card
  const incompatible = card_db.filter(c => {
    if (partnerIds.has(c.Id)) return false;
    const typeName = (cardTypes[c.Type] || "").toLowerCase();
    return c.Name.toLowerCase().includes(lq) || typeName.includes(lq);
  }).sort((a, b) => (b.Attack || 0) - (a.Attack || 0)).slice(0, 50);

  if (!incompatible.length) {
    mIncompatiblePanel.classList.remove("active");
    mIncompatiblePanel.innerHTML = "";
    modalEl.classList.remove("has-panel");
    return;
  }

  mIncompatiblePanel.innerHTML = "";

  const titleEl = document.createElement("div");
  titleEl.id = "m-rp-title";
  titleEl.textContent = "INCOMPATIBLE CARDS (" + incompatible.length + (incompatible.length === 50 ? "+" : "") + ")";
  mIncompatiblePanel.appendChild(titleEl);

  for (const card of incompatible) {
    const row = document.createElement("div");
    row.className = "mp-row";

    const thumb = miniThumb(card, "fi-thumb");
    thumb.style.cssText = "width:42px;height:42px;flex-shrink:0";
    row.appendChild(thumb);

    const info = document.createElement("div");
    info.style.cssText = "flex:1;min-width:0";

    const name = document.createElement("div");
    name.className = "mp-name";
    name.textContent = card.Name;

    const type = document.createElement("div");
    type.className = "mp-type";
    const typeName = cardTypes[card.Type] || "";
    const isM = card.Type < 20;
    type.innerHTML = typeIcon(card.Type, 12) + escHtml(typeName) + (isM ? " · " + card.Attack : "");

    info.appendChild(name);
    info.appendChild(type);
    row.appendChild(info);

    row.addEventListener("click", () => openModal(card.Id));
    mIncompatiblePanel.appendChild(row);
  }

  mIncompatiblePanel.classList.add("active");
  modalEl.classList.add("has-panel");
}

mFilter.addEventListener("input", () => {
  applyPartnerFilter(mFilter.value.trim());
});

mFilter.addEventListener("keydown", e => {
  if (e.key === "Escape") { mFilter.blur(); return; }
  if (e.key !== "Enter") return;
  const visible = [...mBody.querySelectorAll(".fi-group:not(.fi-incompat),.cw-row:not(.cw-incompat),.mf-row:not(.mf-incompat)")];
  if (visible.length === 1 && visible[0].dataset.cardId) {
    e.preventDefault();
    openModal(Number(visible[0].dataset.cardId));
  }
});

// Global key capture → route printable chars to active search input
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length !== 1) return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  const target = overlay.classList.contains("open") ? mFilter : searchInput;
  target.focus();
  target.value += e.key;
  target.dispatchEvent(new Event("input"));
  e.preventDefault();
});

function openModal(cardId) {
  const c = byId[cardId];
  if (!c) return;

  mFilter.value = "";
  modalCardId = cardId;
  _cwTypeFilter = null;
  _mfTypeFilter = null;
  updateIncompatiblePanel("");

  // header
  const src = fullUrl(c), local = localUrl(c);
  if (src || local) {
    mImg.src = src || local; mImg.style.display = "block";
    mImg.onerror = () => {
      if (local && mImg.src !== local) { mImg.src = local; }
      else { mImg.style.display = "none"; }
    };
  } else mImg.style.display = "none";
  mName.textContent = c.Name;
  const t = cardTypes[c.Type] || "";
  const isM = c.Type < 20;
  const attrNames = {0:"Dark",1:"Earth",2:"Fire",3:"Light",4:"Water",5:"Wind",6:"Divine"};
  mStats.innerHTML =
    (isM ? `ATK <b style="color:${atkColor(c.Attack)}">${c.Attack}</b> &nbsp; DEF ${c.Defense}<br>` : "") +
    typeIcon(c.Type, 15) + escHtml(t) + (c.Attribute != null ? ` &middot; ${attrIcon(c.Attribute, 15)}${escHtml(attrNames[c.Attribute]||"")}` : "");

  const mLevelEl = document.getElementById("m-level");
  if (isM && c.Level) {
    mLevelEl.innerHTML = `<span style="color:#555;font-size:9px;letter-spacing:.5px">LV</span> ${"★".repeat(c.Level)}`;
  } else {
    mLevelEl.textContent = "";
  }

  const mGuardianEl = document.getElementById("m-guardian");
  if (isM && c.GuardianStarA != null && c.GuardianStarB != null) {
    mGuardianEl.innerHTML =
      `<span style="color:#445;font-size:9px">GUARDIAN</span> ` +
      `<span style="color:#9ab">${escHtml(starNames[c.GuardianStarA]||"")}</span>` +
      ` <span style="color:#334">/</span> ` +
      `<span style="color:#9ab">${escHtml(starNames[c.GuardianStarB]||"")}</span>`;
  } else {
    mGuardianEl.textContent = "";
  }

  const desc = (c.Description || "").replace(/\r\n|\r/g, "\n").replace(/[ \t]+/g, " ").trim();
  document.getElementById("m-desc").textContent = desc;

  mBody.innerHTML = "";
  for (const sec of [makeFusesIntoSection(c), makeEquipsWithSection(c), makeCombinesWithSection(c), makeMadeFromSection(c)]) {
    if (sec) mBody.appendChild(sec);
  }

  overlay.classList.add("open");
  overlay.scrollTop = 0;
}

// "Fuses Into": all fusions where this card is a material
function makeFusesIntoSection(c) {
  const sec = document.createElement("div");
  sec.className = "m-section";

  // Collect fusions as _card1 (fusionsList[c.Id]) and as _card2 (mat2Idx[c.Id])
  // Group by result
  const grouped = {}; // resultId -> [partnerId, ...]
  if (fusionsList[c.Id]) {
    for (const fu of fusionsList[c.Id]) {
      if (!grouped[fu.result]) grouped[fu.result] = [];
      grouped[fu.result].push(fu.card);
    }
  }
  if (mat2Idx[c.Id]) {
    for (const [mat1Id, resId] of mat2Idx[c.Id]) {
      if (!grouped[resId]) grouped[resId] = [];
      grouped[resId].push(mat1Id);
    }
  }

  const resultIds = Object.keys(grouped).map(Number);
  resultIds.sort((a,b) => (byId[b]?.Attack||0) - (byId[a]?.Attack||0));

  const title = document.createElement("div");
  title.className = "m-section-title";
  title.textContent = `⚔ FUSES INTO (${resultIds.length} results)`;
  sec.appendChild(title);

  if (resultIds.length === 0) {
    return null;
  }

  for (const resId of resultIds) {
    const rc = byId[resId];
    if (!rc) continue;
    const partners = grouped[resId].map(pid => byId[pid]).filter(Boolean);

    const row = document.createElement("div");
    row.className = "fi-group";
    row.dataset.partners = [rc.Name, ...partners.map(p => p.Name)].map(n => n.toLowerCase()).join("|");
    row.dataset.partnerIds = partners.map(p => p.Id).join("|");
    row.dataset.cardId = resId;

    // result image
    row.appendChild(miniThumb(rc));

    // result info
    const info = document.createElement("div");
    info.className = "fi-result";
    const rname = document.createElement("div");
    rname.className = "fi-result-name";
    const isM = rc.Type < 20;
    rname.innerHTML = `${escHtml(rc.Name)}<span class="fi-atk">${isM ? rc.Attack : ""}</span>`;
    const rsub = document.createElement("div");
    rsub.className = "fi-result-sub";
    rsub.innerHTML = typeIcon(rc.Type, 12) + escHtml(cardTypes[rc.Type] || "");
    const rpart = document.createElement("div");
    rpart.className = "fi-partners-box";
    const rpartLabel = document.createElement("span");
    rpartLabel.className = "fi-partners-label";
    rpartLabel.textContent = "Materials";
    rpart.appendChild(rpartLabel);
    const rpartText = document.createElement("span");
    rpartText.className = "fi-partners";
    if (partners.length <= 4) {
      rpartText.textContent = partners.map(p=>p.Name).join(", ");
    } else {
      rpartText.textContent = partners.slice(0,3).map(p=>p.Name).join(", ") +
        ` +${partners.length-3} more`;
    }
    rpart.appendChild(rpartText);
    info.appendChild(rname);
    info.appendChild(rsub);
    info.appendChild(rpart);

    row.appendChild(info);

    row.style.cursor = "pointer";
    row.addEventListener("mouseenter", e => showMTipFusesInto(rc, partners, e));
    row.addEventListener("mousemove",  moveMTip);
    row.addEventListener("mouseleave", hideMTip);
    row.addEventListener("click", () => openModal(resId));

    sec.appendChild(row);
  }

  return sec;
}

// "Combines With": all unique partner cards this card can fuse with, plus the fusion result
function makeCombinesWithSection(c) {
  const sec = document.createElement("div");
  sec.className = "m-section";

  // Build partner → resultId map (first-wins dedup)
  const partnerResult = {};
  if (fusionsList[c.Id]) {
    for (const fu of fusionsList[c.Id]) {
      if (!(fu.card in partnerResult)) partnerResult[fu.card] = fu.result;
    }
  }
  if (mat2Idx[c.Id]) {
    for (const [mat1Id, resId] of mat2Idx[c.Id]) {
      if (!(mat1Id in partnerResult)) partnerResult[mat1Id] = resId;
    }
  }

  const partners = Object.keys(partnerResult).map(id => byId[Number(id)]).filter(Boolean);
  partners.sort((a, b) =>
    (byId[partnerResult[b.Id]]?.Attack || 0) - (byId[partnerResult[a.Id]]?.Attack || 0));

  const title = document.createElement("div");
  title.className = "m-section-title teal";
  title.textContent = `⬡ COMBINES WITH (${partners.length} materials)`;
  sec.appendChild(title);

  if (partners.length === 0) {
    return null;
  }

  // Type compatibility chips — click to filter rows by type
  const typeCounts = {};
  for (const p of partners) {
    typeCounts[p.Type] = (typeCounts[p.Type] || 0) + 1;
  }
  const typesBar = document.createElement("div");
  typesBar.className = "cw-types";
  for (const [tidx, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    const t = cardTypes[tidx] || "Unknown";
    const color = TYPE_COLORS[t] || "#555";
    const chip = document.createElement("span");
    chip.className = "cw-type-chip";
    chip.dataset.typeIdx = tidx;
    chip.style.cssText = `color:${color};background:${color}22;border:1px solid ${color}55`;
    chip.innerHTML = typeIcon(Number(tidx), 13) + escHtml(t) + " " + count;
    chip.addEventListener("click", () => {
      const ti = Number(tidx);
      _cwTypeFilter = (_cwTypeFilter === ti) ? null : ti;
      for (const ch of typesBar.querySelectorAll(".cw-type-chip")) {
        ch.classList.toggle("dimmed", _cwTypeFilter !== null && Number(ch.dataset.typeIdx) !== _cwTypeFilter);
      }
      applyPartnerFilter(mFilter.value.trim());
    });
    typesBar.appendChild(chip);
  }
  sec.appendChild(typesBar);

  for (const p of partners) {
    const rc = byId[partnerResult[p.Id]];

    const row = document.createElement("div");
    row.className = "cw-row";
    row.dataset.partners = p.Name.toLowerCase();
    row.dataset.cardId = p.Id;
    row.dataset.typeIdx = p.Type;

    // Partner
    const pThumb = miniThumb(p, "fi-thumb");
    pThumb.style.cssText = "width:42px;height:42px;flex-shrink:0";
    row.appendChild(pThumb);

    const pInfo = document.createElement("div");
    pInfo.style.cssText = "flex:1;min-width:0";
    const pName = document.createElement("div");
    pName.className = "mp-name";
    pName.textContent = p.Name;
    const pSub = document.createElement("div");
    pSub.className = "mp-type";
    pSub.innerHTML = typeIcon(p.Type, 12) + escHtml(cardTypes[p.Type] || "") + (p.Type < 20 ? " \xb7 " + p.Attack : "");
    pInfo.appendChild(pName);
    pInfo.appendChild(pSub);
    row.appendChild(pInfo);

    // Arrow + result
    const arrow = document.createElement("span");
    arrow.className = "cw-arrow";
    arrow.textContent = "→";
    row.appendChild(arrow);

    if (rc) {
      const rThumb = miniThumb(rc, "fi-thumb");
      rThumb.style.cssText = "width:42px;height:42px;flex-shrink:0";
      row.appendChild(rThumb);

      const rInfo = document.createElement("div");
      rInfo.className = "cw-result-info";
      const rName = document.createElement("div");
      rName.className = "cw-result-name";
      rName.textContent = rc.Name;
      const rAtk = document.createElement("div");
      rAtk.className = "mp-type";
      if (rc.Type < 20) rAtk.innerHTML = `<span style="color:${atkColor(rc.Attack)}">${rc.Attack}</span>`;
      rInfo.appendChild(rName);
      rInfo.appendChild(rAtk);
      row.appendChild(rInfo);
    }

    row.addEventListener("mouseenter", e => showMTipCombinesWith(p, rc, e));
    row.addEventListener("mousemove",  moveMTip);
    row.addEventListener("mouseleave", hideMTip);
    row.addEventListener("click", () => openModal(p.Id));
    sec.appendChild(row);
  }

  return sec;
}

// "Equips With": equip spells compatible with this monster, or monsters this equip targets
function makeEquipsWithSection(c) {
  const sec = document.createElement("div");
  sec.className = "m-section";

  const isEquip = c.Type === 23;
  let cards = [];
  if (isEquip) {
    cards = (c.Equip || []).map(id => byId[id]).filter(Boolean);
    cards.sort((a, b) => (b.Attack || 0) - (a.Attack || 0));
  } else {
    const equipCards = (monster2Equips[c.Id] || []).map(id => byId[id]).filter(Boolean);
    const fieldCards = Object.entries(FIELD_BOOSTS)
      .filter(([, types]) => types.includes(c.Type))
      .map(([id]) => byId[Number(id)])
      .filter(Boolean);
    cards = [...equipCards, ...fieldCards];
    cards.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
  }

  const title = document.createElement("div");
  title.className = "m-section-title gold";
  title.textContent = isEquip
    ? `⚙ EQUIPS ONTO (${cards.length} monsters)`
    : `✦ COMPATIBLE SPELLS (${cards.length})`;
  sec.appendChild(title);

  if (cards.length === 0) {
    return null;
  }

  for (const card of cards) {
    const row = document.createElement("div");
    row.className = "eq-row";
    row.dataset.name = card.Name.toLowerCase();
    row.dataset.cardId = card.Id;

    const thumb = miniThumb(card, "fi-thumb");
    thumb.style.cssText = "width:42px;height:42px;flex-shrink:0";
    row.appendChild(thumb);

    const info = document.createElement("div");
    info.style.cssText = "flex:1;min-width:0";
    const name = document.createElement("div");
    name.className = "mp-name";
    name.textContent = card.Name;
    const sub = document.createElement("div");
    sub.className = "mp-type";
    const isM = card.Type < 20;
    sub.innerHTML = typeIcon(card.Type, 12) + escHtml(cardTypes[card.Type] || "") + (isM ? " · " + card.Attack : "");
    info.appendChild(name);
    info.appendChild(sub);
    row.appendChild(info);

    row.addEventListener("click", () => openModal(card.Id));
    row.addEventListener("mouseenter", e => card.Type >= 20 ? showMTipEquip(card, e) : showMTipCombinesWith(card, null, e));
    row.addEventListener("mousemove", moveMTip);
    row.addEventListener("mouseleave", hideMTip);

    sec.appendChild(row);
  }

  return sec;
}

// "Made From": all material pairs that produce this card
function makeMadeFromSection(c) {
  const sec = document.createElement("div");
  sec.className = "m-section";

  const title = document.createElement("div");
  title.className = "m-section-title orange";

  const pairs = resultsList[c.Id] || [];
  title.textContent = `✦ MADE FROM (${pairs.length} combinations)`;
  sec.appendChild(title);

  if (pairs.length === 0) {
    return null;
  }

  // Type chips — count types across both materials per pair (unique per pair)
  const typeCounts = {};
  for (const pair of pairs) {
    const m1 = byId[pair.card1], m2 = byId[pair.card2];
    if (!m1 || !m2) continue;
    for (const t of new Set([m1.Type, m2.Type])) {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  }
  const mfTypesBar = document.createElement("div");
  mfTypesBar.className = "cw-types";
  for (const [tidx, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    const t = cardTypes[tidx] || "Unknown";
    const color = TYPE_COLORS[t] || "#555";
    const chip = document.createElement("span");
    chip.className = "cw-type-chip";
    chip.dataset.typeIdx = tidx;
    chip.style.cssText = `color:${color};background:${color}22;border:1px solid ${color}55`;
    chip.innerHTML = typeIcon(Number(tidx), 13) + escHtml(t) + " " + count;
    chip.addEventListener("click", () => {
      const ti = Number(tidx);
      _mfTypeFilter = (_mfTypeFilter === ti) ? null : ti;
      for (const ch of mfTypesBar.querySelectorAll(".cw-type-chip")) {
        ch.classList.toggle("dimmed", _mfTypeFilter !== null && Number(ch.dataset.typeIdx) !== _mfTypeFilter);
      }
      applyPartnerFilter(mFilter.value.trim());
    });
    mfTypesBar.appendChild(chip);
  }
  sec.appendChild(mfTypesBar);

  for (const pair of pairs) {
    const m1 = byId[pair.card1], m2 = byId[pair.card2];
    if (!m1 || !m2) continue;

    const row = document.createElement("div");
    row.className = "mf-row";
    row.dataset.materials = [m1.Name, m2.Name].map(n => n.toLowerCase()).join("|");
    row.dataset.types = m1.Type + "|" + m2.Type;
    row.dataset.cardId = m1.Id;
    row.dataset.card2Id = m2.Id;

    row.appendChild(miniThumb(m1));

    const n1 = document.createElement("div");
    n1.className = "mf-name";
    n1.textContent = m1.Name;
    n1.style.cursor = "pointer";
    n1.addEventListener("click", () => openModal(m1.Id));
    row.appendChild(n1);

    const plus = document.createElement("span");
    plus.className = "plus";
    plus.textContent = "+";
    row.appendChild(plus);

    row.appendChild(miniThumb(m2));

    const n2 = document.createElement("div");
    n2.className = "mf-name";
    n2.textContent = m2.Name;
    n2.style.cursor = "pointer";
    n2.addEventListener("click", () => openModal(m2.Id));
    row.appendChild(n2);

    row.addEventListener("mouseenter", e => showMTipMadeFrom(m1, m2, c, e));
    row.addEventListener("mousemove",  moveMTip);
    row.addEventListener("mouseleave", hideMTip);

    sec.appendChild(row);
  }

  return sec;
}

// ── card search (all 722 cards) ───────────────────────────
const searchInput = document.getElementById("card-search");
const searchDrop  = document.getElementById("search-drop");
let dropActive = -1, dropItems = [], dropFiltered = [];

function initSearch() {
  const allNames = card_db.map(c => ({id: c.Id, name: c.Name}));

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    buildGrid(q);
    if (!q) { closeDrop(); return; }
    dropFiltered = allNames.filter(n => n.name.toLowerCase().includes(q)).slice(0, 20);
    if (dropFiltered.length === 1) { selectCard(dropFiltered[0].id); return; }
    renderDrop(dropFiltered);
  });

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Tab" && dropItems.length > 0) {
      e.preventDefault();
      const item = dropItems[dropActive] || dropItems[0];
      if (item) {
        const card = byId[Number(item.dataset.id)];
        if (card) { searchInput.value = card.Name; searchInput.dispatchEvent(new Event("input")); }
      }
      return;
    }
    if (!searchDrop.classList.contains("open")) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(dropActive + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(dropActive - 1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const item = dropItems[dropActive] || dropItems[0];
      if (item) selectCard(Number(item.dataset.id));
    }
    else if (e.key === "Escape") { closeDrop(); searchInput.blur(); }
  });

  searchInput.addEventListener("blur", () => {
    setTimeout(closeDrop, 150);
  });
}

function renderDrop(matches) {
  searchDrop.innerHTML = "";
  dropItems = [];
  dropActive = -1;
  if (!matches.length) { closeDrop(); return; }

  for (const m of matches) {
    const div = document.createElement("div");
    div.className = "sdrop-item";
    div.dataset.id = m.id;

    const card = byId[m.id];
    if (card) {
      div.appendChild(miniThumb(card, "sdrop-thumb"));
      const info = document.createElement("div");
      info.className = "sdrop-info";
      const nameEl = document.createElement("div");
      nameEl.className = "sdrop-name";
      nameEl.textContent = m.name;
      const sub = document.createElement("div");
      sub.className = "sdrop-sub";
      const isM = card.Type < 20;
      sub.innerHTML = typeIcon(card.Type, 11) + escHtml(cardTypes[card.Type] || "") + (isM ? " · " + card.Attack : "");
      info.appendChild(nameEl);
      info.appendChild(sub);
      div.appendChild(info);
    } else {
      div.textContent = m.name;
    }

    div.addEventListener("mousedown", e => { e.preventDefault(); selectCard(m.id); });
    searchDrop.appendChild(div);
    dropItems.push(div);
  }
  searchDrop.classList.add("open");
}

function setActive(idx) {
  dropActive = Math.max(-1, Math.min(dropItems.length - 1, idx));
  dropItems.forEach((el,i) => el.classList.toggle("active", i === dropActive));
  if (dropActive >= 0) dropItems[dropActive].scrollIntoView({block:"nearest"});
}

function selectCard(id) {
  closeDrop();
  searchInput.value = "";
  buildGrid();
  openModal(id);
  setTimeout(() => mFilter.focus(), 50);
}

function closeDrop() {
  searchDrop.classList.remove("open");
  searchDrop.innerHTML = "";
  dropItems = [];
  dropActive = -1;
}

// ── prefetch ─────────────────────────────────────────────
const _pfSeen = new Set();
function _pf(url) { if (url && !_pfSeen.has(url)) { _pfSeen.add(url); new Image().src = url; } }
function _pfCard(c) { if (!c) return; _pf(thumbUrl(c)); _pf(fullUrl(c)); _pf(localUrl(c)); }
function _pfCards(arr, max) { const n = Math.min(arr.length, max||60); for (let i=0;i<n;i++) _pfCard(arr[i]); }

let _pfT = null;

searchInput.addEventListener("input", () => {
  clearTimeout(_pfT);
  _pfT = setTimeout(() => {
    const lq = searchInput.value.trim().toLowerCase();
    if (!lq) return;
    _pfCards(card_db.filter(c => c.Name.toLowerCase().includes(lq)));
  }, 80);
});

mFilter.addEventListener("input", () => {
  clearTimeout(_pfT);
  _pfT = setTimeout(() => {
    if (modalCardId === null) return;
    const lq = mFilter.value.trim().toLowerCase();
    if (!lq) return;
    const seen = new Set(), toFetch = [];
    const add = c => { if (c && !seen.has(c.Id)) { seen.add(c.Id); toFetch.push(c); } };
    if (fusionsList[modalCardId]) {
      for (const fu of fusionsList[modalCardId]) {
        const rc = byId[fu.result], p = byId[fu.card];
        if ((rc?.Name||"").toLowerCase().includes(lq)
          || (cardTypes[rc?.Type]||"").toLowerCase().includes(lq)
          || (p?.Name||"").toLowerCase().includes(lq)) { add(rc); add(p); }
      }
    }
    if (mat2Idx[modalCardId]) {
      for (const [mat1Id, resId] of mat2Idx[modalCardId]) {
        const rc = byId[resId], p = byId[mat1Id];
        if ((rc?.Name||"").toLowerCase().includes(lq)
          || (p?.Name||"").toLowerCase().includes(lq)) { add(rc); add(p); }
      }
    }
    _pfCards(toFetch);
  }, 80);
});

document.getElementById("grid").addEventListener("mouseover", e => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  const c = byId[Number(cell.dataset.id)];
  if (c) { _pf(fullUrl(c)); _pf(localUrl(c)); }
});

mBody.addEventListener("mouseover", e => {
  const row = e.target.closest(".fi-group,.cw-row");
  if (!row) return;
  _pfCard(byId[Number(row.dataset.cardId)]);
  if (row.dataset.partnerIds)
    row.dataset.partnerIds.split("|").slice(0, 8).forEach(id => _pfCard(byId[Number(id)]));
});

// ── utils ─────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── init ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // scripts loaded synchronously before this runs
  buildIndices();
  document.getElementById("loading").remove();
  buildGrid();
  initSearch();
});
