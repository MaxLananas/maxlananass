/* ==========================================================================
   retro.js — hit counter, block of the day, MAXAMP (a real chiptune radio
   synthesized with WebAudio), search filter, sparkles. No mp3, no server,
   no framework: just oscillators doing their best in your browser.
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
  var hits = store.get("ml_hits", 48213) + 1;
  store.set("ml_hits", hits);
  var odo = el("odo");
  if (odo) odo.innerHTML = pad(hits, 6).split("").map(function (d) { return "<b>" + d + "</b>"; }).join("");
  var mini = el("odo-mini"); if (mini) mini.textContent = pad(hits, 6);
  var miniFoot = el("odo-mini-foot"); if (miniFoot) miniFoot.textContent = pad(hits, 6);

  /* ---------------------------------------------------- block of the day -- */
  var PALETTES = [
    { name: "sunset terracotta", blocks: [["#9e5b40", "orange terracotta"], ["#c07a52", "terracotta"], ["#e3a06b", "smooth sandstone"], ["#f2c185", "sandstone"], ["#7a4632", "red sand"], ["#5b3a2e", "packed mud"]] },
    { name: "ocean gradient", blocks: [["#0b2838", "deep slate"], ["#1b4f72", "blue concrete"], ["#2e86c1", "light blue wool"], ["#7fb3d5", "ice"], ["#aed6f1", "packed ice"], ["#d6eaf8", "snow block"]] },
    { name: "creeper greens", blocks: [["#0e4d0e", "dark oak leaves"], ["#1f6b1f", "mossy cobble"], ["#2e8b2e", "lime wool"], ["#3f9e3f", "creeper head"], ["#59b559", "lime concrete"], ["#79d079", "slime block"]] },
    { name: "nether commute", blocks: [["#2b1a1a", "blackstone"], ["#6b1d1d", "nether bricks"], ["#a33b3b", "red nether bricks"], ["#d46a6a", "crimson planks"], ["#8c4a2f", "soul sand"], ["#e8b04b", "glowstone"]] },
    { name: "ender midnight", blocks: [["#12081f", "void"], ["#2a1548", "obsidian"], ["#4b2a7b", "purpur"], ["#7a4fb0", "chorus flower"], ["#b48ce0", "end stone bricks"], ["#e0d0ff", "end rod glow"]] },
    { name: "wool pastels", blocks: [["#f7d6e0", "pink wool"], ["#ffe8c9", "peach wool"], ["#fff6b0", "butter wool"], ["#d6f5d6", "mint wool"], ["#c9e8ff", "sky wool"], ["#e6d6ff", "lilac wool"]] }
  ];
  var blockBox = el("block-day");
  if (blockBox) {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var day = Math.floor((now - start) / 86400000);
    var pal = PALETTES[day % PALETTES.length];
    blockBox.innerHTML = '<div class="sw-name">' + esc(pal.name) + ' <span class="newflag blink">#' + pad(day % PALETTES.length + 1, 2) + "</span></div>" +
      pal.blocks.map(function (b) {
        return '<span class="sw" style="background:' + b[0] + '" title="' + esc(b[1]) + '"></span>';
      }).join("") +
      '<div class="swl">' + pal.blocks.map(function (b) { return esc(b[1]); }).join(" · ") + "</div>";
  }

  /* ============================================== MAXAMP — chiptune radio -- */
  // Six original loops, scheduled note by note with WebAudio oscillators.
  var TRACKS = [
    { title: "corsica coast (chip mix)", bpm: 96, wave: "square", len: 12,
      lead: ["a4 _ c5 _ e5 _ c5 _ a4 _ c5 _ e5 _ d5 _", "f4 _ a4 _ c5 _ a4 _ f4 _ a4 _ c5 _ a4 _", "c5 _ e5 _ g5 _ e5 _ c5 _ e5 _ g5 _ e5 _", "g4 _ b4 _ d5 _ b4 _ g4 _ b4 _ d5 _ b4 _"],
      bass: ["a2 _ _ _ a2 _ _ _ a2 _ _ _ a2 _ _ _", "f2 _ _ _ f2 _ _ _ f2 _ _ _ f2 _ _ _", "c3 _ _ _ c3 _ _ _ c3 _ _ _ c3 _ _ _", "g2 _ _ _ g2 _ _ _ g2 _ _ _ g2 _ _ _"],
      drum: ["K _ h _ S _ h _ K _ h _ S _ h _", "K _ h _ S _ h _ K _ h _ S _ h _", "K _ h _ S _ h _ K _ h _ S _ h _", "K _ h _ S _ h _ K _ h _ S S S S"] },
    { title: "pont-neuf blues", bpm: 84, wave: "square", len: 12,
      lead: ["e4 _ g4 _ a4 _ bb4 _ a4 _ g4 _ e4 _ d4 _", "e4 _ g4 _ a4 _ c5 _ a4 _ g4 _ e4 _ _ _", "d4 _ f4 _ g4 _ a4 _ g4 _ f4 _ d4 _ c4 _", "d4 _ f4 _ g4 _ bb4 _ a4 _ _ _ g4 _ _ _"],
      bass: ["e2 _ e2 _ g2 _ a2 _ bb2 _ b2 _ a2 _ g2 _", "e2 _ e2 _ g2 _ a2 _ b2 _ _ _ b2 _ _ _", "d2 _ d2 _ f2 _ g2 _ a2 _ bb2 _ a2 _ g2 _", "d2 _ d2 _ f2 _ g2 _ a2 _ _ _ a2 _ _ _"],
      drum: ["K _ _ _ h _ S _ _ _ h _ K _ h _", "K _ _ _ h _ S _ _ _ h _ S S S S"] },
    { title: "redstone boogie", bpm: 148, wave: "square", len: 10,
      lead: ["e4 e4 _ e4 g4 _ e4 _ a4 _ g4 _ e4 d4 e4 _", "e4 e4 _ e4 g4 _ a4 _ b4 _ a4 _ g4 _ e4 _", "d4 d4 _ d4 f4 _ d4 _ g4 _ f4 _ d4 c4 d4 _", "b3 _ d4 _ e4 _ g4 _ a4 _ b4 _ a4 g4 f4 e4"],
      bass: ["e2 _ e2 _ e2 _ e2 _ e2 _ e2 _ e2 _ e2 _", "e2 _ e2 _ e2 _ e2 _ e2 _ e2 _ e2 _ e2 _", "d2 _ d2 _ d2 _ d2 _ d2 _ d2 _ d2 _ d2 _", "b1 _ b1 _ d2 _ d2 _ e2 _ e2 _ e2 _ e2 _"],
      drum: ["K _ h _ S _ h _ K _ h _ S _ h _", "K _ h _ S _ h _ K _ K _ S S S S"] },
    { title: "creeper lullaby", bpm: 66, wave: "triangle", len: 10,
      lead: ["e5 _ _ _ _ _ _ _ b4 _ _ _ _ _ _ _", "c5 _ _ _ _ _ _ _ b4 _ _ _ _ _ _ _", "a4 _ _ _ _ _ _ _ g4 _ _ _ _ _ _ _", "a4 _ _ _ _ _ _ _ e4 _ _ _ _ _ _ _"],
      bass: ["a2 _ _ _ _ _ _ _ e3 _ _ _ _ _ _ _", "f2 _ _ _ _ _ _ _ c3 _ _ _ _ _ _ _", "d2 _ _ _ _ _ _ _ a2 _ _ _ _ _ _ _", "a2 _ _ _ _ _ _ _ e3 _ _ _ _ _ _ _"],
      drum: ["K _ _ _ _ _ _ _ h _ _ _ _ _ _ _", "K _ _ _ _ _ _ _ h _ _ _ S _ _ _"] },
    { title: "shader sunset", bpm: 80, wave: "square", len: 12,
      lead: ["f4 a4 c5 f5 c5 a4 f4 a4 c5 f5 c5 a4 f4 a4 c5 _", "d4 f4 a4 d5 a4 f4 d4 f4 a4 d5 a4 f4 d4 f4 a4 _", "c4 e4 g4 c5 g4 e4 c4 e4 g4 c5 g4 e4 c4 e4 g4 _", "a3 c4 e4 a4 e4 c4 a3 c4 e4 a4 e4 c4 a3 c4 e4 _"],
      bass: ["f2 _ _ _ _ _ _ _ f2 _ _ _ _ _ _ _", "d2 _ _ _ _ _ _ _ d2 _ _ _ _ _ _ _", "c2 _ _ _ _ _ _ _ c2 _ _ _ _ _ _ _", "a1 _ _ _ _ _ _ _ a1 _ _ _ _ _ _ _"],
      drum: ["K _ _ _ h _ _ _ S _ _ _ h _ _ _", "K _ _ _ h _ _ _ S _ _ _ h _ h _"] },
    { title: "dial-up dreams", bpm: 124, wave: "square", len: 10,
      lead: ["c5 _ c5 _ _ _ g5 _ _ _ f5 _ e5 _ d5 _", "_ _ c5 _ _ _ g5 _ _ _ a5 _ g5 _ f5 _", "a4 _ a4 _ _ _ e5 _ _ _ d5 _ c5 _ b4 _", "_ _ _ _ c6 _ _ _ _ _ _ _ g5 f5 e5 _"],
      bass: ["c2 _ c2 _ c2 _ c2 _ g2 _ g2 _ g2 _ g2 _", "a1 _ a1 _ a1 _ a1 _ e2 _ e2 _ e2 _ e2 _", "f2 _ f2 _ f2 _ f2 _ c3 _ c3 _ c3 _ c3 _", "g2 _ g2 _ g2 _ g2 _ g2 _ g2 _ g2 _ g2 _"],
      drum: ["K S h S K S h S K S h S K S h S", "K S h S K S h S K S h S S S S S"] }
  ];
  var SEMI = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function freq(token) {
    var m = /^([a-g])([#b]?)(\d)$/.exec(token);
    if (!m) return 0;
    var semi = SEMI[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
    return 440 * Math.pow(2, (semi - 9) / 12 + (parseInt(m[3], 10) - 4));
  }

  var AMP = {
    ctx: null, master: null, analyser: null, noise: null,
    track: store.get("ml_wa", 0) % TRACKS.length,
    step: 0, bar: 0, nextTime: 0, timer: null, playing: false, elapsed: 0, clock: null,
    ensure: function () {
      if (this.ctx) return this.ctx;
      var AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      var len = this.ctx.sampleRate * 0.5;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      var data = this.noise.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return this.ctx;
    },
    voice: function (type, f, t, dur, gain) {
      var o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
    },
    drum: function (kind, t) {
      var g, src;
      if (kind === "K") {
        var o = this.ctx.createOscillator();
        g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        g.gain.setValueAtTime(0.55, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + 0.16);
      } else {
        src = this.ctx.createBufferSource();
        src.buffer = this.noise;
        var f = this.ctx.createBiquadFilter();
        f.type = kind === "S" ? "bandpass" : "highpass";
        f.frequency.value = kind === "S" ? 1800 : 6500;
        g = this.ctx.createGain();
        g.gain.setValueAtTime(kind === "S" ? 0.32 : 0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + (kind === "S" ? 0.13 : 0.045));
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start(t); src.stop(t + 0.16);
      }
    },
    scheduleStep: function () {
      var tr = TRACKS[this.track];
      var t = this.nextTime;
      var leadTok = tr.lead[this.bar % tr.lead.length].split(" ")[this.step];
      var bassTok = tr.bass[this.bar % tr.bass.length].split(" ")[this.step];
      var drumTok = tr.drum[this.bar % tr.drum.length].split(" ")[this.step];
      var lf = freq(leadTok || "_");
      if (lf) this.voice(tr.wave, lf, t, 0.24, 0.16);
      var bf = freq(bassTok || "_");
      if (bf) this.voice("triangle", bf, t, 0.3, 0.24);
      if (drumTok && drumTok !== "_") this.drum(drumTok, t);
      this.step += 1;
      if (this.step >= 16) {
        this.step = 0;
        this.bar += 1;
        if (this.bar >= tr.len) { this.bar = 0; this.track = (this.track + 1) % TRACKS.length; store.set("ml_wa", this.track); this.paintList(); }
      }
    },
    pump: function () {
      var amp = this;
      var stepDur = 60 / TRACKS[this.track].bpm / 4;
      while (amp.nextTime < amp.ctx.currentTime + 0.15) {
        amp.scheduleStep();
        amp.nextTime += stepDur;
      }
    },
    play: function () {
      var c = this.ensure();
      if (c.state === "suspended") c.resume();
      if (!this.playing) {
        this.playing = true;
        this.nextTime = c.currentTime + 0.06;
        var amp = this;
        this.timer = window.setInterval(function () { amp.pump(); }, 30);
        this.clock = window.setInterval(function () { amp.elapsed += 1; amp.paintLcd(); }, 1000);
      }
      this.paintList();
    },
    pause: function () {
      this.playing = false;
      if (this.timer) { window.clearInterval(this.timer); this.timer = null; }
      if (this.clock) { window.clearInterval(this.clock); this.clock = null; }
      if (this.ctx) this.ctx.suspend();
    },
    stop: function () {
      this.pause();
      this.step = 0; this.bar = 0; this.elapsed = 0;
      this.paintLcd();
    },
    select: function (i) {
      var was = this.playing;
      this.pause();
      this.track = i; this.step = 0; this.bar = 0; this.elapsed = 0;
      store.set("ml_wa", i);
      if (this.ctx) this.ctx.resume();
      this.paintLcd(); this.paintList();
      if (was) this.play();
    },
    paintLcd: function () {
      var lcd = el("wa-track");
      if (lcd) lcd.textContent = pad(Math.floor(this.elapsed / 60), 2) + ":" + pad(this.elapsed % 60, 2) + "  " + TRACKS[this.track].title;
    },
    paintList: function () {
      var list = el("wa-list");
      if (!list) return;
      list.innerHTML = TRACKS.map(function (t, i) {
        return '<li data-i="' + i + '" class="' + (i === this.track ? "on" : "") + '">' + (i + 1) + ". " + esc(t.title) + "</li>";
      }, this).join("");
    }
  };

  if (el("winamp")) {
    AMP.paintLcd();
    AMP.paintList();
    var bind = function (id, fn) { var b = el(id); if (b) b.onclick = fn; };
    bind("wa-play", function () { AMP.play(); el("winamp").classList.remove("paused"); el("winamp").classList.add("live"); });
    bind("wa-pause", function () { AMP.pause(); el("winamp").classList.add("paused"); el("winamp").classList.remove("live"); });
    bind("wa-stop", function () { AMP.stop(); el("winamp").classList.add("paused"); el("winamp").classList.remove("live"); });
    var vol = el("wa-vol");
    if (vol) vol.oninput = function () { if (AMP.master) AMP.master.gain.value = (vol.value / 100) * 0.8; };
    var list = el("wa-list");
    if (list) list.onclick = function (ev) {
      var li = ev.target.closest("li");
      if (li) AMP.select(parseInt(li.getAttribute("data-i"), 10));
    };
    // live EQ from the analyser node
    var bars = document.querySelectorAll(".wa-eq i");
    var freqData = null;
    (function eqLoop() {
      window.requestAnimationFrame(eqLoop);
      if (!AMP.playing || !AMP.analyser || !bars.length) return;
      if (!freqData) freqData = new Uint8Array(AMP.analyser.frequencyBinCount);
      AMP.analyser.getByteFrequencyData(freqData);
      var bands = [[1, 2], [3, 5], [6, 9], [10, 15], [16, 24]];
      for (var i = 0; i < bands.length; i++) {
        var sum = 0, n = 0;
        for (var b = bands[i][0]; b <= bands[i][1] && b < freqData.length; b++) { sum += freqData[b]; n++; }
        var v = n ? sum / n / 255 : 0;
        bars[i].style.height = Math.max(3, Math.round(v * 26)) + "px";
        bars[i].style.animation = "none";
      }
    })();
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
