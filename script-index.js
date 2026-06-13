const lenis = new Lenis({
    duration: 1.45,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const nav = document.getElementById('nav');
lenis.on('scroll', ({ scroll }) => nav.classList.toggle('scrolled', scroll > 48));

const video    = document.getElementById('heroBg');
const muteBtn  = document.getElementById('muteBtn');
const muteIcon = document.getElementById('muteIcon');

let audioUnlocked = false;

function tryUnmute() {
    if (audioUnlocked) return;
    video.muted = false;
    video.volume = 1;
    video.play().then(() => {
        audioUnlocked = true;
        muteIcon.className = 'fa-solid fa-volume-high';
    }).catch(() => {
        video.muted = true;
        muteIcon.className = 'fa-solid fa-volume-xmark';
    });
}

function ensurePlaying() {
    if (video.paused && !document.hidden) {
        video.play().catch(() => {});
    }
}

video.addEventListener('pause', ensurePlaying);
video.addEventListener('ended', ensurePlaying);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensurePlaying();
});

['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
    document.addEventListener(evt, tryUnmute, { once: true, passive: true });
});

muteBtn.addEventListener('click', () => {
    audioUnlocked = true;
    video.muted = !video.muted;
    if (!video.muted) video.volume = 1;
    muteIcon.className = video.muted
        ? 'fa-solid fa-volume-xmark'
        : 'fa-solid fa-volume-high';
    if (video.paused) video.play().catch(() => {});
});

video.play().then(() => {
    video.muted = false;
    video.volume = 1;
    audioUnlocked = true;
    muteIcon.className = 'fa-solid fa-volume-high';
}).catch(() => {
    video.muted = true;
    muteIcon.className = 'fa-solid fa-volume-xmark';
});

const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
tl.to('#heroTitle .li',  { y: 0, duration: 1.25, stagger: .13, delay: .2 })
  .to('.hero-sub',       { opacity: 1, y: 0, duration: 1 }, '-=.7')
  .to('.hero-card',      { opacity: 1, y: 0, duration: 1 }, '-=.65')
  .to('#scrollHint',     { opacity: 1, duration: 1 },       '-=.5')
  .to('.ticker-wrap',    { opacity: 1, duration: 1 },       '-=.4')
  .to('.video-mute-btn', { opacity: 1, duration: .6 },      '-=.8');

lenis.on('scroll', ({ scroll }) => {
    if (scroll > 100) gsap.to('#scrollHint', { opacity: 0, duration: .4 });
});

document.querySelectorAll('.rw').forEach(el => {
    const inner = el.querySelector('.ri');
    if (!inner) return;
    gsap.to(inner, {
        y: 0, duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
    });
});

document.querySelectorAll('.fu').forEach((el, i) => {
    gsap.to(el, {
        opacity: 1, y: 0, duration: .85, ease: 'power3.out',
        delay: (i % 4) * .055,
        scrollTrigger: { trigger: el, start: 'top 93%', toggleActions: 'play none none none' }
    });
});

document.querySelectorAll('.cta-line-1 .ri, .cta-line-2 .ri').forEach((el, i) => {
    gsap.to(el, {
        y: 0, duration: 1.15, ease: 'power4.out', delay: i * .13,
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' }
    });
});

gsap.utils.toArray('.masonry-item img, .collab-item img').forEach(img => {
    gsap.fromTo(img,
        { yPercent: -6 },
        { yPercent: 6, ease: 'none',
          scrollTrigger: {
              trigger: img.closest('.masonry-item, .collab-item'),
              start: 'top bottom', end: 'bottom top', scrub: true
          }
        }
    );
});

gsap.utils.toArray('.sl').forEach(el => {
    gsap.fromTo(el, { x: -40 }, {
        x: 0, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 2 }
    });
});
