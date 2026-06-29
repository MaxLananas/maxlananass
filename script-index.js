document.addEventListener('DOMContentLoaded', function () {

    var nav = document.getElementById('nav');
    var video = document.getElementById('heroBg');
    var muteBtn = document.getElementById('muteBtn');
    var muteIcon = document.getElementById('muteIcon');
    var scrollHint = document.getElementById('scrollHint');
    var heroTitle = document.querySelector('.hero-title');
    var audioUnlocked = false;
    var scrollHintHidden = false;
    var prefetched = {};

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)');
    var isMobile = window.matchMedia('(hover: none) and (pointer: coarse)');
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var slowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' || connection.saveData);

    document.documentElement.classList.remove('loading');
    document.documentElement.classList.add('js-loaded');

    ScrollTrigger.config({
        limitCallbacks: true,
        syncInterval: 50,
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
    });

    var lenis = new Lenis({
        duration: slowConnection ? 0.8 : 1.45,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: !slowConnection,
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
        if (video && video.paused && !document.hidden) {
            video.play().catch(function () {});
        }
    }

    function updateMuteUI() {
        muteIcon.className = video.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
        muteBtn.setAttribute('aria-label', video.muted ? 'Unmute background video' : 'Mute background video');
    }

    function tryUnmute() {
        if (audioUnlocked || slowConnection) return;
        video.muted = false;
        video.volume = 1;
        video.play().then(function () {
            audioUnlocked = true;
            updateMuteUI();
        }).catch(function () {
            video.muted = true;
            updateMuteUI();
        });
    }

    if (video) {
        video.addEventListener('pause', ensurePlaying);
        video.addEventListener('ended', ensurePlaying);

        ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (evt) {
            document.addEventListener(evt, tryUnmute, { once: true, passive: true });
        });

        muteBtn.addEventListener('click', function () {
            audioUnlocked = true;
            video.muted = !video.muted;
            if (!video.muted) video.volume = 1;
            updateMuteUI();
            muteBtn.setAttribute('aria-pressed', String(!video.muted));
            if (video.paused) video.play().catch(function () {});
        });

        video.play().then(function () {
            if (!slowConnection) {
                video.muted = false;
                video.volume = 1;
                audioUnlocked = true;
            }
            updateMuteUI();
        }).catch(function () {
            video.muted = true;
            updateMuteUI();
        });
    }

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            ensurePlaying();
        } else {
            var activeTriggers = ScrollTrigger.getAll();
            for (var i = 0; i < activeTriggers.length; i++) {
                if (activeTriggers[i].animation) {
                    activeTriggers[i].animation.pause();
                }
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && video && !video.muted) {
            video.muted = true;
            updateMuteUI();
            muteBtn.setAttribute('aria-pressed', 'false');
        }
    });

    function showImmediately(selector) {
        var els = document.querySelectorAll(selector);
        for (var i = 0; i < els.length; i++) {
            els[i].style.opacity = '1';
            els[i].style.transform = 'none';
        }
    }

    function resetTransform(selector) {
        var els = document.querySelectorAll(selector);
        for (var i = 0; i < els.length; i++) {
            els[i].style.transform = 'none';
        }
    }

    function initAnimations() {
        if (prefersReducedMotion.matches || slowConnection) {
            showImmediately('.fu, .hero-sub, .hero-card, #scrollHint, .logos-wrap, .video-mute-btn, .block, .divider');
            resetTransform('.hero-title .li, .rw .ri, .cta-line-1 .ri, .cta-line-2 .ri');
            return;
        }

        var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.to((heroTitle ? '.hero-title' : '#heroTitle') + ' .li', { y: 0, duration: 1.25, stagger: 0.13, delay: 0.2 })
          .to('.hero-sub', { opacity: 1, y: 0, duration: 1 }, '-=.7')
          .to('.hero-card', { opacity: 1, y: 0, duration: 1 }, '-=.65')
          .to('#scrollHint', { opacity: 1, duration: 1 }, '-=.5')
          .to('.logos-wrap', { opacity: 1, duration: 1 }, '-=.4')
          .to('.video-mute-btn', { opacity: 1, duration: 0.6 }, '-=.8');

        lenis.on('scroll', function (e) {
            if (!scrollHintHidden && e.scroll > 100) {
                scrollHintHidden = true;
                gsap.to(scrollHint, {
                    opacity: 0,
                    duration: 0.4,
                    onComplete: function () {
                        if (scrollHint) scrollHint.style.pointerEvents = 'none';
                    }
                });
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
                    scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true }
                });
            })(rwElements[r]);
        }

        var fuElements = document.querySelectorAll('.fu');
        var fuCount = isMobile.matches ? 2 : 4;
        for (var f = 0; f < fuElements.length; f++) {
            (function (el, index) {
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    ease: 'power3.out',
                    delay: (index % fuCount) * 0.055,
                    scrollTrigger: { trigger: el, start: 'top 93%', toggleActions: 'play none none none', once: true }
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
                    scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none', once: true }
                });
            })(ctaRiElements[c], c);
        }

        if (!isMobile.matches) {
            var parallaxTargets = document.querySelectorAll('.masonry-item img, .collab-item img');
            for (var p = 0; p < parallaxTargets.length; p++) {
                (function (img) {
                    var container = img.closest('.masonry-item') || img.closest('.collab-item');
                    if (!container) return;
                    gsap.fromTo(img,
                        { yPercent: -4 },
                        {
                            yPercent: 4,
                            ease: 'none',
                            scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: 1.5, invalidateOnRefresh: true }
                        }
                    );
                })(parallaxTargets[p]);
            }
        }

        var slElements = document.querySelectorAll('.sl');
        for (var s = 0; s < slElements.length; s++) {
            (function (el) {
                gsap.fromTo(el,
                    { x: -40 },
                    {
                        x: 0,
                        ease: 'none',
                        scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 2, invalidateOnRefresh: true }
                    }
                );
            })(slElements[s]);
        }
    }

    initAnimations();

    prefersReducedMotion.addEventListener('change', function () {
        var triggers = ScrollTrigger.getAll();
        for (var i = 0; i < triggers.length; i++) triggers[i].kill();
        initAnimations();
    });

    if ('IntersectionObserver' in window) {
        var lazyImages = document.querySelectorAll('img[loading="lazy"]');
        if (lazyImages.length > 0) {
            var imageObserver = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) {
                        var img = entries[i].target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                }
            }, { rootMargin: '200px 0px', threshold: 0.01 });

            for (var li = 0; li < lazyImages.length; li++) {
                imageObserver.observe(lazyImages[li]);
            }
        }

        var sections = document.querySelectorAll('section[id]');
        if (sections.length > 0 && 'content-visibility' in document.documentElement.style) {
            var sectionObserver = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    entries[i].target.style.contentVisibility = entries[i].isIntersecting ? 'visible' : 'auto';
                }
            }, { rootMargin: '400px 0px', threshold: 0 });

            for (var si = 0; si < sections.length; si++) {
                sectionObserver.observe(sections[si]);
            }
        }
    }

    function prefetchURL(url) {
        if (prefetched[url]) return;
        prefetched[url] = true;
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
    }

    function prefetchInternal() {
        var internalNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .f-links a[href^="/"]');
        for (var i = 0; i < internalNavLinks.length; i++) {
            (function (link) {
                link.addEventListener('mouseenter', function () {
                    var href = link.getAttribute('href');
                    if (href && href.startsWith('/')) prefetchURL(href);
                }, { once: true, passive: true });
            })(internalNavLinks[i]);
        }
    }

    function prefetchExternal() {
        var externalLinks = document.querySelectorAll('a[target="_blank"]');
        for (var i = 0; i < externalLinks.length; i++) {
            (function (link) {
                link.addEventListener('mouseenter', function () {
                    prefetchURL(link.href);
                }, { once: true, passive: true });
            })(externalLinks[i]);
        }
    }

    if (slowConnection || prefersReducedData.matches) {
        prefetchInternal();
    } else if ('requestIdleCallback' in window) {
        requestIdleCallback(function () {
            prefetchInternal();
            prefetchExternal();
        });
    } else {
        setTimeout(function () {
            prefetchInternal();
            prefetchExternal();
        }, 2000);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            ScrollTrigger.refresh();
        }, 300);
    }, { passive: true });

    window.addEventListener('load', function () {
        requestAnimationFrame(function () {
            ScrollTrigger.refresh();
        });

        if (connection) {
            connection.addEventListener('change', function () {
                slowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' || connection.saveData;
                if (slowConnection && video) {
                    video.muted = true;
                    video.pause();
                    updateMuteUI();
                }
            });
        }
    });

    if ('PerformanceObserver' in window) {
        try {
            var lcpObserver = new PerformanceObserver(function () {});
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            var clsObserver = new PerformanceObserver(function () {});
            clsObserver.observe({ type: 'layout-shift', buffered: true });

            var inpObserver = new PerformanceObserver(function () {});
            inpObserver.observe({ type: 'interaction', buffered: true });
        } catch (e) {}
    }

    if ('serviceWorker' in navigator && !slowConnection) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
    }

    var scrollDirection = 'down';
    var lastScrollY = 0;

    lenis.on('scroll', function (e) {
        var currentY = e.scroll;
        scrollDirection = currentY > lastScrollY ? 'down' : 'up';
        lastScrollY = currentY;
    });

    document.querySelectorAll('.masonry-item, .dev-card, .collab-item').forEach(function (el) {
        el.style.contain = 'layout style paint';
    });

    document.querySelectorAll('.logos-wrap').forEach(function (el) {
        el.style.contain = 'layout style paint';
    });

    if ('requestIdleCallback' in window) {
        requestIdleCallback(function () {
            var masonryImages = document.querySelectorAll('.masonry-item img, .collab-item img');
            for (var i = 0; i < masonryImages.length; i++) {
                if (!masonryImages[i].hasAttribute('width') || !masonryImages[i].hasAttribute('height')) {
                    masonryImages[i].addEventListener('load', function () {
                        if (!this.hasAttribute('width')) this.setAttribute('width', this.naturalWidth);
                        if (!this.hasAttribute('height')) this.setAttribute('height', this.naturalHeight);
                    }, { once: true });
                }
            }
        });
    }

});
