import { $, rand, storage, restartAnimation } from './dom.js';
import { playEpicSlap, playHorn, playSlap } from './sounds.js';

const episodeEl = $('episode');
const codeEl = $('code');
const watchedBtn = $('watched');
const tieEl = $('tie');
const hornBtn = $('horn');
const pipsEl = $('pips');

const umbrellaUrl = 'img/umbrella.svg';
const tieUrl = 'img/tie.png';

let enabled = () => false;
let slappedHere = false;
let lastTap = 0;
let drag = null;

export function initEggs(isEnabled) {
    enabled = isEnabled;
    tieEl.src = tieUrl;
    hornBtn.innerHTML = '<img src="img/horn.png" alt="" draggable="false">';
    pipsEl.replaceChildren(...Array.from({ length: 5 }, () =>
        Object.assign(document.createElement('span'), { className: 'pip' })));

    episodeEl.addEventListener('click', onEpisodeClick);
    codeEl.addEventListener('pointerdown', grabWornTie);
    tieEl.addEventListener('pointerdown', startDrag);
    tieEl.addEventListener('pointermove', moveDrag);
    tieEl.addEventListener('pointerup', e => endDrag(e, true));
    tieEl.addEventListener('pointercancel', e => endDrag(e, false));
    hornBtn.onclick = toot;
    addEventListener('resize', () => {
        keepInView(tieEl);
        keepInView(hornBtn);
    });
}

export function clearEggs() {
    tieEl.hidden = true;
    hornBtn.hidden = true;
    slappedHere = false;
    syncPips();
}

export function rollProps() {
    if (!enabled()) return;
    if (Math.random() < .2) place(tieEl);
    if (Math.random() < .2) place(hornBtn);
}

export function celebrateWatched(count) {
    if (enabled()) rain(count);
}

function syncPips() {
    const slaps = Number(storage.get('slaps')) || 0;
    const wasShown = pipsEl.classList.contains('show');
    pipsEl.classList.toggle('instant', !wasShown);
    [...pipsEl.children].forEach((pip, i) => pip.classList.toggle('on', i < slaps));
    void pipsEl.offsetWidth;
    pipsEl.classList.remove('instant');
    pipsEl.classList.toggle('show', enabled() && slappedHere && slaps > 0);
}

const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

function place(el) {
    el.hidden = false;
    el.style.transform = '';
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const margin = 16;
    const maxX = Math.max(margin, innerWidth - width - margin);
    const maxY = Math.max(margin, innerHeight - height - margin);
    const busyZones = [...document.querySelectorAll('main > *, .prop:not([hidden])')]
        .filter(node => node !== el)
        .map(node => node.getBoundingClientRect());
    let x = margin;
    let y = margin;
    for (let attempt = 0; attempt < 40; attempt++) {
        x = rand(margin, maxX);
        y = rand(margin, maxY);
        const box = { left: x - 8, top: y - 8, right: x + width + 8, bottom: y + height + 8 };
        if (!busyZones.some(zone => overlaps(box, zone))) break;
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
}

function keepInView(el) {
    if (el.hidden) return;
    el.style.left = `${Math.max(16, Math.min(parseFloat(el.style.left), innerWidth - el.offsetWidth - 16))}px`;
    el.style.top = `${Math.max(16, Math.min(parseFloat(el.style.top), innerHeight - el.offsetHeight - 16))}px`;
}

function spawnUmbrella(x, y, size) {
    const el = document.createElement('img');
    el.src = umbrellaUrl;
    el.className = 'particle';
    el.style.width = `${size}px`;
    el.style.left = `${x - size / 2}px`;
    el.style.top = `${y - size / 2}px`;
    document.body.append(el);
    return el;
}

function burst(x, y) {
    for (let i = 0; i < 14; i++) {
        const el = spawnUmbrella(x, y, rand(30, 48));
        const angle = rand(-Math.PI * .9, -Math.PI * .1);
        const dist = rand(80, 170);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const spin = rand(-240, 240);
        el.animate([
            { transform: 'translate(0, 0) rotate(0) scale(.4)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${spin / 2}deg) scale(1)`, opacity: 1, offset: .45 },
            { transform: `translate(${dx * 1.3}px, ${dy + 220}px) rotate(${spin}deg) scale(.9)`, opacity: 0 }
        ], { duration: rand(2000, 2800), easing: 'cubic-bezier(.25, .6, .45, 1)' }).onfinish = () => el.remove();
    }
}

function rain(count) {
    const total = Math.min(Math.max(count, 1), 300);
    const spread = Math.min(total * 40, 3000);
    for (let i = 0; i < total; i++) {
        setTimeout(() => {
            const el = spawnUmbrella(rand(0, innerWidth), -40, rand(34, 56));
            const sway = rand(-60, 60);
            el.animate([
                { transform: 'translate(0, 0) rotate(-10deg)', opacity: 0 },
                { transform: `translate(${sway / 2}px, ${innerHeight * .3}px) rotate(10deg)`, opacity: 1, offset: .2 },
                { transform: `translate(${sway}px, ${innerHeight + 60}px) rotate(-10deg)`, opacity: .9 }
            ], { duration: rand(2200, 3200), easing: 'ease-in' }).onfinish = () => el.remove();
        }, rand(0, spread));
    }
}

function slap() {
    const slaps = (Number(storage.get('slaps')) || 0) % 5 + 1;
    storage.set('slaps', slaps);
    const impact = slaps === 5 ? playEpicSlap() : playSlap();
    setTimeout(() => {
        slappedHere = true;
        syncPips();
        restartAnimation(episodeEl, 'shake');
        $('title').animate([{ color: 'var(--red)' }, { color: 'var(--fg)' }], { duration: 500 });
    }, impact);
}

function toot() {
    playHorn();
    restartAnimation(hornBtn, 'toot');
    const horn = hornBtn.getBoundingClientRect();
    const toRight = horn.left < innerWidth / 2 ? 1 : -1;
    for (let i = 0; i < 3; i++) {
        const note = Object.assign(document.createElement('span'), { className: 'note', textContent: '♪' });
        note.style.left = `${horn.left + horn.width * .8}px`;
        note.style.top = `${horn.top}px`;
        document.body.append(note);
        note.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${toRight * rand(20, 70)}px, ${rand(-60, -30)}px)`, opacity: 0 }
        ], { duration: 900, delay: i * 120, easing: 'ease-out', fill: 'backwards' }).onfinish = () => note.remove();
    }
}

function onEpisodeClick(e) {
    if (!enabled() || watchedBtn.hidden || e.target.closest('#watched, .worn-tie')) return;
    if (e.target.closest('#code')) {
        burst(e.clientX, e.clientY);
        return;
    }
    const now = Date.now();
    if (now - lastTap < 350) {
        slap();
        lastTap = 0;
    } else {
        lastTap = now;
    }
}

function overCode(e) {
    const r = codeEl.getBoundingClientRect();
    const pad = 40;
    return e.clientX > r.left - pad && e.clientX < r.right + pad && e.clientY > r.top - pad && e.clientY < r.bottom + pad;
}

function startDrag(e) {
    e.preventDefault();
    tieEl.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY };
    tieEl.style.animation = 'none';
    tieEl.classList.add('dragging');
}

function moveDrag(e) {
    if (!drag) return;
    tieEl.style.transform = `translate(${e.clientX - drag.x}px, ${e.clientY - drag.y}px) rotate(-8deg)`;
    codeEl.classList.toggle('over', overCode(e));
}

function endDrag(e, canAttach) {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag = null;
    codeEl.classList.remove('over');
    if (canAttach && overCode(e)) {
        tieEl.hidden = true;
        tieEl.classList.remove('dragging');
        tieEl.style.transform = '';
        codeEl.querySelector('.worn-tie')?.remove();
        codeEl.append(Object.assign(document.createElement('img'), { src: tieUrl, className: 'worn-tie', alt: '', draggable: false }));
        return;
    }
    tieEl.style.left = `${parseFloat(tieEl.style.left) + dx}px`;
    tieEl.style.top = `${parseFloat(tieEl.style.top) + dy}px`;
    tieEl.style.transform = '';
    keepInView(tieEl);
    requestAnimationFrame(() => requestAnimationFrame(() => tieEl.classList.remove('dragging')));
}

function grabWornTie(e) {
    const worn = e.target.closest('.worn-tie');
    if (!worn) return;
    const box = codeEl.getBoundingClientRect();
    const left = box.left + worn.offsetLeft;
    const top = box.top + worn.offsetTop;
    worn.remove();
    tieEl.style.left = `${left}px`;
    tieEl.style.top = `${top}px`;
    tieEl.hidden = false;
    startDrag(e);
}
