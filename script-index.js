document.addEventListener('DOMContentLoaded', function () {

    const lenis = new Lenis({
        duration: 1.45,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
    });

    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    const nav = document.getElementById('nav');
    lenis.on('scroll', function (e) {
        nav.classList.toggle('scrolled', e.scroll > 48);
    });

    const video    = document.getElementById('heroBg');
    const muteBtn  = document.getElementById('muteBtn');
    const muteIcon = document.getElementById('muteIcon');
    let audioUnlocked = false;

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
        }).catch(function () {
            video.muted = true;
            muteIcon.className = 'fa-solid fa-volume-xmark';
        });
    }

    video.addEventListener('pause', ensurePlaying);
    video.addEventListener('ended', ensurePlaying);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) ensurePlaying();
    });

    ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (evt) {
        document.addEventListener(evt, tryUnmute, { once: true, passive: true });
    });

    muteBtn.addEventListener('click', function () {
        audioUnlocked = true;
        video.muted = !video.muted;
        if (!video.muted) video.volume = 1;
        muteIcon.className = video.muted
            ? 'fa-solid fa-volume-xmark'
            : 'fa-solid fa-volume-high';
        if (video.paused) video.play().catch(function () {});
    });

    video.play().then(function () {
        video.muted = false;
        video.volume = 1;
        audioUnlocked = true;
        muteIcon.className = 'fa-solid fa-volume-high';
    }).catch(function () {
        video.muted = true;
        muteIcon.className = 'fa-solid fa-volume-xmark';
    });

    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('#heroTitle .li',  { y: 0, duration: 1.25, stagger: 0.13, delay: 0.2 })
      .to('.hero-sub',       { opacity: 1, y: 0, duration: 1 }, '-=.7')
      .to('.hero-card',      { opacity: 1, y: 0, duration: 1 }, '-=.65')
      .to('#scrollHint',     { opacity: 1, duration: 1 },       '-=.5')
      .to('.ticker-wrap',    { opacity: 1, duration: 1 },       '-=.4')
      .to('.video-mute-btn', { opacity: 1, duration: 0.6 },     '-=.8');

    lenis.on('scroll', function (e) {
        if (e.scroll > 100) {
            gsap.to('#scrollHint', { opacity: 0, duration: 0.4 });
        }
    });

    document.querySelectorAll('.rw').forEach(function (el) {
        var inner = el.querySelector('.ri');
        if (!inner) return;
        gsap.to(inner, {
            y: 0,
            duration: 1.1,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        });
    });

    document.querySelectorAll('.fu').forEach(function (el, i) {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            delay: (i % 4) * 0.055,
            scrollTrigger: {
                trigger: el,
                start: 'top 93%',
                toggleActions: 'play none none none'
            }
        });
    });

    document.querySelectorAll('.cta-line-1 .ri, .cta-line-2 .ri').forEach(function (el, i) {
        gsap.to(el, {
            y: 0,
            duration: 1.15,
            ease: 'power4.out',
            delay: i * 0.13,
            scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                toggleActions: 'play none none none'
            }
        });
    });

    gsap.utils.toArray('.masonry-item img, .collab-item img').forEach(function (img) {
        gsap.fromTo(img,
            { yPercent: -6 },
            {
                yPercent: 6,
                ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.masonry-item, .collab-item'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    });

    gsap.utils.toArray('.sl').forEach(function (el) {
        gsap.fromTo(el,
            { x: -40 },
            {
                x: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: el,
                    start: 'top bottom',
                    end: 'center center',
                    scrub: 2
                }
            }
        );
    });

});
