/* MaxLananas — home motion & enhancement.
   Progressive : le contenu est entièrement lisible sans JavaScript. Ce module
   n’ajoute que du mouvement (GSAP) et du renfort (images), en respectant
   `prefers-reduced-motion`. Si GSAP ne charge pas, un garde-fou (`html.static`)
   laisse tout visible immédiatement. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  function disableMotion() {
    root.classList.add("no-motion");
    root.classList.add("static");
  }

  function resetWatchdog() {
    if (window.__motionWatchdog) { clearTimeout(window.__motionWatchdog); window.__motionWatchdog = 0; }
  }
  function armWatchdog(ms) {
    resetWatchdog();
    window.__motionWatchdog = setTimeout(function () {
      if (!root.classList.contains("motion-on")) root.classList.add("static");
    }, ms);
  }

  /* ---------- Renforcement d’images distantes ---------- */
  // build  images : wsrv optimisé -> original GitHub en secours -> fond quadrillé.
  function initImageFallback() {
    var imgs = document.querySelectorAll("img[data-orig]");
    Array.prototype.forEach.call(imgs, function (img) {
      img.addEventListener("error", function onErr() {
        var orig = img.getAttribute("data-orig");
        if (orig) {
          img.removeAttribute("data-orig");
          img.src = orig;
        } else {
          img.classList.add("is-err");
          img.remove();
        }
      });
    });
  }

  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Mouvement GSAP ---------- */
  function bootMotion() {
    if (reduce && reduce.matches) { disableMotion(); return; }
    if (typeof window.gsap === "undefined") { disableMotion(); return; }

    var gsap = window.gsap;
    var hasST = typeof window.ScrollTrigger !== "undefined";
    if (hasST) gsap.registerPlugin(window.ScrollTrigger);

    root.classList.add("motion-on");
    resetWatchdog();

    var easeOut = "power3.out";

    // Entrée du hero.
    var hero = document.getElementById("hero");
    if (hero) {
      var tl = gsap.timeline({ defaults: { ease: easeOut } });
      tl
        .fromTo("[data-rv='up']", { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 0.1)
        .fromTo(".baseline-rule", { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power4.out" }, 0.35)
        .fromTo("#hero .wordmark .wm", { yPercent: 18 }, { yPercent: 0, duration: 1.4, ease: "power4.out", stagger: 0.12 }, 0)
        .fromTo("#hero .hero-coord", { opacity: 0 }, { opacity: 1, duration: .9 }, 1.2);
    }

    // Révélations au scroll (fallback IntersectionObserver si pas de ScrollTrigger).
    var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-rv='up'], [data-rv='fade']"));

    function revealNow(el) {
      if (el.__revealed) return;
      el.__revealed = true;
      if (typeof gsap !== "undefined") {
        gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: easeOut });
      } else {
        el.style.opacity = "1"; el.style.transform = "none";
      }
    }

    if (hasST) {
      revealEls.forEach(function (el) {
        // Hero déjà animé : on ignore les éléments dans #hero.
        if (hero && hero.contains(el)) return;
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: easeOut,
            scrollTrigger: { trigger: el, start: "top 88%" } });
      });
    } else {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { revealNow(e.target); io.unobserve(e.target); } });
        }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
        revealEls.forEach(function (el) { io.observe(el); });
      } else {
        revealEls.forEach(revealNow);
      }
    }

    // Légère parallaxe sur le hero seulement (coût maîtrisé, désactivé en mouvement réduit).
    var heroPlate = document.getElementById("heroParallax");
    if (heroPlate && hasST && !(reduce && reduce.matches)) {
      gsap.to(heroPlate, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: document.getElementById("hero"), start: "top top", end: "bottom top", scrub: true }
      });
    }

    // Lecture réduite : on raccourcit.
    if (reduce && reduce.matches) { gsap.globalTimeline.timeScale(2); }
  }

  function init() {
    initImageFallback();
    initYear();
    bootMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // Garde-fou tardif si le chargement du module traîne.
  armWatchdog(3200);
})();
