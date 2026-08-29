(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches && window.innerWidth > 900;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const loader = $("#loader");
  const loaderCount = $("#loaderCount");
  const loaderBar = $("#loaderBar");
  const cursor = $("#cursor");
  const cursorLabel = cursor ? $(".cursor-label", cursor) : null;
  const clock = $("#liveClock");
  const navToggle = $("#navToggle");
  const menuOverlay = $("#menuOverlay");
  const header = $("#siteHeader");

  function pad(n) {
    return String(Math.floor(n)).padStart(2, "0");
  }

  function tickClock() {
    if (!clock) return;
    const now = new Date();
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    clock.textContent = hh + ":" + mm + ":" + ss;
    clock.setAttribute("datetime", now.toISOString());
  }
  tickClock();
  setInterval(tickClock, 1000);

  const HERO_FILES = {
    a: "Mt_Blanc_cut.png",
    b: "chateau_loire.png",
    c: "Larressingle.png",
  };

  function imgUrl(name, w) {
    if (window.MAX && window.MAX.buildImageUrl) return window.MAX.buildImageUrl(name, w, 76);
    const source = "https://github.com/MaxLananas/Asset-Portfolio/releases/download/images-v1/" + encodeURIComponent(name);
    return "https://wsrv.nl/?url=" + encodeURIComponent(source) + "&w=" + w + "&q=76";
  }

  function hydrateMedia() {
    const map = [
      [".hero-shot-a img", HERO_FILES.a, 720],
      [".hero-shot-b img", HERO_FILES.b, 900],
      [".hero-shot-c img", HERO_FILES.c, 640],
    ];
    map.forEach(([sel, file, w]) => {
      const el = $(sel);
      if (el) {
        el.src = imgUrl(file, w);
        el.loading = "eager";
      }
    });
    $$(".case").forEach((card) => {
      const file = card.dataset.file;
      const img = $("img", card);
      if (!file || !img) return;
      const wide = card.classList.contains("case-lg") ? 1600 : 1100;
      img.src = imgUrl(file, wide);
      img.loading = "lazy";
    });
  }
  hydrateMedia();

  $$(".case").forEach((card) => {
    card.addEventListener("click", () => {
      const file = card.dataset.file;
      if (!file || !window.MAX) return;
      const idx = window.MAX.FILES.findIndex((f) => f.name === file);
      if (idx >= 0) window.MAX.openLightbox(idx);
    });
  });

  /* —— Menu —— */
  let menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    if (!menuOverlay || !navToggle) return;
    if (open) {
      menuOverlay.hidden = false;
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
      if (window.__lenis) window.__lenis.stop();
      if (window.gsap) {
        gsap.fromTo(menuOverlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
        gsap.fromTo(".menu-nav a", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.55, ease: "power3.out" });
      }
    } else {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
      if (window.gsap) {
        gsap.to(menuOverlay, {
          autoAlpha: 0,
          duration: 0.25,
          onComplete: () => { menuOverlay.hidden = true; },
        });
      } else {
        menuOverlay.hidden = true;
      }
    }
  }
  if (navToggle) navToggle.addEventListener("click", () => setMenu(!menuOpen));
  $$("[data-menu-link]").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  if (!window.gsap) {
    document.body.classList.remove("is-loading");
    if (loader) loader.remove();
    return;
  }

  [
    window.ScrollTrigger,
    window.ScrollToPlugin,
    window.SplitText,
    window.Flip,
    window.CustomEase,
    window.Observer,
    window.ScrambleTextPlugin,
    window.TextPlugin,
    window.DrawSVGPlugin,
  ].filter(Boolean).forEach((p) => {
    try { gsap.registerPlugin(p); } catch (_) {}
  });

  function splitCreate(target, vars) {
    if (!window.SplitText) return null;
    try {
      if (typeof SplitText.create === "function") return SplitText.create(target, vars);
      return new SplitText(target, vars);
    } catch (_) {
      return null;
    }
  }

  let hop = "power4.out";
  try {
    if (window.CustomEase) hop = CustomEase.create("hop", "M0,0 C0.11,0.494 0.132,0.78 0.378,0.904 0.574,1.002 0.818,1.001 1,1");
  } catch (_) {}
  gsap.config({ nullTargetWarn: false });

  /* —— Smooth scroll —— */
  let lenis = null;
  window.__lenis = null;
  const LenisCtor = window.Lenis || window.lenis;
  if (!reduce && LenisCtor) {
    lenis = new LenisCtor({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.1,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  $$("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -12 });
      else gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 12 }, ease: "power3.inOut" });
    });
  });

  /* —— Cursor —— */
  if (finePointer && !reduce && cursor) {
    document.body.classList.add("has-cursor");
    const ring = $(".cursor-ring", cursor);
    const dot = $(".cursor-dot", cursor);
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    let visible = false;

    window.addEventListener("pointermove", (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        cursor.classList.add("is-on");
        ringPos.x = pos.x;
        ringPos.y = pos.y;
      }
      gsap.set(dot, { x: pos.x, y: pos.y });
    }, { passive: true });

    gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
      if (cursorLabel) gsap.set(cursorLabel, { x: ringPos.x, y: ringPos.y });
    });

    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest("[data-cursor='view'], .tile");
      const hide = e.target.closest("[data-cursor='hidden']");
      cursor.classList.toggle("is-view", Boolean(view) && !hide);
      cursor.classList.toggle("is-hidden", Boolean(hide));
      if (cursorLabel) cursorLabel.textContent = view ? "View" : "";
    });
  }

  /* —— Magnetic —— */
  if (finePointer && !reduce) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.35, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: hop });
      });
    });
  }

  /* —— Loader —— */
  function runLoader() {
    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: revealSite,
    });

    if (reduce) {
      tl.to(loader, { autoAlpha: 0, duration: 0.2 });
      return;
    }

    tl.to(counter, {
      v: 100,
      duration: 1.55,
      ease: "power2.inOut",
      onUpdate: () => {
        loaderCount.textContent = pad(counter.v);
        if (loaderBar) loaderBar.style.width = counter.v + "%";
      },
    }, 0);

    const kick = splitCreate(".loader-kicker", { type: "chars" });
    if (kick && kick.chars) {
      tl.from(kick.chars, { y: 16, opacity: 0, stagger: 0.02, duration: 0.5, ease: "power3.out" }, 0);
    }

    tl.to(".loader-center", { y: -20, opacity: 0, duration: 0.45, ease: "power2.in" }, "+=0.12");
    tl.to(".loader-top, .loader-bottom", { opacity: 0, duration: 0.3 }, "<");
    tl.to(loader, { yPercent: -100, duration: 0.95, ease: "power4.inOut" });
  }

  function splitLines(el) {
    if (!el) return null;
    return splitCreate(el, { type: "chars,lines", mask: "lines", charsClass: "char" });
  }

  function revealSite() {
    gsap.set(".hero-shot", { clipPath: "inset(100% 0 0 0)" });
    document.body.classList.remove("is-loading");
    if (loader) {
      loader.classList.add("is-done");
      loader.style.display = "none";
    }
    ScrollTrigger.refresh();

    if (reduce) return;

    const titleSplit = splitLines("#heroTitle");
    const contactSplit = splitLines("#contactHeading");

    const intro = gsap.timeline({ defaults: { ease: hop } });
    intro.from(".site-header", { y: -30, autoAlpha: 0, duration: 0.8 }, 0);

    if (titleSplit && titleSplit.chars) {
      intro.from(titleSplit.chars, {
        yPercent: 120,
        rotateZ: 6,
        stagger: 0.022,
        duration: 1.15,
        ease: hop,
      }, 0.05);
    } else {
      intro.from("#heroTitle", { y: 40, autoAlpha: 0, duration: 1 }, 0.05);
    }

    intro.from(".hero-index, .hero-role", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.35);
    intro.to(".hero-shot", {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.2,
      stagger: 0.12,
      ease: "power4.inOut",
    }, 0.2);
    intro.from(".hero-shot img", { scale: 1.25, duration: 1.4, ease: "power3.out", stagger: 0.12 }, 0.2);
    intro.from(".hero-bottom > *", { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.55);

    if (window.ScrambleTextPlugin) {
      gsap.to("#heroRole", {
        scrambleText: { text: "Digital architect of block worlds", chars: "upperCase", speed: 0.4 },
        duration: 1.4,
        delay: 0.7,
      });
    }

    if (window.DrawSVGPlugin) {
      gsap.from(".mark-path", { drawSVG: "0%", duration: 1.2, stagger: 0.08, ease: "power2.inOut", delay: 0.2 });
    }

    $$(".main-nav a").forEach((a) => {
      const original = a.textContent;
      a.addEventListener("mouseenter", () => {
        if (!window.ScrambleTextPlugin) return;
        gsap.to(a, { scrambleText: { text: original, chars: "upperCase", speed: 0.6 }, duration: 0.55 });
      });
    });

    if (contactSplit) {
      /* stored for later scroll */
      contactSplit.chars && gsap.set(contactSplit.chars, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: "#contact",
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(contactSplit.chars, { yPercent: 0, stagger: 0.025, duration: 1, ease: hop });
        },
      });
    }
  }

  /* —— Scroll animations —— */
  function bindScroll() {
    if (reduce) return;

    gsap.to(".marquee-track", {
      xPercent: -50,
      ease: "none",
      duration: 28,
      repeat: -1,
    });

    $$(".stat").forEach((stat) => {
      const num = $(".stat-num", stat);
      const end = Number(stat.dataset.count || 0);
      const suffix = stat.dataset.suffix || "";
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: stat,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: end,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => { num.textContent = Math.round(obj.v) + suffix; },
          });
        },
      });
    });

    gsap.utils.toArray(".case-media").forEach((media) => {
      const img = $("img", media);
      gsap.fromTo(media, { clipPath: "inset(18% 12% 18% 12%)" }, {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scrollTrigger: { trigger: media, start: "top 90%", end: "top 35%", scrub: 0.6 },
      });
      if (img) {
        gsap.fromTo(img, { scale: 1.18 }, {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: media, start: "top 90%", end: "bottom top", scrub: 0.8 },
        });
      }
    });

    $$(".split-title").forEach((el) => {
      if (!window.SplitText) {
        gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: el, start: "top 85%" } });
        return;
      }
      const s = splitCreate(el, { type: "chars,lines", mask: "lines" });
      if (!s || !s.chars) {
        gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: el, start: "top 85%" } });
        return;
      }
      gsap.from(s.chars, {
        yPercent: 110,
        stagger: 0.02,
        duration: 0.9,
        ease: hop,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 801px)", () => {
      const steps = $$(".process-step");
      const draw = $(".process-line-draw");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".process",
          start: "top top",
          end: "+=1800",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });
      if (draw && window.DrawSVGPlugin) {
        gsap.set(draw, { drawSVG: "0%" });
        tl.to(draw, { drawSVG: "100%", ease: "none" }, 0);
      } else if (draw) {
        tl.to(draw, { strokeDashoffset: 0, ease: "none" }, 0);
      }
      steps.forEach((step, i) => {
        tl.to(steps, { opacity: 0.28, duration: 0.2, ease: "none" }, i * 0.22);
        tl.to(step, { opacity: 1, duration: 0.2, ease: "none" }, i * 0.22);
      });
    });

    mm.add("(min-width: 801px)", () => {
      const track = $("#servicesTrack");
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: ".services-pin",
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });

    const manifesto = $("#manifestoText");
    if (manifesto && window.SplitText) {
      const words = splitCreate(manifesto, { type: "words", wordsClass: "word" });
      if (words && words.words) {
        gsap.fromTo(words.words, { opacity: 0.12 }, {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: manifesto,
            start: "top 75%",
            end: "bottom 45%",
            scrub: 0.6,
          },
        });
      }
    }

    gsap.from(".footer-giant", {
      xPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".site-footer", start: "top 90%", end: "bottom bottom", scrub: true },
    });

    gsap.from(".faq details", {
      y: 16,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: { trigger: ".faq", start: "top 80%" },
    });

    ScrollTrigger.batch(".tile", {
      start: "top 95%",
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(batch, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.7, ease: "power3.out", overwrite: true });
      },
    });
  }

  /* —— Hero parallax —— */
  if (!reduce && window.Observer && finePointer) {
    const stage = $("#heroStage");
    Observer.create({
      target: window,
      type: "pointer",
      onMove: (self) => {
        if (!stage) return;
        const nx = (self.x / window.innerWidth - 0.5) * 2;
        const ny = (self.y / window.innerHeight - 0.5) * 2;
        $$(".hero-shot").forEach((shot) => {
          const speed = Number(shot.dataset.speed || 0.3);
          gsap.to(shot, { x: nx * 28 * speed, y: ny * 18 * speed, duration: 0.8, ease: "power3.out", overwrite: "auto" });
        });
      },
    });
  }

  gsap.to(".hero-shot-b", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-shot-a", {
    yPercent: -8,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* —— Header hide (lenis-aware) —— */
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      if (!header) return;
      if (y > lastY && y > 140) header.classList.add("hide");
      else header.classList.remove("hide");
      lastY = y;
    },
  });

  /* —— Lightbox motion —— */
  window.addEventListener("lightbox:open", () => {
    if (reduce) return;
    gsap.fromTo("#lightbox", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    gsap.fromTo("#lbImg", { scale: 0.94, y: 18 }, { scale: 1, y: 0, duration: 0.55, ease: hop });
    if (lenis) lenis.stop();
  });
  window.addEventListener("lightbox:close", () => {
    if (lenis) lenis.start();
  });

  window.addEventListener("gallery:ready", () => {
    ScrollTrigger.refresh();
  });

  window.addEventListener("gallery:filter", () => {
    if (reduce || !window.gsap) return;
    const tiles = $$(".tile:not([hidden])");
    gsap.fromTo(tiles, { autoAlpha: 0.4, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.01, ease: "power2.out" });
  });

  runLoader();
  bindScroll();

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
