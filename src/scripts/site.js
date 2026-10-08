const root = document.documentElement;
root.classList.add('is-js');

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
const control = document.querySelector('.motion-control');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 620px)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (a, b, amount) => a + (b - a) * amount;
const ease = value => value * value * (3 - 2 * value);
let savedMotion = null;
try { savedMotion = localStorage.getItem('ahelis-motion'); } catch { /* Storage is optional. */ }
let motionEnabled = !reducedMotion.matches && savedMotion !== 'off';
let paths = [];
let sections = [];
let lightAreas = [];
let dirty = true;
let frame = 0;
let lastTime = 0;
let pointer = { x: 0, y: 0 };
let smoothPointer = { x: 0, y: 0 };
let pose = null;
let pausedDock = null;
let pulse = 0;
const reveals = [...document.querySelectorAll('[data-reveal]')];

function measure() {
  const y = window.scrollY;
  paths = [...document.querySelectorAll('[data-planet-dock]')].filter(dock => dock.offsetWidth && dock.offsetHeight).map(dock => {
    const rect = dock.getBoundingClientRect();
    const section = dock.closest('section');
    const sectionRect = section?.getBoundingClientRect();
    return {
      dock,
      x: rect.left + rect.width / 2,
      docY: rect.top + y + rect.height / 2,
      stop: Math.max(0, (sectionRect?.top || 0) + y - innerHeight * .22),
      size: Math.min(Number(dock.dataset.size) || 200, innerWidth < 901 ? rect.width * 1.28 : 560),
    };
  }).sort((a, b) => a.stop - b.stop);
  if (paths[0]) paths[0].stop = 0;
  sections = [...document.querySelectorAll('section[data-scene]')].map(section => ({ element: section, top: section.getBoundingClientRect().top + y }));
  lightAreas = [...document.querySelectorAll('.light-section')].map(section => {
    const rect = section.getBoundingClientRect();
    return { top: rect.top + y, bottom: rect.bottom + y };
  });
  dirty = false;
}

function targetForScroll() {
  if (!paths.length) return null;
  const scroll = window.scrollY;
  if (mobile.matches) {
    const first = paths[0];
    const hero = document.querySelector('.hero');
    const progress = clamp(scroll / Math.max(1, (hero?.offsetHeight || 900) * .7), 0, 1);
    const amount = ease(progress);
    return {
      x: mix(first.x, innerWidth - 34, amount),
      y: mix(first.docY - scroll, innerHeight - 34, amount),
      size: mix(Math.min(innerWidth - 36, 360), 65, amount),
    };
  }
  let start = paths[0];
  let end = start;
  for (let i = 0; i < paths.length - 1; i++) {
    if (scroll >= paths[i].stop) { start = paths[i]; end = paths[i + 1]; }
  }
  if (scroll >= paths.at(-1).stop) start = end = paths.at(-1);
  const amount = end.stop === start.stop ? 0 : ease(clamp((scroll - start.stop) / (end.stop - start.stop), 0, 1));
  const topMargin = 130;
  const endY = clamp(end.docY - end.stop, topMargin, innerHeight - 130);
  const startY = clamp(start.docY - start.stop, topMargin, innerHeight - 130);
  return { x: mix(start.x, end.x, amount), y: mix(startY, endY, amount), size: mix(start.size, end.size, amount) };
}

function updateScene(target) {
  const active = sections.filter(s => s.top <= scrollY + innerHeight * .42).at(-1) || sections[0];
  if (active) stage.dataset.scene = active.element.dataset.scene;
  const inLight = lightAreas.some(area => scrollY + target.y >= area.top && scrollY + target.y < area.bottom);
  stage.dataset.surface = inLight ? 'light' : 'dark';
  const alpha = document.querySelector('.site-footer')?.getBoundingClientRect().top < innerHeight * .42 ? '.25' : '1';
  stage.style.opacity = alpha;
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    if (active?.element.id && link.hash === `#${active.element.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function renderPaused() {
  if (dirty) measure();
  const current = paths.find(path => path.dock === pausedDock) || paths[0];
  if (!current || !stage) return;
  stage.style.position = 'absolute';
  const size = mobile.matches ? Math.min(innerWidth - 40, 360) : current.size;
  stage.style.transform = `translate3d(${current.x - 280}px, ${current.docY - 280}px, 0) scale(${size / 560})`;
  stage.style.setProperty('--px', '0');
  stage.style.setProperty('--py', '0');
  stage.style.setProperty('--spin', '0deg');
  stage.style.setProperty('--energy', '1');
  stage.style.opacity = '1';
}

function animate(time) {
  frame = 0;
  if (!motionEnabled || document.hidden || !stage || !paths.length) return;
  if (time - lastTime < 32) { requestTick(); return; }
  const elapsed = Math.min(time - lastTime || 32, 80);
  lastTime = time;
  const needsSceneUpdate = dirty;
  if (dirty) measure();
  const target = targetForScroll();
  if (!target) return;
  if (!pose) pose = { ...target };
  const amount = 1 - Math.exp(-elapsed / 150);
  pose.x = mix(pose.x, target.x, amount);
  pose.y = mix(pose.y, target.y, amount);
  pose.size = mix(pose.size, target.size, amount);
  smoothPointer.x = mix(smoothPointer.x, pointer.x, amount);
  smoothPointer.y = mix(smoothPointer.y, pointer.y, amount);
  pulse *= Math.exp(-elapsed / 360);
  const drift = Math.sin(time / 2800) * (mobile.matches ? 2 : 6);
  const px = smoothPointer.x * (mobile.matches ? 2 : 14);
  const py = smoothPointer.y * (mobile.matches ? 2 : 10);
  stage.style.position = 'fixed';
  stage.style.transform = `translate3d(${pose.x - 280 + px}px, ${pose.y - 280 + py + drift}px, 0) scale(${pose.size / 560})`;
  stage.style.setProperty('--px', String(smoothPointer.x));
  stage.style.setProperty('--py', String(smoothPointer.y));
  stage.style.setProperty('--spin', `${scrollY / 100 + Math.sin(time / 8500) * 4}deg`);
  stage.style.setProperty('--energy', String(1 + pulse * .05));
  if (needsSceneUpdate) updateScene(target);
  requestTick();
}

function requestTick() {
  if (motionEnabled && !document.hidden && !frame) frame = requestAnimationFrame(animate);
}

function showReveals() {
  reveals.forEach(element => element.classList.remove('reveal-pending'));
}

function setMotion(enabled, persist = false) {
  motionEnabled = enabled;
  root.dataset.motion = enabled ? 'on' : 'off';
  control?.setAttribute('aria-pressed', String(enabled));
  control?.setAttribute('aria-label', enabled ? 'Mettre les animations en pause' : 'Activer les animations');
  const label = control?.querySelector('.motion-label');
  if (label) label.textContent = enabled ? 'Animations' : 'En pause';
  if (persist) try { localStorage.setItem('ahelis-motion', enabled ? 'on' : 'off'); } catch { /* Without storage, the preference applies to this page only. */ }
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  dirty = true;
  if (enabled) {
    pose = null;
    requestTick();
  } else {
    if (!paths.length) measure();
    pausedDock = mobile.matches ? paths[0]?.dock : paths.filter(p => p.stop <= scrollY).at(-1)?.dock;
    showReveals();
    renderPaused();
  }
}

if (stage && document.body.dataset.page !== 'document') {
  measure();
  control.hidden = false;
  setMotion(motionEnabled);
  control.addEventListener('click', () => setMotion(!motionEnabled, true));
  window.addEventListener('scroll', () => { dirty = true; requestTick(); }, { passive: true });
  window.addEventListener('resize', () => {
    dirty = true;
    if (motionEnabled) requestTick(); else renderPaused();
  }, { passive: true });
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !motionEnabled) return;
    pointer.x = clamp(event.clientX / innerWidth * 2 - 1, -1, 1);
    pointer.y = clamp(event.clientY / innerHeight * 2 - 1, -1, 1);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else { dirty = true; lastTime = 0; requestTick(); }
  });
  reducedMotion.addEventListener('change', event => { if (event.matches) setMotion(false); });
  document.querySelectorAll('[data-planet-react]').forEach(element => {
    element.addEventListener('pointerenter', () => { if (motionEnabled) pulse = 1; });
    element.addEventListener('focusin', () => { if (motionEnabled) pulse = 1; });
    element.addEventListener('click', () => { if (motionEnabled) pulse = 2; });
  });
  // Recalculate the trajectory when fonts or content change the document height.
  if ('ResizeObserver' in window) new ResizeObserver(() => { dirty = true; if (motionEnabled) requestTick(); else renderPaused(); }).observe(document.querySelector('main'));
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

// Prepare the brief locally. The visitor controls the eventual email submission.
const form = document.querySelector('#project-form');
const result = document.querySelector('#brief-result');
if (form && result) {
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = false;
  const briefText = document.querySelector('#brief-text');
  const status = document.querySelector('#brief-status');
  document.querySelectorAll('[data-project]').forEach(link => link.addEventListener('click', () => {
    const select = form.querySelector('#project');
    const projects = { launch: 'Un site web', redesign: 'Une refonte', build: 'Une application sur mesure' };
    select.value = projects[link.dataset.project] || 'Une idée à explorer';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const project = String(data.get('project')).trim();
    const message = String(data.get('message')).trim();
    const text = `Bonjour Ahelis Lab,\n\nJe souhaite échanger au sujet de : ${project.toLowerCase()}.\n\n${message}\n\n${name}\n${email}`;
    briefText.value = text;
    const compose = document.querySelector('#compose-email');
    if (compose) compose.href = `mailto:${document.body.dataset.contactEmail}?subject=${encodeURIComponent(`Projet — ${project}`)}&body=${encodeURIComponent(text)}`;
    form.hidden = true;
    result.hidden = false;
    result.querySelector('h3').setAttribute('tabindex', '-1');
    result.querySelector('h3').focus({ preventScroll: true });
    status.textContent = '';
  });
  document.querySelector('#edit-brief').addEventListener('click', () => {
    result.hidden = true;
    form.hidden = false;
    form.querySelector('#message').focus({ preventScroll: true });
  });
  document.querySelector('#copy-brief').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(briefText.value);
      status.textContent = 'Message copié. Aucun message n’a été envoyé.';
    } catch {
      briefText.focus();
      briefText.select();
      status.textContent = 'Sélectionnez et copiez le texte ci-dessus. Aucun message n’a été envoyé.';
    }
  });
}
