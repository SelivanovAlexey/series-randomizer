export const $ = id => document.getElementById(id);
export const rand = (min, max) => min + Math.random() * (max - min);
export const pad = n => String(n).padStart(2, '0');

const memory = {};
export const storage = {
    get: key => { try { return localStorage.getItem(key); } catch { return memory[key] ?? null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { memory[key] = String(value); } }
};

export function restartAnimation(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
}
