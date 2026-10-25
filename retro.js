/* ==========================================================================
   retro.js — guestbook, hit counter, shoutbox, MAXAMP player, sparkles.
   Plain ES5-flavoured script, the way the old web intended. No build step.
   ========================================================================== */
(function () {
  "use strict";

  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  function el(id) { return document.getElementById(id); }
  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n, len) { n = String(n); while (n.length < len) n = "0" + n; return n; }

  /* ------------------------------------------------------------ counter -- */
  var SEED = 48213;
  var hits = store.get("ml_hits", SEED);
  hits += 1;
  store.set("ml_hits", hits);
  var odo = el("odo");
  if (odo) {
    var digits = pad(hits, 6).split("");
    odo.innerHTML = digits.map(function (d) { return "<b>" + d + "</b>"; }).join("");
  }
  var odoMini = el("odo-mini");
  if (odoMini) odoMini.textContent = pad(hits, 6);
  var odoFoot = el("odo-mini-foot");
  if (odoFoot) odoFoot.textContent = pad(hits, 6);

  /* --------------------------------------------------------- guestbook -- */
  var SEED_ENTRIES = [
    { n: "Karla_from_neocities", u: "https://neocities.org/", m: "hello from my site!! love the minecraft builds, the pont neuf one made me gasp. adding you to my links page <3", d: "2026-10-21", mood: "happy" },
    { n: "bte_francer", u: "", m: "salut ! passage depuis le serveur BTE, continue comme ca, tes tracages sont propres. signe mon guestbook aussi stp", d: "2026-10-18", mood: "chill" },
    { n: "xX_blockhead_Xx", u: "", m: "cool site!!! how long did the le mans build take?? my mom says i spend too much time on minecraft but whatever. nice cursor too", d: "2026-10-12", mood: "silly" },
    { n: "webmaster_doll", u: "", m: "found you through the minecraft builders webring ^^ your shrine pages are so cute. guestbook signed!", d: "2026-09-30", mood: "happy" },
    { n: "anon", u: "", m: "first!!!! (sorry, 5th. still cool though)", d: "2026-09-27", mood: "silly" }
  ];
  var MOODS = { happy: ":)", chill: ":|", silly: ":P", sad: ":(", wow: ":o" };

  function entries() { return store.get("ml_guestbook", SEED_ENTRIES); }

  function entryRow(e) {
    return '<tr><td class="who"><b>' + esc(e.n) + "</b><br><span class=\"mood\">" +
      (MOODS[e.mood] || ":)") + " " + esc(e.mood || "happy") + "</span><br><span class=\"tiny\">" + esc(e.d) +
      "</span>" + (e.u ? '<br><a href="' + esc(e.u) + '" rel="noopener">www</a>' : "") +
      '</td><td>' + esc(e.m).replace(/\n/g, "<br>") + "</td></tr>";
  }

  var gbList = el("gb-list");
  if (gbList) {
    var all = entries();
    gbList.innerHTML = all.map(entryRow).join("");
    var count = el("gb-count");
    if (count) count.textContent = all.length;
  }

  var gbForm = el("gb-form");
  if (gbForm) {
    gbForm.onsubmit = function (ev) {
      ev.preventDefault();
      var name = el("gb-name").value.trim() || "anon";
      var url = el("gb-url").value.trim();
      var msg = el("gb-msg").value.trim();
      if (!msg) { el("gb-thanks").textContent = el("gb-thanks").getAttribute("data-err") || "write something first!"; return; }
      var list = entries();
      list.unshift({
        n: name.slice(0, 40), u: url.slice(0, 120), m: msg.slice(0, 600),
        d: new Date().toISOString().slice(0, 10),
        mood: el("gb-mood").value
      });
      store.set("ml_guestbook", list);
      gbList.innerHTML = list.map(entryRow).join("");
      var c = el("gb-count"); if (c) c.textContent = list.length;
      gbForm.reset();
      var thanks = el("gb-thanks");
      thanks.textContent = thanks.getAttribute("data-ok") || "thanks for signing!!";
      thanks.className = "blink";
    };
  }

  /* ---------------------------------------------------------- shoutbox -- */
  var shoutList = el("shout-list");
  function renderShouts() {
    if (!shoutList) return;
    var list = entries().slice(0, 4);
    shoutList.innerHTML = list.map(function (e) {
      return '<div class="shout"><b>' + esc(e.n) + "</b> <i>" + esc(e.d.slice(5)) + "</i><br>" + esc(e.m.slice(0, 72)) + (e.m.length > 72 ? "…" : "") + "</div>";
    }).join("");
  }
  renderShouts();
  var shoutForm = el("shout-form");
  if (shoutForm) {
    shoutForm.onsubmit = function (ev) {
      ev.preventDefault();
      var msg = el("shout-msg").value.trim();
      if (!msg) return;
      var list = entries();
      list.unshift({ n: "you", u: "", m: msg.slice(0, 140), d: new Date().toISOString().slice(0, 10), mood: "happy" });
      store.set("ml_guestbook", list);
      shoutForm.reset();
      renderShouts();
    };
  }

  /* -------------------------------------------------- MAXAMP (winamp-alike) -- */
  var TRACKS = [
    "C418 - Sweden",
    "Lena Raine - Pigstep",
    "C418 - Mice on Venus",
    "Lena Raine - Chrysopoeia",
    "C418 - Wet Hands",
    "Samuel Aberg - Axolotl"
  ];
  var waTrack = el("wa-track");
  var waTime = el("wa-time");
  var waList = el("wa-list");
  var wa = el("winamp");
  if (waTrack) {
    var ti = store.get("ml_wa", 0) % TRACKS.length;
    var secs = 0;
    var playing = true;
    function paintTrack() {
      waTrack.textContent = pad(Math.floor(secs / 60), 2) + ":" + pad(secs % 60, 2) + "  " + TRACKS[ti];
      if (waList) {
        waList.innerHTML = TRACKS.map(function (t, i) {
          return '<li data-i="' + i + '" class="' + (i === ti ? "on" : "") + '">' + (i + 1) + ". " + esc(t) + "</li>";
        }).join("");
      }
    }
    paintTrack();
    window.setInterval(function () {
      if (!playing) return;
      secs += 1;
      if (secs > 143) { secs = 0; ti = (ti + 1) % TRACKS.length; store.set("ml_wa", ti); }
      paintTrack();
    }, 1000);
    if (waTime) {
      var clock = function () { waTime.textContent = new Date().toTimeString().slice(0, 8); };
      clock(); window.setInterval(clock, 1000);
    }
    var bind = function (id, fn) { var b = el(id); if (b) b.onclick = fn; };
    bind("wa-play", function () { playing = true; wa.classList.remove("paused"); });
    bind("wa-pause", function () { playing = false; wa.classList.add("paused"); });
    bind("wa-stop", function () { playing = false; secs = 0; wa.classList.add("paused"); paintTrack(); });
    if (waList) {
      waList.onclick = function (ev) {
        var li = ev.target.closest("li");
        if (!li) return;
        ti = parseInt(li.getAttribute("data-i"), 10);
        secs = 0; playing = true; wa.classList.remove("paused");
        store.set("ml_wa", ti);
        paintTrack();
      };
    }
  }

  /* ------------------------------------------------------------- search -- */
  var q = el("q");
  var resBox = el("search-results");
  if (q && resBox) {
    var items = Array.prototype.slice.call(resBox.getElementsByTagName("li"));
    var hitsLine = el("searchHits");
    var filter = function () {
      var needle = q.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (li) {
        var ok = !needle || li.getAttribute("data-text").indexOf(needle) !== -1;
        li.style.display = ok ? "" : "none";
        if (ok) shown += 1;
      });
      if (hitsLine) hitsLine.textContent = shown + " / " + items.length;
    };
    q.oninput = filter;
    if (q.form) q.form.onsubmit = function (ev) { ev.preventDefault(); filter(); };
    filter();
  }

  /* ------------------------------------------------------------ sparkles -- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    var last = 0;
    document.addEventListener("mousemove", function (ev) {
      var now = Date.now();
      if (now - last < 55) return;
      last = now;
      var s = document.createElement("i");
      s.className = "spark";
      s.style.left = ev.clientX + "px";
      s.style.top = ev.clientY + "px";
      document.body.appendChild(s);
      window.setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 700);
    }, { passive: true });
  }
})();
