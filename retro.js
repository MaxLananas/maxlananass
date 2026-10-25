/* ==========================================================================
   retro.js — watching eyes, block-of-the-day colour wheel, MAXAMP (a real chiptune radio
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

  /* --------------------------------------- block of the day + colour wheel -- */
  // Real Minecraft 1.21.x block textures + average colours live in
  // /assets/blocks/ (palette.json). The wheel paints every hue; clicking it
  // picks the six real blocks closest to that hue.
  var blockBox = el("block-day");
  var wheelCv = el("wheel");
  var PALETTE = [];   // { n, f, r, g, b, h, s, l }
  var WHEEL_HUE = (function () {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var day = Math.floor((now - start) / 86400000);
    return (day * 137.5) % 360;   // golden angle: a different hue every day
  })();

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = l - c / 2;
    var t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [Math.round((t[0] + m) * 255), Math.round((t[1] + m) * 255), Math.round((t[2] + m) * 255)];
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s, l: l };
  }
  function paintWheel(hue) {
    if (!wheelCv) return;
    var ctx2d = wheelCv.getContext("2d");
    var size = wheelCv.width, c = size / 2, rad = c - 3;
    var img = ctx2d.createImageData(size, size);
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var dx = x - c + 0.5, dy = y - c + 0.5;
        var r = Math.sqrt(dx * dx + dy * dy);
        var o = (y * size + x) * 4;
        if (r > rad) { img.data[o + 3] = 0; continue; }
        var a = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        var rgb = hslToRgb(a, Math.min(1, r / rad), 0.5);
        img.data[o] = rgb[0]; img.data[o + 1] = rgb[1]; img.data[o + 2] = rgb[2]; img.data[o + 3] = 255;
      }
    }
    ctx2d.putImageData(img, 0, 0);
    // notch marking the active hue
    var na = (hue - 90) * Math.PI / 180;
    ctx2d.strokeStyle = "#fff";
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.moveTo(c + Math.cos(na) * (rad - 7), c + Math.sin(na) * (rad - 7));
    ctx2d.lineTo(c + Math.cos(na) * (rad + 1), c + Math.sin(na) * (rad + 1));
    ctx2d.stroke();
    ctx2d.strokeStyle = "#000";
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(0.5, 0.5, size - 1, size - 1);
  }
  function renderBlocks(hue) {
    if (!blockBox || !PALETTE.length) return;
    var dist = function (h) { var d = Math.abs(h - hue) % 360; return d > 180 ? 360 - d : d; };
    var sorted = PALETTE.slice().sort(function (a, b) { return dist(a.h) - dist(b.h); });
    var picks = [];
    for (var i = 0; i < sorted.length && picks.length < 6; i++) {
      var cand = sorted[i];
      if (cand.s < 0.06) continue;                       // skip near-grays
      if (dist(cand.h) > 26) break;
      if (picks.some(function (p2) { return Math.abs(p2.l - cand.l) < 0.09 && dist2(p2, cand); })) continue;
      picks.push(cand);
    }
    while (picks.length < 6 && picks.length < sorted.length) picks.push(sorted[picks.length + 10] || sorted[picks.length]);
    function dist2(a, b) { return Math.abs(a.h - b.h) > 2; }
    blockBox.innerHTML = '<div class="sw-name">hue ' + Math.round(hue) + "° · " + esc(picks.length) + ' real blocks <span class="newflag blink">NEW</span></div>' +
      '<div class="blk-texs">' + picks.map(function (b) {
        return '<img class="sw-tex" src="/assets/blocks/' + encodeURIComponent(b.f) + '" width="44" height="44" alt="' + esc(b.n) + '" title="' + esc(b.n) + '" loading="lazy">';
      }).join("") + "</div>" +
      '<div class="swl">' + picks.map(function (b) { return esc(b.n); }).join(" · ") + "</div>";
  }
  if (blockBox) {
    blockBox.innerHTML = '<div class="tiny">textures downloading… (415 blocks)</div>';
    fetch("/assets/blocks/palette.json").then(function (r) { return r.json(); }).then(function (list) {
      PALETTE = list.map(function (b) {
        var hsl = rgbToHsl(b.r, b.g, b.b);
        return { n: b.n, f: b.f, r: b.r, g: b.g, b: b.b, h: hsl.h, s: hsl.s, l: hsl.l };
      });
      paintWheel(WHEEL_HUE);
      renderBlocks(WHEEL_HUE);
      if (wheelCv) wheelCv.onclick = function (ev) {
        var rect = wheelCv.getBoundingClientRect();
        var x = ev.clientX - rect.left - rect.width / 2;
        var y = ev.clientY - rect.top - rect.height / 2;
        WHEEL_HUE = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        paintWheel(WHEEL_HUE);
        renderBlocks(WHEEL_HUE);
      };
    }).catch(function () {
      blockBox.innerHTML = '<div class="tiny">block textures unavailable offline — try again later!</div>';
    });
  }

  /* ====================================== MAXAMP — real royalty-free radio -- */
  // Six genuine tracks from the CC0-1.0 "Royalty Free Music Pack"
  // (github.com/effacestudios/Royalty-Free-Music-Pack). No synth, no piracy:
  // public-domain mp3 files streamed through WebAudio so the EQ still dances.
  var PLAYLIST = [
    { f: "/assets/radio/happy-life.mp3", t: "Happy Life" },
    { f: "/assets/radio/gamer-guy.mp3", t: "Gamer Guy" },
    { f: "/assets/radio/party-time.mp3", t: "Party Time" },
    { f: "/assets/radio/science-fiction.mp3", t: "Science Fiction" },
    { f: "/assets/radio/mysterious.mp3", t: "Mysterious" },
    { f: "/assets/radio/the-clown.mp3", t: "THE CLOWN" }
  ];
  var AMP = {
    ctx: null, master: null, analyser: null, media: null, audio: null,
    track: store.get("ml_wa", 0) % PLAYLIST.length,
    playing: false, wantPlay: false,
    ensure: function () {
      if (this.ctx) return this.ctx;
      var AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      // small echo, like a jukebox in an empty mall
      this.delay = this.ctx.createDelay(1);
      this.delay.delayTime.value = 0.24;
      this.fb = this.ctx.createGain(); this.fb.gain.value = 0.18;
      this.wet = this.ctx.createGain(); this.wet.gain.value = 0.25;
      this.analyser.connect(this.delay); this.delay.connect(this.fb);
      this.fb.connect(this.delay); this.delay.connect(this.wet);
      this.wet.connect(this.ctx.destination);
      this.audio = new Audio();
      this.audio.preload = "metadata";
      this.media = this.ctx.createMediaElementSource(this.audio);
      this.media.connect(this.master);
      var amp = this;
      this.audio.addEventListener("ended", function () { amp.next(); });
      this.audio.addEventListener("play", function () { amp.playing = true; amp.paint(); });
      this.audio.addEventListener("pause", function () { amp.playing = false; amp.paint(); });
      this.audio.addEventListener("timeupdate", function () { amp.paintLcd(); });
      return this.ctx;
    },
    load: function (i) {
      this.track = ((i % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
      store.set("ml_wa", this.track);
      if (this.audio) this.audio.src = PLAYLIST[this.track].f;
      this.paintList(); this.paintLcd();
    },
    play: function () {
      var c = this.ensure();
      this.wantPlay = true;
      if (c.state !== "running") { try { c.resume(); } catch (e) { /* gesture needed */ } }
      if (!this.audio.src || this.audio.src.indexOf(PLAYLIST[this.track].f) === -1) this.load(this.track);
      var p = this.audio.play();
      if (p && p.catch) p.catch(function () { AMP.paint(); });
      this.paint();
    },
    pause: function () { this.wantPlay = false; if (this.audio) this.audio.pause(); this.paint(); },
    stop: function () { this.wantPlay = false; if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; } this.paint(); this.paintLcd(); },
    next: function () { var was = this.playing || this.wantPlay; this.load(this.track + 1); if (was) this.play(); },
    select: function (i) { var was = this.playing || this.wantPlay; this.load(i); if (was) this.play(); else this.paint(); },
    paint: function () {
      var w = el("winamp");
      if (!w) return;
      var st = el("wa-status");
      var locked = this.wantPlay && this.audio && this.audio.paused;
      if (st) {
        st.textContent = locked ? w.getAttribute("data-locked")
          : this.playing ? w.getAttribute("data-on")
          : (this.audio && this.audio.currentTime > 0 ? w.getAttribute("data-paused") : w.getAttribute("data-ready"));
      }
      w.classList.toggle("locked", !!locked);
      w.classList.toggle("live", !!this.playing);
      var play = el("wa-play");
      if (play) play.classList.toggle("dim", !!this.playing);
    },
    paintLcd: function () {
      var lcd = el("wa-track");
      if (!lcd) return;
      var cur = this.audio ? this.audio.currentTime || 0 : 0;
      lcd.textContent = pad(Math.floor(cur / 60), 2) + ":" + pad(Math.floor(cur % 60), 2) +
        "  ►  " + PLAYLIST[this.track].t + "  (" + (this.track + 1) + "/" + PLAYLIST.length + ")";
      var time = el("wa-time");
      if (time) time.textContent = pad(Math.floor(cur / 3600), 2) + ":" + pad(Math.floor(cur / 60) % 60, 2) + ":" + pad(Math.floor(cur) % 60, 2);
    },
    paintList: function () {
      var list = el("wa-list");
      if (!list) return;
      list.innerHTML = PLAYLIST.map(function (t, i) {
        return '<li><button type="button" class="wa-trk" data-i="' + i + '"><b>' + (i + 1) + ".</b> " + esc(t.t) + ' <span class="cc0">CC0</span>' + (i === this.track ? ' <span class="newflag blink">▶</span>' : "") + "</button></li>";
      }, this).join("");
    }
  };

  /* unlock audio on the very first human gesture anywhere on the page:
     browsers (and sandboxed preview iframes) refuse AudioContext until then */
  var unlock = function () {
    try {
      if (AMP.ctx && AMP.ctx.state === "suspended") AMP.ctx.resume();
      if (AMP.wantPlay && AMP.audio && AMP.audio.paused) { var q = AMP.audio.play(); if (q && q.catch) q.catch(function () {}); }
    } catch (e) { /* keep trying */ }
  };
  document.addEventListener("pointerdown", unlock, true);
  document.addEventListener("keydown", unlock, true);
  window.setInterval(function () {
    if (AMP.ctx && AMP.ctx.state === "suspended" && (AMP.playing || AMP.wantPlay)) AMP.ctx.resume().catch(function () {});
    AMP.paint();
  }, 1200);

  if (el("winamp")) {
    AMP.load(AMP.track);
    AMP.paint();
    var bind = function (id, fn) { var b = el(id); if (b) b.onclick = fn; };
    bind("wa-play", function () { AMP.play(); });
    bind("wa-pause", function () { AMP.pause(); });
    bind("wa-stop", function () { AMP.stop(); });
    var vol = el("wa-vol");
    if (vol) {
      vol.oninput = function () {
        if (AMP.master) AMP.master.gain.value = (vol.value / 100) * 1.1;
        if (AMP.audio) AMP.audio.volume = Math.min(1, 0.3 + (vol.value / 100) * 0.7);
      };
    }
    var list = el("wa-list");
    if (list) list.onclick = function (ev) {
      var btn = ev.target.closest("button[data-i]");
      if (btn) AMP.select(parseInt(btn.getAttribute("data-i"), 10));
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

  /* ------------------------------------------------- eyes that watch you -- */
  var pupils = [el("pupil-l"), el("pupil-r")].filter(Boolean);
  if (pupils.length) {
    var moveEyes = function (ev) {
      pupils.forEach(function (pup) {
        var eye = pup.parentNode;
        if (!eye) return;
        var r = eye.getBoundingClientRect();
        var dx = ev.clientX - (r.left + r.width / 2);
        var dy = ev.clientY - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var max = Math.max(2, r.width * 0.16);
        var k = Math.min(1, d / 140);
        pup.style.transform = "translate(" + (dx / d * max * k).toFixed(1) + "px," + (dy / d * max * k).toFixed(1) + "px)";
      });
    };
    document.addEventListener("mousemove", moveEyes, { passive: true });
    document.addEventListener("touchmove", function (ev) { if (ev.touches[0]) moveEyes(ev.touches[0]); }, { passive: true });
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
