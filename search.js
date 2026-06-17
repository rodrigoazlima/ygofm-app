// search.js — all search/filter logic (SOLID)

// ─────────────────────────────────────────────────────────────
// CardSearch — Single Responsibility: header search bar
// Dependency Inversion: accepts callbacks, data, helpers as DI
// ─────────────────────────────────────────────────────────────

class CardSearch {
  /**
   * @param {object} cfg
   * @param {HTMLInputElement} cfg.inputEl
   * @param {HTMLElement}      cfg.dropEl
   * @param {Array}            cfg.cards        card_db array
   * @param {object}           cfg.byId         id→card map
   * @param {object}           cfg.helpers      {miniThumb, typeIcon, escHtml, cardTypes}
   * @param {function}         cfg.onSelect     (cardId) → void
   * @param {function}         cfg.onFilter     (query) → void  — filters grid
   * @param {function}         [cfg.onInput]    (query) → void  — for prefetch
   */
  constructor({ inputEl, dropEl, cards, byId, helpers, onSelect, onFilter, onInput }) {
    this._input   = inputEl;
    this._drop    = dropEl;
    this._byId    = byId;
    this._helpers = helpers;
    this._onSelect = onSelect;
    this._onFilter = onFilter;
    this._onInput  = onInput || (() => {});
    this._items    = [];
    this._active   = -1;
    this._names    = cards.map(c => ({ id: c.Id, name: c.Name }));
    this._attach();
  }

  get inputEl() { return this._input; }

  _attach() {
    this._input.addEventListener("input", () => {
      const q = this._input.value.trim().toLowerCase();
      this._onFilter(q);
      this._onInput(q);
      if (!q) { this._close(); return; }
      const filtered = this._names
        .filter(n => n.name.toLowerCase().includes(q))
        .slice(0, 20);
      if (filtered.length === 1) { this._select(filtered[0].id); return; }
      this._renderDrop(filtered);
    });

    this._input.addEventListener("keydown", e => {
      if (e.key === "Tab" && this._items.length > 0) {
        e.preventDefault();
        const item = this._items[this._active] || this._items[0];
        if (item) {
          const card = this._byId[Number(item.dataset.id)];
          if (card) { this._input.value = card.Name; this._input.dispatchEvent(new Event("input")); }
        }
        return;
      }
      if (!this._drop.classList.contains("open")) return;
      if (e.key === "ArrowDown")  { e.preventDefault(); this._setActive(this._active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); this._setActive(this._active - 1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const item = this._items[this._active] || this._items[0];
        if (item) this._select(Number(item.dataset.id));
      } else if (e.key === "Escape") { this._close(); this._input.blur(); }
    });

    this._input.addEventListener("blur", () => setTimeout(() => this._close(), 150));
  }

  _renderDrop(matches) {
    this._drop.innerHTML = "";
    this._items  = [];
    this._active = -1;
    if (!matches.length) { this._close(); return; }
    for (const m of matches) {
      const card = this._byId[m.id];
      if (!card) continue;
      const div = this._buildItem(card, m.name);
      div.addEventListener("mousedown", e => { e.preventDefault(); this._select(m.id); });
      this._drop.appendChild(div);
      this._items.push(div);
    }
    this._drop.classList.add("open");
  }

  _buildItem(card, label) {
    const { miniThumb, typeIcon, escHtml, cardTypes } = this._helpers;
    const div = document.createElement("div");
    div.className = "sdrop-item";
    div.dataset.id = card.Id;
    div.appendChild(miniThumb(card, "sdrop-thumb"));
    const info = document.createElement("div");
    info.className = "sdrop-info";
    const nameEl = document.createElement("div");
    nameEl.className = "sdrop-name";
    nameEl.textContent = label;
    const sub = document.createElement("div");
    sub.className = "sdrop-sub";
    sub.innerHTML = typeIcon(card.Type, 11) + escHtml(cardTypes[card.Type] || "") +
      (card.Type < 20 ? " · " + card.Attack : "");
    info.appendChild(nameEl);
    info.appendChild(sub);
    div.appendChild(info);
    return div;
  }

  _setActive(idx) {
    this._active = Math.max(-1, Math.min(this._items.length - 1, idx));
    this._items.forEach((el, i) => el.classList.toggle("active", i === this._active));
    if (this._active >= 0) this._items[this._active].scrollIntoView({ block: "nearest" });
  }

  _select(id) {
    this._close();
    this._input.value = "";
    this._onFilter("");
    this._onSelect(id);
  }

  _close() {
    this._drop.classList.remove("open");
    this._drop.innerHTML = "";
    this._items  = [];
    this._active = -1;
  }
}

// ─────────────────────────────────────────────────────────────
// ModalFilter — Single Responsibility: modal partner/material search
// Open/Closed: new row types handled by extending _rowSelectors
// Dependency Inversion: all data/helpers injected via constructor
// ─────────────────────────────────────────────────────────────

class ModalFilter {
  /**
   * @param {object} cfg
   * @param {HTMLInputElement} cfg.filterEl
   * @param {HTMLElement}      cfg.bodyEl
   * @param {HTMLElement}      cfg.panelEl        right panel
   * @param {HTMLElement}      cfg.modalEl
   * @param {Array}            cfg.cards          full card_db
   * @param {object}           cfg.byId
   * @param {Array}            cfg.fusionsList
   * @param {object}           cfg.mat2Idx
   * @param {object}           cfg.resultsList
   * @param {object}           cfg.monster2Equips
   * @param {object}           cfg.FIELD_BOOSTS
   * @param {object}           cfg.cardTypes
   * @param {object}           cfg.helpers        {miniThumb, typeIcon, escHtml, atkColor}
   * @param {function}         cfg.onOpenCard     (cardId) → void
   */
  constructor({ filterEl, bodyEl, panelEl, modalEl,
                cards, byId, fusionsList, mat2Idx, resultsList,
                monster2Equips, FIELD_BOOSTS, cardTypes, helpers, onOpenCard }) {
    this._filter          = filterEl;
    this._body            = bodyEl;
    this._panel           = panelEl;
    this._modal           = modalEl;
    this._cards           = cards;
    this._byId            = byId;
    this._fusionsList     = fusionsList;
    this._mat2Idx         = mat2Idx;
    this._resultsList     = resultsList;
    this._monster2Equips  = monster2Equips;
    this._FIELD_BOOSTS    = FIELD_BOOSTS;
    this._cardTypes       = cardTypes;
    this._helpers         = helpers;
    this._onOpenCard      = onOpenCard;
    this._cardId          = null;
    this._cwTypeFilter    = null;
    this._mfTypeFilter    = null;
    this._attach();
  }

  get filterEl() { return this._filter; }

  // ── public API ──────────────────────────────────────────────

  /** Call when opening a new card in the modal */
  setCard(cardId) {
    this._cardId       = cardId;
    this._cwTypeFilter = null;
    this._mfTypeFilter = null;
  }

  /** Toggle type-chip filter for COMBINES WITH or MADE FROM section */
  toggleTypeFilter(section, typeIdx) {
    if (section === "cw") this._cwTypeFilter = this._cwTypeFilter === typeIdx ? null : typeIdx;
    if (section === "mf") this._mfTypeFilter = this._mfTypeFilter === typeIdx ? null : typeIdx;
    this.apply(this._filter.value.trim());
  }

  getCwTypeFilter() { return this._cwTypeFilter; }
  getMfTypeFilter() { return this._mfTypeFilter; }

  /** Clear filter and reset state */
  reset() {
    this._filter.value = "";
    this._cardId       = null;
    this._cwTypeFilter = null;
    this._mfTypeFilter = null;
    this.apply("");
  }

  /** Main filter — call with current query string */
  apply(q) {
    const lq = q.toLowerCase().trim();

    // Remove previous derived section
    const old = this._body.querySelector(".incompat-all-sec");
    if (old) old.remove();

    if (!lq) {
      for (const row of this._body.querySelectorAll(".row-hidden")) row.classList.remove("row-hidden");
      for (const sec of this._body.querySelectorAll(".m-section")) sec.style.display = "";
      this._updatePanel("");
      return;
    }

    let totalMatches   = 0;
    const otherPartners = [];

    // fi-groups and eq-rows: visibility only — not in "other partners" list
    for (const row of this._body.querySelectorAll(".fi-group")) {
      const matches = (row.dataset.partners || "").includes(lq);
      row.classList.toggle("row-hidden", !matches);
      if (matches) totalMatches++;
    }

    for (const row of this._body.querySelectorAll(".eq-row")) {
      const matches = (row.dataset.name || "").includes(lq);
      row.classList.toggle("row-hidden", !matches);
      if (matches) totalMatches++;
    }

    // cw-rows: filter + collect non-matches for "other partners" section
    for (const row of this._body.querySelectorAll(".cw-row")) {
      const textOk  = (row.dataset.partners || "").includes(lq);
      const typeOk  = this._cwTypeFilter === null || Number(row.dataset.typeIdx) === this._cwTypeFilter;
      const matches = textOk && typeOk;
      row.classList.toggle("row-hidden", !matches);
      if (matches) { totalMatches++; }
      else {
        const card = this._byId[Number(row.dataset.cardId)];
        if (card) otherPartners.push(card);
      }
    }

    for (const row of this._body.querySelectorAll(".mf-row")) {
      const textOk  = (row.dataset.materials || "").includes(lq);
      const typeOk  = this._mfTypeFilter === null ||
        (row.dataset.types || "").split("|").map(Number).includes(this._mfTypeFilter);
      const matches = textOk && typeOk;
      row.classList.toggle("row-hidden", !matches);
      if (matches) totalMatches++;
    }

    // Hide sections whose content rows are all hidden
    for (const sec of this._body.querySelectorAll(".m-section")) {
      const hasVisible = sec.querySelector(
        ".fi-group:not(.row-hidden),.cw-row:not(.row-hidden),.mf-row:not(.row-hidden),.eq-row:not(.row-hidden)"
      );
      sec.style.display = hasVisible ? "" : "none";
    }

    // "Other partners" only when at least one section already has matches —
    // avoids flooding the view with noise when NO section matches at all
    if (otherPartners.length > 0 && totalMatches > 0) {
      this._body.appendChild(this._buildOtherPartnersSection(otherPartners));
    }

    this._updatePanel(lq);
  }

  // ── private ─────────────────────────────────────────────────

  _buildOtherPartnersSection(cards) {
    const { miniThumb, typeIcon, escHtml } = this._helpers;
    const sec = document.createElement("div");
    sec.className = "m-section incompat-all-sec";

    const title = document.createElement("div");
    title.className = "m-section-title incompat-all-title";
    title.textContent = `⬡ OTHER PARTNERS (${cards.length})`;
    sec.appendChild(title);

    for (const card of cards) {
      const row = document.createElement("div");
      row.className = "cw-row";

      const thumb = miniThumb(card, "fi-thumb");
      thumb.style.cssText = "width:36px;height:36px;flex-shrink:0";
      row.appendChild(thumb);

      const info = document.createElement("div");
      info.style.cssText = "flex:1;min-width:0";
      const name = document.createElement("div");
      name.className = "mp-name";
      name.textContent = card.Name;
      const sub = document.createElement("div");
      sub.className = "mp-type";
      sub.innerHTML = typeIcon(card.Type, 12) +
        escHtml(this._cardTypes[card.Type] || "") +
        (card.Type < 20 ? " · " + card.Attack : "");
      info.appendChild(name);
      info.appendChild(sub);
      row.appendChild(info);
      row.addEventListener("click", () => this._onOpenCard(card.Id));
      sec.appendChild(row);
    }

    return sec;
  }

  _buildRelatedIds() {
    const ids    = new Set();
    const cardId = this._cardId;
    if (cardId === null) return ids;
    const c = this._byId[cardId];

    if (this._fusionsList[cardId]) {
      for (const fu of this._fusionsList[cardId]) { ids.add(fu.card); ids.add(fu.result); }
    }
    if (this._mat2Idx[cardId]) {
      for (const [m1, res] of this._mat2Idx[cardId]) { ids.add(m1); ids.add(res); }
    }
    for (const pair of (this._resultsList[cardId] || [])) {
      ids.add(pair.card1);
      ids.add(pair.card2);
    }
    for (const eid of (this._monster2Equips[cardId] || [])) ids.add(eid);

    if (c) {
      for (const [fieldId, types] of Object.entries(this._FIELD_BOOSTS)) {
        if (types.includes(c.Type)) ids.add(Number(fieldId));
      }
      if (c.Type === 23 && c.Equip) {
        for (const mid of c.Equip) ids.add(mid);
      }
    }
    ids.add(cardId);
    return ids;
  }

  _updatePanel(lq) {
    if (!lq) {
      this._panel.classList.remove("active");
      this._panel.innerHTML = "";
      this._modal.classList.remove("has-panel");
      return;
    }

    const { miniThumb, typeIcon, escHtml } = this._helpers;
    const relatedIds = this._buildRelatedIds();

    const unrelated = this._cards.filter(c => {
      if (relatedIds.has(c.Id)) return false;
      const typeName = (this._cardTypes[c.Type] || "").toLowerCase();
      return c.Name.toLowerCase().includes(lq) || typeName.includes(lq);
    }).sort((a, b) => (b.Attack || 0) - (a.Attack || 0)).slice(0, 50);

    if (!unrelated.length) {
      this._panel.classList.remove("active");
      this._panel.innerHTML = "";
      this._modal.classList.remove("has-panel");
      return;
    }

    this._panel.innerHTML = "";
    const titleEl = document.createElement("div");
    titleEl.id = "m-rp-title";
    const curName = this._cardId !== null && this._byId[this._cardId]
      ? this._byId[this._cardId].Name : "this card";
    titleEl.textContent =
      `NO FUSION WITH ${curName.toUpperCase()} ` +
      `(${unrelated.length}${unrelated.length === 50 ? "+" : ""})`;
    this._panel.appendChild(titleEl);

    for (const card of unrelated) {
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
      type.innerHTML = typeIcon(card.Type, 12) +
        escHtml(this._cardTypes[card.Type] || "") +
        (card.Type < 20 ? " · " + card.Attack : "");
      info.appendChild(name);
      info.appendChild(type);
      row.appendChild(info);
      row.addEventListener("click", () => this._onOpenCard(card.Id));
      this._panel.appendChild(row);
    }

    this._panel.classList.add("active");
    this._modal.classList.add("has-panel");
  }

  _attach() {
    this._filter.addEventListener("input", () => this.apply(this._filter.value.trim()));
    this._filter.addEventListener("keydown", e => {
      if (e.key === "Escape") { this._filter.blur(); return; }
      if (e.key !== "Enter") return;
      const visible = [...this._body.querySelectorAll(
        ".fi-group:not(.row-hidden),.cw-row:not(.row-hidden),.mf-row:not(.row-hidden)"
      )];
      if (visible.length === 1 && visible[0].dataset.cardId) {
        e.preventDefault();
        this._onOpenCard(Number(visible[0].dataset.cardId));
      }
    });
  }
}
