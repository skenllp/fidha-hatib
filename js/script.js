(function () {
'use strict';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tapBtn = $('#tapBtn');
const hint = $('#scrollHint');

/* ------------------------------------------------------------------ */
/* Cover — slow, staggered reveal (hosts, names, date)              */
/* ------------------------------------------------------------------ */
function buildCoverTimeline() {
  gsap.set('.cn, .cover-date', { autoAlpha: 0, y: 14 });
  gsap.set('.cn-amp', { autoAlpha: 0 });
  gsap.set(tapBtn, { autoAlpha: 0 });
  gsap.set(hint, { autoAlpha: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, delay: 0.3 });
  tl.to('.cn', { autoAlpha: 1, y: 0, duration: 1.8, stagger: 0.55 }, 0.3)
    .to('.cn-amp', { autoAlpha: 1, duration: 1.6 }, 0.7)
    .to('.cover-date', { autoAlpha: 1, y: 0, duration: 1.8 }, 1.8)
    .to(tapBtn, { autoAlpha: 1, duration: 1.4 }, 2.8)
    .to(hint, { autoAlpha: 1, duration: 1.6 }, 3.2);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Music — starts from the very first tap on "Open Invitation"         */
/* (browsers only allow sound after a user gesture)                    */
/* ------------------------------------------------------------------ */
const bgm = $('#bgm');
const musicBtn = $('#musicBtn');
const MUSIC_VOL = 0.7;
let musicWanted = false;

function setMusicUi(on) {
  musicBtn.setAttribute('aria-pressed', String(on));
  musicBtn.setAttribute('aria-label', on ? 'Turn the music off' : 'Turn the music on');
}
function playMusic() {
  musicWanted = true;
  setMusicUi(true);
  bgm.volume = 0;
  const p = bgm.play();
  const fade = () => gsap.to(bgm, { volume: MUSIC_VOL, duration: 2.5, ease: 'power1.out' });
  if (p && p.then) p.then(fade).catch(() => { musicWanted = false; setMusicUi(false); });
  else fade();
}
function pauseMusic() {
  musicWanted = false;
  setMusicUi(false);
  gsap.to(bgm, { volume: 0, duration: 0.5, onComplete: () => bgm.pause() });
}
musicBtn.addEventListener('click', () => (musicWanted ? pauseMusic() : playMusic()));
// Pause when the tab/app is hidden, resume when the guest comes back
document.addEventListener('visibilitychange', () => {
  if (document.hidden) bgm.pause();
  else if (musicWanted) bgm.play().catch(() => {});
});

/* ------------------------------------------------------------------ */
/* Open Invitation tap starts the music (browsers need a user gesture) */
/* Scroll hint jumps to the invitation                                 */
/* ------------------------------------------------------------------ */
hint.addEventListener('click', () => {
  $('#invite').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
});
function openInvitation() {
  gsap.to(tapBtn, { autoAlpha: 0, duration: 0.8, onComplete: () => { tapBtn.style.visibility = 'hidden'; tapBtn.style.pointerEvents = 'none'; } });
  musicBtn.hidden = false;
  playMusic();
  $('#invite').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
tapBtn.addEventListener('click', openInvitation);

/* ------------------------------------------------------------------ */
/* Countdown to 28 Dec 2026, 5:00 PM IST                               */
/* ------------------------------------------------------------------ */
(function countdown() {
  const target = new Date('2026-12-28T17:00:00+05:30').getTime();
  const el = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
  const box = $('#count'), done = $('#countDone');
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { box.classList.add('is-done'); done.hidden = false; return false; }
    const t = Math.floor(diff / 1000);
    el.d.textContent = pad(Math.floor(t / 86400));
    el.h.textContent = pad(Math.floor(t % 86400 / 3600));
    el.m.textContent = pad(Math.floor(t % 3600 / 60));
    el.s.textContent = pad(t % 60);
    return true;
  }
  if (tick()) { const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000); }
})();

/* ------------------------------------------------------------------ */
/* Sections — slow, restrained scroll reveals                          */
/* ------------------------------------------------------------------ */
function initScroll() {
  if (reduce) return;

  $$('[data-group]').forEach((group) => {
    const items = $$('.rv', group);
    if (!items.length) return;
    const dur = parseFloat(group.dataset.dur) || 1.6;
    const stagger = parseFloat(group.dataset.stagger) || 0.35;
    gsap.set(items, { autoAlpha: 0, y: 18 });
    gsap.to(items, {
      autoAlpha: 1, y: 0, duration: dur, stagger, ease: 'power2.out',
      scrollTrigger: { trigger: group, start: 'top 82%', once: true },
    });
  });
  $$('[data-fade]').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: 18 });
    gsap.to(el, { autoAlpha: 1, y: 0, duration: 1.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
function boot() {
  initScroll();
  setMusicUi(false);
  if (reduce) { tapBtn.style.visibility = 'hidden'; tapBtn.style.pointerEvents = 'none'; musicBtn.hidden = false; gsap.set(hint, { autoAlpha: 1 }); return; }
  buildCoverTimeline();
}

if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
boot();

})();
