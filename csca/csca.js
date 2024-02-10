'use strict';

function mod(x, m) {
    x = x % m;
    return x >= 0 ? x : x + m;
}

const canvas = document.getElementById('cadisplay');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

class Parameter {
    #value;
    #callbacks;

    constructor(initValue) {
        this.#value = initValue;
        this.#callbacks = [];
    }

    get value() {
        return this.#value;
    }

    set value(newValue) {
        if (typeof(newValue) === 'number') {
            this.#value = newValue;
            for (const cb of this.#callbacks) {
                cb(newValue);
            }
        }
    }

    registerWatcher(callback) {
        if (typeof(callback) === 'function') {
            this.#callbacks.push(callback);
            callback(this.#value);
        }
    }
}

const Parameters = {
    a: new Parameter(0.5),
    b: new Parameter(0.0),
    c: new Parameter(0.5),
    d: new Parameter(0.492),
};

function redraw() {
    const a = Parameters.a.value;
    const b = Parameters.b.value;
    const c = Parameters.c.value;
    const d = Parameters.d.value;
    // console.log(params);

    const size = canvas.width;
    const steps = canvas.height;
    const data = ctx.createImageData(size, steps);

    let state = Array(size).fill(0.0).map(() => Math.random());
    let nextState = Array(size).fill(0.0);

    for (let y = 0; y < steps; ++y) {
        for (let x = 0; x < size; ++x) {
            const g = state[x] * 255;
            const idx = (y * size + x) * 4;
            
            data.data[idx + 0] = g;
            data.data[idx + 1] = g;
            data.data[idx + 2] = g;
            data.data[idx + 3] = 255;

            nextState[x] = (
                a * state[mod(x - 1, size)]
                + b * state[x]
                + c * state[mod(x + 1, size)]
                + d
            ) % 1.0;
        }

        const t = state;
        state = nextState;
        nextState = t;
    }

    ctx.putImageData(data, 0, 0);
}

(function setup() {
    const tbody = document.querySelector('.controls-table tbody');

    for (const [id, param] of Object.entries(Parameters)) {
        const pRow = document.createElement('tr');

        // Parameter name element
        const eName = document.createElement('td');
        eName.innerText = 'Parameter ' + id.toUpperCase();
        pRow.appendChild(eName);

        // Parameter slider control
        const eSlider = document.createElement('input');
        eSlider.type = 'range';
        eSlider.min = 0;
        eSlider.max = 1000;
        eSlider.addEventListener('input', () => {
            const x = eSlider.value / eSlider.max;
            param.value = x;
        });
        param.registerWatcher((x) => {
            eSlider.value = x * eSlider.max;
        });
        pRow.appendChild(eSlider);

        // Parameter text input
        const eNumBox = document.createElement('input');
        eNumBox.type = 'number';
        eNumBox.step = '0.01';
        eNumBox.addEventListener('input', () => {
            const v = parseFloat(eNumBox.value);
            if (!isNaN(v)) {
                param.value = v;
            }
        });
        param.registerWatcher((x) => {
            eNumBox.value =
                (x % 1.0 !== 0)
                ? x
                : (x + '.0');
        });
        pRow.appendChild(eNumBox);

        // Add row to table
        tbody.appendChild(pRow);

        // Register redraw listener
        param.registerWatcher(() => redraw());
    }

    redraw();

    document.getElementById('redrawButton').addEventListener('click', () => redraw());
})();
