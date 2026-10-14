const root = document.documentElement;
root.classList.add('is-js');
const messages = JSON.parse(document.body.dataset.messages || '{}');

// Navigation and content remain usable independently of animation.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
  if (returnFocus) menuButton?.focus();
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
const menuBreakpoint = matchMedia('(min-width: 901px)');
menuBreakpoint.addEventListener('change', () => closeMenu());

const stage = document.querySelector('.planet-stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = matchMedia('(pointer: coarse)');
// LottieFiles Premium: fast feedback, 400ms settle, 4s calm ambient cycle.
const motion = Object.freeze({ feedback: 90, followThrough: 180, settle: 400, ambient: 4000, maxShift: 18 });
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (a, b, amount) => a + (b - a) * amount;
let motionEnabled = !reducedMotion.matches;
let paths = [];
let sections = [];
let dirty = true;
let frame = 0;
let lastTime = 0;
let pointer = { x: 0, y: 0 };
let smoothPointer = { x: 0, y: 0 };
let pulse = 0;
let orbitPointer = { x: 0, y: 0 };
let orbitAngle = 0;
let smoothOrbitAngle = 0;
let previousScroll = scrollY;
let scrollEnergy = 0;
const reveals = [...document.querySelectorAll('[data-reveal]')];

function measure() {
  const y = window.scrollY;
  paths = [...document.querySelectorAll('[data-planet-dock]')].filter(dock => dock.offsetWidth && dock.offsetHeight).map((dock, index) => {
    let visual = dock.querySelector('.planet-stage');
    if (!visual) {
      visual = index === 0 ? stage : stage.cloneNode(true);
      dock.append(visual);
    }
    if (!dock.querySelector('.planet-interact')) {
      const interaction = document.createElement('button');
      interaction.type = 'button';
      interaction.className = 'planet-interact';
      interaction.setAttribute('aria-label', messages.planet || 'Faire réagir la planète');
      dock.append(interaction);
      const aim = event => {
        if (!motionEnabled || event.pointerType === 'mouse') return;
        const box = dock.getBoundingClientRect();
        pointer.x = clamp((event.clientX - box.left) / box.width * 2 - 1, -1, 1);
        pointer.y = clamp((event.clientY - box.top) / box.height * 2 - 1, -1, 1);
      };
      interaction.addEventListener('pointermove', aim, { passive: true });
      interaction.addEventListener('pointerdown', event => { aim(event); if (motionEnabled) pulse = 1; }, { passive: true });
      const release = () => { pointer = { x: 0, y: 0 }; };
      interaction.addEventListener('pointerup', release);
      interaction.addEventListener('pointercancel', release);
      interaction.addEventListener('pointerleave', release);
      interaction.addEventListener('blur', release);
      interaction.addEventListener('click', () => { if (motionEnabled) { pulse = 1; orbitAngle += 24; requestTick(); } });
    }
    visual.dataset.surface = dock.closest('.light-section') ? 'light' : 'dark';
    const rect = dock.getBoundingClientRect();
    const size = Math.max(1, Math.min(Number(dock.dataset.size) || 200, rect.width - 64, rect.height - 64));
    // Compensate for scene scaling so orbital lines remain legible on mobile.
    visual.style.setProperty('--orbit-unit', `${560 / size}px`);
    return {
      dock,
      visual,
      x: rect.left + rect.width / 2,
      docY: rect.top + y + rect.height / 2,
      width: rect.width,
      height: rect.height,
      size,
    };
  });
  sections = [...document.querySelectorAll('section[data-scene]')].map(section => ({ element: section, top: section.getBoundingClientRect().top + y }));
  dirty = false;
}

// Keep every rendered frame inside a reserved visual area. Never fly over copy.
function targetForScroll() {
  if (!paths.length) return null;
  const visible = paths.filter(path => path.docY + path.height / 2 > scrollY + 90 && path.docY - path.height / 2 < scrollY + innerHeight);
  const current = visible.reduce((nearest, path) => {
    const distance = Math.abs(path.docY - scrollY - innerHeight * .55);
    return !nearest || distance < nearest.distance ? { path, distance } : nearest;
  }, null)?.path || paths[0];
  return { dock: current.dock, x: current.width / 2, y: current.height / 2, size: current.size, docY: current.docY };
}

function updateScene(target) {
  const active = sections.filter(s => s.top <= scrollY + innerHeight * .42).at(-1) || sections[0];
  if (active) stage.dataset.scene = active.element.dataset.scene;
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    if (active?.element.id && link.hash === `#${active.element.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function renderStatic() {
  if (dirty) measure();
  paths.forEach(path => {
    path.visual.style.transform = `translate3d(${path.width / 2 - 280}px, ${path.height / 2 - 280}px, 0) scale(${path.size / 560})`;
    path.visual.style.setProperty('--px', '0');
    path.visual.style.setProperty('--py', '0');
    path.visual.style.setProperty('--spin', '0deg');
    path.visual.style.setProperty('--orbit-turn', '0deg');
    path.visual.style.setProperty('--orbit-x', '0');
    path.visual.style.setProperty('--orbit-y', '0');
    path.visual.style.setProperty('--energy', '1');
    path.visual.style.opacity = '1';
  });
}

function animate(time) {
  frame = 0;
  if (!motionEnabled || document.hidden || !stage || !paths.length) return;
  if (time - lastTime < 16) { requestTick(); return; }
  const elapsed = Math.min(time - lastTime || 32, 80);
  lastTime = time;
  const scrollChanged = scrollY !== previousScroll;
  const needsSceneUpdate = dirty || scrollChanged;
  if (dirty) measure();
  const target = targetForScroll();
  if (!target) return;
  const amount = 1 - Math.exp(-elapsed / motion.feedback);
  const secondaryAmount = 1 - Math.exp(-elapsed / motion.followThrough);
  orbitPointer.x = mix(orbitPointer.x, smoothPointer.x, secondaryAmount);
  orbitPointer.y = mix(orbitPointer.y, smoothPointer.y, secondaryAmount);
  smoothPointer.x = mix(smoothPointer.x, pointer.x, amount);
  smoothPointer.y = mix(smoothPointer.y, pointer.y, amount);
  pulse *= Math.exp(-elapsed / motion.settle);
  const drift = Math.sin(time / motion.ambient * Math.PI * 2) * 3;
  const sway = Math.cos(time / (motion.ambient * 1.3) * Math.PI * 2) * 2;
  const px = coarsePointer.matches ? 0 : smoothPointer.x * motion.maxShift;
  const py = coarsePointer.matches ? 0 : smoothPointer.y * motion.maxShift * .7;
  orbitAngle += clamp(scrollY - previousScroll, -120, 120) * .18;
  scrollEnergy = mix(scrollEnergy, clamp((scrollY - previousScroll) / 25, -1, 1), amount);
  previousScroll = scrollY;
  smoothOrbitAngle = mix(smoothOrbitAngle, orbitAngle, secondaryAmount);
  // Each dock owns its visual: choosing a new scene cannot empty the hero.
  paths.forEach(path => {
    if (path.docY + path.height / 2 < scrollY || path.docY - path.height / 2 > scrollY + innerHeight) return;
    path.visual.style.transform = `translate3d(${path.width / 2 - 280 + px + sway}px, ${path.height / 2 - 280 + py + drift}px, 0) scale(${path.size / 560})`;
    path.visual.style.setProperty('--px', String(smoothPointer.x));
    path.visual.style.setProperty('--py', String(clamp(smoothPointer.y + scrollEnergy * .8, -1, 1)));
    path.visual.style.setProperty('--orbit-x', String(orbitPointer.x));
    path.visual.style.setProperty('--orbit-y', String(orbitPointer.y));
    path.visual.style.setProperty('--orbit-turn', `${smoothOrbitAngle + Math.sin(time / 6000) * 8}deg`);
    path.visual.style.setProperty('--spin', `${smoothPointer.x * 4 + scrollEnergy * 9}deg`);
    path.visual.style.setProperty('--energy', String(1 + pulse * .05));
  });
  if (needsSceneUpdate) updateScene(target);
  requestTick();
}

function requestTick() {
  if (motionEnabled && !document.hidden && !frame) frame = requestAnimationFrame(animate);
}

function showReveals() {
  reveals.forEach(element => element.classList.remove('reveal-pending'));
}

function applyMotionPreference(reduce) {
  motionEnabled = !reduce;
  root.dataset.motion = reduce ? 'off' : 'on';
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  dirty = true;
  pointer = { x: 0, y: 0 };
  smoothPointer = { x: 0, y: 0 };
  orbitPointer = { x: 0, y: 0 };
  pulse = 0;
  paths.forEach(path => { path.dock.querySelector('.planet-interact').disabled = reduce; });
  if (!reduce) {
    requestTick();
  } else {
    if (!paths.length) measure();
    showReveals();
    renderStatic();
  }
}

if (stage && document.querySelectorAll('[data-planet-dock]').length) {
  measure();
  applyMotionPreference(reducedMotion.matches);
  window.addEventListener('resize', () => {
    dirty = true;
    if (motionEnabled) requestTick(); else renderStatic();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else { dirty = true; lastTime = 0; requestTick(); }
  });
  reducedMotion.addEventListener('change', event => applyMotionPreference(event.matches));
  document.querySelectorAll('[data-planet-react]').forEach(element => {
    element.addEventListener('focusin', () => { if (motionEnabled) pulse = 1; });
    element.addEventListener('pointerdown', () => { if (motionEnabled) pulse = 1; }, { passive: true });
    element.addEventListener('click', () => { if (motionEnabled) pulse = 1; });
  });
  // Recalculate the trajectory when fonts or content change the document height.
  if ('ResizeObserver' in window) new ResizeObserver(() => { dirty = true; if (motionEnabled) requestTick(); else renderStatic(); }).observe(document.querySelector('main'));
}

if ('IntersectionObserver' in window && motionEnabled) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-ready');
        requestAnimationFrame(() => entry.target.classList.remove('reveal-pending'));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -15px 0px' });
  reveals.forEach(element => {
    if (element.getBoundingClientRect().top > innerHeight) element.classList.add('reveal-pending');
    observer.observe(element);
  });
}

// Send the enquiry through the same-origin contact endpoint.
const form = document.querySelector('#project-form');
const result = document.querySelector('#brief-result');
if (form && result) {
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = false;
  const status = document.querySelector('#contact-status');
  let pending = false;
  let requestId = null;
  let previousPayload = null;
  document.querySelectorAll('[data-project]').forEach(link => link.addEventListener('click', () => {
    const select = form.querySelector('#project');
    const projects = { launch: 'website', redesign: 'redesign', build: 'custom' };
    select.value = projects[link.dataset.project] || 'explore';
  }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const data = new FormData(form);
    const payload = Object.fromEntries(['name', 'email', 'project', 'message', 'company'].map(key => [key, String(data.get(key) || '').trim()]));
    payload.locale = document.body.dataset.locale;
    const serialized = JSON.stringify(payload);
    if (serialized !== previousPayload || !requestId) requestId = crypto.randomUUID();
    previousPayload = serialized;
    pending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.textContent = messages.sending;
    status.textContent = '';
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, requestId }), signal: AbortSignal.timeout(20000) });
      const outcome = await response.json().catch(() => ({}));
      if (!response.ok || outcome.ok !== true || outcome.code !== 'sent') {
        status.textContent = response.status === 429 ? messages.rateLimited : response.status === 400 ? messages.invalid : messages.sendFailed;
        return;
      }
      form.hidden = true;
      result.hidden = false;
      result.querySelector('h3').setAttribute('tabindex', '-1');
      result.querySelector('h3').focus({ preventScroll: true });
    } catch { status.textContent = messages.sendFailed; }
    finally {
      pending = false;
      submit.disabled = false;
      submit.textContent = messages.sendButton;
      form.removeAttribute('aria-busy');
    }
  });
  document.querySelector('#new-message').addEventListener('click', () => {
    result.hidden = true;
    form.hidden = false;
    form.reset();
    status.textContent = '';
    requestId = null;
    previousPayload = null;
    form.querySelector('#name').focus({ preventScroll: true });
  });
}
