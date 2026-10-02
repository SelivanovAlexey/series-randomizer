import { rand } from './dom.js';

let ctx;

function audio() {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function noiseBuffer(ac, seconds) {
    const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}

function withRoom(ac, seconds, decay, wet) {
    const length = Math.ceil(ac.sampleRate * seconds);
    const impulse = ac.createBuffer(2, length, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    const input = ac.createGain();
    const reverb = ac.createConvolver();
    const wetGain = ac.createGain();
    reverb.buffer = impulse;
    wetGain.gain.value = wet;
    input.connect(ac.destination);
    input.connect(reverb).connect(wetGain).connect(ac.destination);
    return input;
}

function smack(ac, out, at, { freq = 2200, q = .8, length = .09, gain = .9, thump = 150, thumpGain = .5 } = {}) {
    const noise = ac.createBufferSource();
    noise.buffer = noiseBuffer(ac, length + .05);
    const high = ac.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 600;
    const band = ac.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = freq * rand(.9, 1.1);
    band.Q.value = q;
    const env = ac.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + .002);
    env.gain.exponentialRampToValueAtTime(.001, at + length);
    noise.connect(high).connect(band).connect(env).connect(out);
    noise.start(at);
    noise.stop(at + length + .05);

    const osc = ac.createOscillator();
    const oscEnv = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(thump * rand(.9, 1.1), at);
    osc.frequency.exponentialRampToValueAtTime(thump * .4, at + .08);
    oscEnv.gain.setValueAtTime(thumpGain, at);
    oscEnv.gain.exponentialRampToValueAtTime(.001, at + .1);
    osc.connect(oscEnv).connect(out);
    osc.start(at);
    osc.stop(at + .12);
}

function whoosh(ac, out, at, duration, gain) {
    const noise = ac.createBufferSource();
    noise.buffer = noiseBuffer(ac, duration);
    const band = ac.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 1.2;
    band.frequency.setValueAtTime(300, at);
    band.frequency.exponentialRampToValueAtTime(2500, at + duration);
    const env = ac.createGain();
    env.gain.setValueAtTime(.001, at);
    env.gain.exponentialRampToValueAtTime(gain, at + duration * .85);
    env.gain.linearRampToValueAtTime(0, at + duration);
    noise.connect(band).connect(env).connect(out);
    noise.start(at);
    noise.stop(at + duration);
}

export function playSlap() {
    const ac = audio();
    const at = ac.currentTime + .01;
    whoosh(ac, ac.destination, at, .18, .25);
    smack(ac, ac.destination, at + .18);
    return 180;
}

export function playEpicSlap() {
    const ac = audio();
    const at = ac.currentTime + .01;
    const room = withRoom(ac, 1.6, 2, .5);
    whoosh(ac, room, at, .3, .3);
    smack(ac, room, at + .3, { freq: 1500, q: .6, length: .18, gain: 1, thump: 90, thumpGain: .9 });
    return 300;
}

export function playHorn() {
    const ac = audio();
    const now = ac.currentTime;
    for (const [freq, at] of [[233, 0], [311, .18]]) {
        const osc = ac.createOscillator();
        const filter = ac.createBiquadFilter();
        const gain = ac.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + at);
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
        gain.gain.setValueAtTime(0, now + at);
        gain.gain.linearRampToValueAtTime(.18, now + at + .03);
        gain.gain.exponentialRampToValueAtTime(.001, now + at + .32);
        osc.connect(filter).connect(gain).connect(ac.destination);
        osc.start(now + at);
        osc.stop(now + at + .35);
    }
}
