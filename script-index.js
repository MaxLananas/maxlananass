document.addEventListener('DOMContentLoaded', function () {

    var nav = document.getElementById('nav');
    var video = document.getElementById('heroBg');
    var muteBtn = document.getElementById('muteBtn');
    var muteIcon = document.getElementById('muteIcon');
    var scrollHint = document.getElementById('scrollHint');
    var audioUnlocked = false;
    var scrollHintHidden = false;

    ScrollTrigger.config({
        limitCallbacks: true,
        syncInterval: 50,
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
    });
    
    var lenis = new Lenis({
        duration: 1.45,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        touchMultiplier: 1.5,
        infinite: false,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothTouch: false
    });

    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    var navTicking = false;
    lenis.on('scroll', function (e) {
        if (!navTicking) {
            navTicking = true;
            requestAnimationFrame(function () {
                nav.classList.toggle('scrolled', e.scroll > 48);
                navTicking = false;
            });
        }
    });

    function ensurePlaying() {
        if (video.paused && !document.hidden) {
            video.play().catch(function () {});
        }
    }

    function tryUnmute() {
        if (audioUnlocked) return;
        video.muted = false;
        video.volume = 1;
        video.play().then(function () {
            audioUnlocked = true;
            muteIcon.className = 'fa-solid fa-volume-high';
            muteBtn.setAttribute('aria-label', 'Mute background video');
        }).catch(function () {
            video.muted = true;
            muteIcon.className = 'fa-solid fa-volume-xmark';
            muteBtn.setAttribute('aria-label', 'Unmute background video');
        });
    }

    video.addEventListener('pause', ensurePlaying);
    video.addEventListener('ended', ensurePlaying);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) ensurePlaying();
    });

    var unlockEvents = ['click', 'touchstart', 'keydown', 'scroll'];
    unlockEvents.forEach(function (evt) {
        document.addEventListener(evt, tryUnmute, { once: true, passive: true });
    });

    muteBtn.addEventListener('click', function () {
        audioUnlocked = true;
        video.muted = !video.muted;
        if (!video.muted) video.volume = 1;
        muteIcon.className = video.muted
            ? 'fa-solid fa-volume-xmark'
            : 'fa-solid fa-volume-high';
        muteBtn.setAttribute('aria-label', video.muted ? 'Unmute background video' : 'Mute background video');
        muteBtn.setAttribute('aria-pressed', String(!video.muted));
        if (video.paused) video.play().catch(function () {});
    });

    video.play().then(function () {
        video.muted = false;
        video.volume = 1;
        audioUnlocked = true;
        muteIcon.className = 'fa-solid fa-volume-high';
        muteBtn.setAttribute('aria-label', 'Mute background video');
    }).catch(function () {
        video.muted = true;
        muteIcon.className = 'fa-solid fa-volume-xmark';
        muteBtn.setAttribute('aria-label', 'Unmute background video');
    });

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function initAnimations() {
        if (prefersReducedMotion.matches) {
            // Show everything immediately, skip GSAP
            var instantElements = document.querySelectorAll('.fu, .hero-sub, .hero-card, #scrollHint, .logos-wrap, .video-mute-btn, .block, .divider');
            for (var i = 0; i < instantElements.length; i++) {
                instantElements[i].style.opacity = '1';
                instantElements[i].style.transform = 'none';
            }
            var translateYElements = document.querySelectorAll('.hero-title .li, .rw .ri, .cta-line-1 .ri, .cta-line-2 .ri');
            for (var j = 0; j < translateYElements.length; j++) {
                translateYElements[j].style.transform = 'none';
            }
            return;
        }
        var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.to('#heroTitle .li',  { y: 0, duration: 1.25, stagger: 0.13, delay: 0.2 })
          .to('.hero-sub',       { opacity: 1, y: 0, duration: 1 }, '-=.7')
          .to('.hero-card',      { opacity: 1, y: 0, duration: 1 }, '-=.65')
          .to('#scrollHint',     { opacity: 1, duration: 1 },       '-=.5')
          .to('.logos-wrap',     { opacity: 1, duration: 1 },       '-=.4')
          .to('.video-mute-btn', { opacity: 1, duration: 0.6 },     '-=.8');

        // Hide scroll hint on scroll
        lenis.on('scroll', function (e) {
            if (!scrollHintHidden && e.scroll > 100) {
                scrollHintHidden = true;
                gsap.to(scrollHint, { opacity: 0, duration: 0.4, onComplete: function () {
                    scrollHint.style.pointerEvents = 'none';
                }});
            }
        });

        var rwElements = document.querySelectorAll('.rw');
        for (var r = 0; r < rwElements.length; r++) {
            (function (el) {
                var inner = el.querySelector('.ri');
                if (!inner) return;
                gsap.to(inner, {
                    y: 0,
                    duration: 1.1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                });
            })(rwElements[r]);
        }

        var fuElements = document.querySelectorAll('.fu');
        for (var f = 0; f < fuElements.length; f++) {
            (function (el, index) {
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    ease: 'power3.out',
                    delay: (index % 4) * 0.055,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 93%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                });
            })(fuElements[f], f);
        }
        var ctaRiElements = document.querySelectorAll('.cta-line-1 .ri, .cta-line-2 .ri');
        for (var c = 0; c < ctaRiElements.length; c++) {
            (function (el, index) {
                gsap.to(el, {
                    y: 0,
                    duration: 1.15,
                    ease: 'power4.out',
                    delay: index * 0.13,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 92%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                });
            })(ctaRiElements[c], c);
        }

        var parallaxTargets = document.querySelectorAll('.masonry-item img, .collab-item img');
        for (var p = 0; p < parallaxTargets.length; p++) {
            (function (img) {
                var container = img.closest('.masonry-item') || img.closest('.collab-item');
                if (!container) return;
                gsap.fromTo(img,
                    { yPercent: -5 },
                    {
                        yPercent: 5,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.2,
                            invalidateOnRefresh: true
                        }
                    }
                );
            })(parallaxTargets[p]);
        }
        var slElements = document.querySelectorAll('.sl');
        for (var s = 0; s < slElements.length; s++) {
            (function (el) {
                gsap.fromTo(el,
                    { x: -40 },
                    {
                        x: 0,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom',
                            end: 'center center',
                            scrub: 2,
                            invalidateOnRefresh: true
                        }
                    }
                );
            })(slElements[s]);
        }
        ScrollTrigger.addEventListener('refreshInit', function () {
        });
    }

    initAnimations();

    if (prefersReducedMotion.addEventListener) {
        prefersReducedMotion.addEventListener('change', function () {
            ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
            initAnimations();
        });
    }
    if ('IntersectionObserver' in window) {
        var lazyImages = document.querySelectorAll('img[loading="lazy"]');
        if (lazyImages.length > 0) {
            var imageObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '200px 0px',
                threshold: 0.01
            });

            lazyImages.forEach(function (img) {
                imageObserver.observe(img);
            });
        }
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(function () {
            var externalLinks = document.querySelectorAll('a[target="_blank"]');
            var prefetched = {};

            externalLinks.forEach(function (link) {
                link.addEventListener('mouseenter', function () {
                    var href = link.href;
                    if (prefetched[href]) return;
                    prefetched[href] = true;

                    var prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = href;
                    prefetchLink.as = 'document';
                    document.head.appendChild(prefetchLink);
                }, { once: true, passive: true });
            });
        });
    }

    window.addEventListener('load', function () {
        requestAnimationFrame(function () {
            ScrollTrigger.refresh();
        });
    });

    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            ScrollTrigger.refresh();
        }, 250);
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
        // ESC to close any open overlay
        if (e.key === 'Escape') {
            if (video && !video.muted) {
                video.muted = true;
                muteIcon.className = 'fa-solid fa-volume-xmark';
                muteBtn.setAttribute('aria-label', 'Unmute background video');
                muteBtn.setAttribute('aria-pressed', 'false');
            }
        }
    });
    document.documentElement.classList.remove('loading');
    document.documentElement.classList.add('js-loaded');

});
