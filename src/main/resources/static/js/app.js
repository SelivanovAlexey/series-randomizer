import { $, pad, storage } from './dom.js';
import { celebrateWatched, clearEggs, initEggs, rollProps } from './eggs.js';

const seriesEl = $('series');
const codeEl = $('code');
const pickBtn = $('pick');
const watchedBtn = $('watched');
const resetBtn = $('reset');

let current = storage.get('series');
let episode = null;
let busy = false;

const eggsOn = () => current === 'HIMYM';

async function request(method, url) {
    const res = await fetch(url, { method });
    if (!res.ok) throw res.status;
    const body = await res.text();
    return body ? JSON.parse(body) : null;
}

function setMark(mark) {
    const done = mark === 'done';
    const label = done ? 'Просмотрено' : 'Отметить просмотренной';
    watchedBtn.hidden = !mark;
    watchedBtn.classList.toggle('done', done);
    watchedBtn.title = label;
    watchedBtn.setAttribute('aria-label', label);
}

function render({ code = '', title = '', note = '', mark = null, canReset = false }) {
    codeEl.textContent = code;
    $('title').textContent = title;
    $('note').textContent = note;
    setMark(mark);
    resetBtn.hidden = !canReset;
    clearEggs();
}

function showEpisode() {
    render({
        code: `S${pad(episode.season)}E${pad(episode.number)}`,
        title: episode.title || 'Без названия',
        note: episode.series,
        mark: 'todo'
    });
    rollProps();
}

function lock(value) {
    busy = value;
    pickBtn.disabled = value || !current;
    watchedBtn.disabled = value || watchedBtn.classList.contains('done');
    resetBtn.disabled = value;
}

function select(code) {
    current = code;
    storage.set('series', code);
    document.body.classList.toggle('eggs', eggsOn());
    for (const btn of seriesEl.children) {
        btn.classList.toggle('active', btn.dataset.code === code);
    }
    render({ note: 'Нажми кнопку, чтобы выбрать случайную серию' });
    lock(false);
}

async function pick() {
    if (busy) return;
    lock(true);
    try {
        const query = episode ? `?currentEpisodeId=${episode.id}` : '';
        episode = await request('GET', `/series/${encodeURIComponent(current)}/pick${query}`);
        showEpisode();
    } catch (status) {
        if (status === 409) render({ title: 'Все серии просмотрены', canReset: true });
        else if (status === 404) render({ note: 'Сериал не найден, обнови страницу' });
        else render({ note: 'Не получилось, попробуй ещё раз' });
    } finally {
        lock(false);
    }
}

async function markWatched() {
    if (busy || !episode) return;
    lock(true);
    try {
        const result = await request('POST', `/episodes/${episode.id}/watched`);
        setMark('done');
        $('note').textContent = episode.series;
        celebrateWatched(result?.watchedCount ?? 12);
    } catch {
        $('note').textContent = 'Не получилось отметить, попробуй ещё раз';
    } finally {
        lock(false);
    }
}

async function reset() {
    if (busy) return;
    lock(true);
    try {
        await request('POST', `/series/${encodeURIComponent(current)}/reset`);
        render({ note: 'Прогресс сброшен, можно смотреть заново' });
    } catch (status) {
        render({ note: status === 409 ? 'Сериал ещё не досмотрен' : 'Не получилось сбросить, попробуй ещё раз' });
    } finally {
        lock(false);
    }
}

initEggs(eggsOn);
pickBtn.onclick = pick;
watchedBtn.onclick = markWatched;
resetBtn.onclick = reset;

fetch('/series')
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(list => {
        if (!list.length) return render({ note: 'Сериалов пока нет' });
        for (const s of list) {
            const btn = document.createElement('button');
            btn.textContent = s.title;
            btn.dataset.code = s.code;
            btn.onclick = () => select(s.code);
            seriesEl.append(btn);
        }
        select(list.some(s => s.code === current) ? current : list[0].code);
    })
    .catch(() => render({ note: 'Не удалось загрузить список сериалов' }));
