'use strict';

// Gaussian random number (Box-Muller)
function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ============================================================
// TAB NAVIGATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const btns     = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.modulo');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('activo'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('activo');
        });
    });

    initModule2();
    initModule3();
    initModule4();
    initModule5();
});

// ============================================================
// MODULE 2 — CSS toggle
// ============================================================
function initModule2() {
    const btn  = document.getElementById('toggleEstilos');
    const link = document.querySelector('link[rel="stylesheet"]');
    if (!btn || !link) return;
    let stripped = false;
    btn.addEventListener('click', () => {
        stripped = !stripped;
        link.disabled = stripped;
        btn.textContent = stripped ? 'Restaurar estilos CSS' : 'Quitar estilos CSS';
    });
}

// ============================================================
// MODULE 3 — Radio Frequency noise demo
// ============================================================
function initModule3() {
    initIndoorNoiseDemo();
    initQuiz();
}

function initIndoorNoiseDemo() {
    const canvas  = document.getElementById('gpsDemo');
    if (!canvas) return;
    const ctx     = canvas.getContext('2d');
    const slider  = document.getElementById('noiseSlider');
    const noiseEl = document.getElementById('noiseVal');
    const statsEl = document.getElementById('gpsStats');
    const btnAdd  = document.getElementById('btnAddMeasure');
    const btnClear= document.getElementById('btnClearMeasure');

    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const SCALE = 3; // canvas px per meter
    let pts = [];

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Grid de Planta
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        const sigma = parseFloat(slider.value) * SCALE;

        // Radio de incertidumbre electromagnética
        ctx.strokeStyle = 'rgba(96,165,250,0.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(cx, cy, sigma, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(96,165,250,0.06)';
        ctx.beginPath(); ctx.arc(cx, cy, sigma, 0, Math.PI * 2); ctx.fill();

        // Pings de radiofrecuencia (mediciones)
        pts.forEach(p => {
            ctx.fillStyle = 'rgba(248,113,113,0.85)';
            ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 4, 0, Math.PI * 2); ctx.fill();
        });

        // Estimación promedio por centroide
        if (pts.length > 1) {
            const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
            ctx.fillStyle = '#34d399';
            ctx.beginPath(); ctx.arc(cx + mx, cy + my, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#34d399'; ctx.font = '11px sans-serif';
            ctx.fillText('Centroide Est.', cx + mx + 9, cy + my + 4);
        }

        // Posición real esperada
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Real (Activo)', cx + 10, cy - 4);
    }

    function updateStats() {
        if (pts.length === 0) { statsEl.textContent = 'Sin pings recibidos aún.'; return; }
        const errs = pts.map(p => Math.sqrt(p.x * p.x + p.y * p.y) / SCALE);
        const mean = errs.reduce((s, e) => s + e, 0) / errs.length;
        const rmse = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) / errs.length);
        statsEl.innerHTML = `<strong>${pts.length}</strong> pings de red &nbsp;·&nbsp; Desviación Media: <strong>${mean.toFixed(1)} m</strong> &nbsp;·&nbsp; RMSE en Planta: <strong>${rmse.toFixed(1)} m</strong>`;
    }

    slider.addEventListener('input', () => { noiseEl.textContent = slider.value; draw(); });
    btnAdd.addEventListener('click', () => {
        const sigma = parseFloat(slider.value) * SCALE;
        pts.push({ x: randn() * sigma, y: randn() * sigma });
        draw(); updateStats();
    });
    btnClear.addEventListener('click', () => { pts = []; draw(); updateStats(); });
    draw();
}

// ============================================================
// MODULE 3 — Indoor Localization Quiz
// ============================================================
const QUIZ = [
    {
        q: '¿Qué tecnología ofrece precisión centimétrica en interiores basándose en el tiempo de vuelo (ToF) de impulsos de radio?',
        opts: ['Wi-Fi estándar', 'Balizas BLE (Bluetooth)', 'UWB (Ultra-Wideband)', 'GPS de doble frecuencia'],
        ans: 2,
        exp: 'La banda ultraancha (UWB) destaca en interiores industriales por su precisión ultra-alta e inmunidad a los ecos electromagnéticos multitrayecto.'
    },
    {
        q: 'Si deseas desplegar una solución económica para guiar clientes en un centro comercial sin instalar costosas infraestructuras, ¿cuál eliges?',
        opts: ['Balizas BLE activadas por batería', 'Sistemas LiDAR fijos', 'Redes de anclajes UWB', 'Estructuras pseudo-satelitales'],
        ans: 0,
        exp: 'Las balizas BLE son baratas, compactas, operan años con pilas de botón y se integran nativamente con smartphones comerciales.'
    },
    {
        q: '¿Cuál es la principal desventaja de usar una IMU a solas para estimar la trayectoria de un operario (Pedestrian Dead Reckoning)?',
        opts: ['No registra variaciones de orientación', 'Deriva destructiva por acumulación sistemática del error', 'Incapacidad absoluta de operar bajo techo', 'Sufre interferencias por muros de hormigón'],
        ans: 1,
        exp: 'Al integrar de manera sucesiva aceleraciones y giros, los pequeños ruidos aleatorios del chip inercial crean un desvío (drift) que crece con el tiempo.'
    }
];

function initQuiz() {
    const quizEl   = document.getElementById('quiz');
    const resultEl = document.getElementById('quizResult');
    if (!quizEl) return;

    let answers = {};
    const saved = localStorage.getItem('quiz_score_m3_indoor');

    quizEl.innerHTML = QUIZ.map((q, i) => `
        <div class="quiz-question">
            <p>${i + 1}. ${q.q}</p>
            <div class="quiz-opts">
                ${q.opts.map((o, j) => `<div class="quiz-opt" data-q="${i}" data-a="${j}">${o}</div>`).join('')}
            </div>
        </div>
    `).join('') + '<button id="btnQuizSubmit" class="btn-primary" style="margin-top:12px">Comprobar respuestas</button>';

    quizEl.querySelectorAll('.quiz-opt').forEach(opt => {
        opt.addEventListener('click', function () {
            quizEl.querySelectorAll(`.quiz-opt[data-q="${this.dataset.q}"]`).forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            answers[this.dataset.q] = parseInt(this.dataset.a);
        });
    });

    document.getElementById('btnQuizSubmit').addEventListener('click', () => {
        let correct = 0;
        QUIZ.forEach((q, i) => {
            quizEl.querySelectorAll(`.quiz-opt[data-q="${i}"]`).forEach((opt, j) => {
                if (j === q.ans) opt.classList.add('correct');
                else if (answers[i] === j) opt.classList.add('wrong');
            });
            if (answers[i] === q.ans) correct++;
        });
        const score = `${correct}/${QUIZ.length}`;
        localStorage.setItem('quiz_score_m3_indoor', score);
        resultEl.className = 'quiz-result show ' + (correct === QUIZ.length ? 'passed' : 'failed');
        resultEl.textContent = correct === QUIZ.length
            ? `¡Magnífico! ${score} aciertos. Registrado de forma persistente en localStorage.`
            : `${score} correctas. Revisa las soluciones marcadas en verde. Historial actualizado.`;
    });

    if (saved) {
        resultEl.className = 'quiz-result show info';
        resultEl.textContent = `Puntuación previa recuperada (localStorage): ${saved}`;
    }
}

// ============================================================
// MODULE 4 — Charts + Table (Indoor Sensors Data)
// ============================================================
const SENSOR_DATA = [
    { name: 'Wi-Fi',     error: 3.5,  std: 1.2,  freq: 2,    cost: '★☆☆', robustez: 'Media' },
    { name: 'UWB',       error: 0.08, std: 0.03, freq: 50,   cost: '★★★', robustez: 'Alta' },
    { name: 'BLE',       error: 2.1,  std: 0.7,  freq: 10,   cost: '★☆☆', robustez: 'Media' },
    { name: 'IMU',       error: 0.20, std: 0.08, freq: 200,  cost: '★☆☆', robustez: 'Alta' },
    { name: 'Fusión IA', error: 0.05, std: 0.02, freq: null, cost: '★★★', robustez: 'Muy alta' },
];

const COLORS = { 'Wi-Fi': '#64748b', 'UWB': '#ef4444', 'BLE': '#f59e0b', 'IMU': '#10b981', 'Fusión IA': '#8b5cf6' };

let chartBar, chartLine;

function initModule4() {
    renderTable(SENSOR_DATA);
    buildCharts(SENSOR_DATA);

    document.querySelectorAll('.sensor-check').forEach(cb => {
        cb.addEventListener('change', () => {
            const active = [...document.querySelectorAll('.sensor-check:checked')].map(c => c.value);
            const filtered = SENSOR_DATA.filter(s => active.includes(s.name));
            renderTable(filtered);
            updateBarChart(filtered);
        });
    });
}

function renderTable(data) {
    const tbody = document.querySelector('#tablaSensores tbody');
    if (!tbody) return;
    tbody.innerHTML = data.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.error} m</td>
            <td>${s.std} m</td>
            <td>${s.freq !== null ? s.freq : 'Adaptativa'}</td>
            <td>${s.cost}</td>
            <td>${s.robustez}</td>
        </tr>
    `).join('');
}

function buildCharts(data) {
    const barCtx  = document.getElementById('chartBar');
    const lineCtx = document.getElementById('chartLine');
    if (!barCtx || !lineCtx) return;

    chartBar = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: data.map(s => s.name),
            datasets: [{
                label: 'Error medio (m)',
                data: data.map(s => s.error),
                backgroundColor: data.map(s => COLORS[s.name] || '#64748b'),
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Metros' } } }
        }
    });

    // Curva sintética de estabilización de Kalman vs fluctuación Wi-Fi
    const iters = Array.from({ length: 25 }, (_, i) => i + 1);
    chartLine = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: iters,
            datasets: [
                {
                    label: 'Señal Wi-Fi cruda (Ruido Electromagnético)',
                    data: iters.map(() => +(3.5 + randn() * 0.5).toFixed(2)),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,.1)',
                    tension: 0.3,
                    pointRadius: 3,
                },
                {
                    label: 'Filtro Kalman Inteligente',
                    data: iters.map(i => +Math.max(0.05, 3.5 * Math.exp(-i * 0.25) + randn() * 0.03).toFixed(3)),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,.1)',
                    tension: 0.4,
                    pointRadius: 3,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Desviación Inst. (m)' } } }
        }
    });
}

function updateBarChart(data) {
    if (!chartBar) return;
    chartBar.data.labels = data.map(s => s.name);
    chartBar.data.datasets[0].data = data.map(s => s.error);
    chartBar.data.datasets[0].backgroundColor = data.map(s => COLORS[s.name] || '#64748b');
    chartBar.update();
}

// ============================================================
// MODULE 5 — Kalman filter simulation (Indoor AGV tracking con 1 Muro)
// ============================================================
function initModule5() {
    const canvas = document.getElementById('simCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    let running   = false, t = 0, noise = 8, algo = 'kalman', speed = 1, kf = null, movWin = [], frameId;
    let trueTrail = [], gpsTrail = [], estTrail = [], gpsErrs = [], estErrs = [];
    let errChart, errLabels = [], errGpsData = [], errEstData = [];

    // --- ENTORNO: 3 ANCLAS Y 1 MURO CENTRAL ---
    const ANCHORS = [
        { x: 50,  y: 50,  id: 'A1' },
        { x: 590, y: 50,  id: 'A2' },
        { x: 320, y: 340, id: 'A3' }
    ];

    // Muro central exactamente definido
    const MURO = { x: 260, y: 115, w: 120, h: 150, name: 'Muro de Hormigón' };

    // Geometría: ¿El rayo de señal cruza el rectángulo del muro?
    function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        const checkLine = (x1, y1, x2, y2, x3, y3, x4, y4) => {
            let den = (x2 - x1) * (y4 - y3) - (x4 - x3) * (y2 - y1);
            if (den === 0) return false;
            let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
            let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
            return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
        };
        // Evaluamos si el rayo choca con el borde Arriba, Derecha, Abajo o Izquierda del muro
        return checkLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) || 
               checkLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) || 
               checkLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) || 
               checkLine(x1, y1, x2, y2, rx, ry + rh, rx, ry);
    }

    // Álgebra Matricial del Filtro
    function matMul(A, B) { return A.map(row => B[0].map((_, j) => row.reduce((sum, v, k) => sum + v * B[k][j], 0))); }
    function matAdd(A, B) { return A.map((r, i) => r.map((v, j) => v + B[i][j])); }
    function matSub(A, B) { return A.map((r, i) => r.map((v, j) => v - B[i][j])); }
    function transpose(A) { return A[0].map((_, j) => A.map(r => r[j])); }
    function matMulVec(M, v) { return M.map(row => row.reduce((s, val, j) => s + val * v[j], 0)); }
    function vecAdd(a, b) { return a.map((v, i) => v + b[i]); }
    function inv2x2(M) {
        const d = M[0][0] * M[1][1] - M[0][1] * M[1][0];
        return [[M[1][1] / d, -M[0][1] / d], [-M[1][0] / d, M[0][0] / d]];
    }

    class KalmanFilter2D {
        constructor(sigma) {
            this.x = [320, 190, 0, 0]; 
            this.P = [[500,0,0,0],[0,500,0,0],[0,0,100,0],[0,0,0,100]];
            this.sigma = sigma;
        }
        step(z) {
            const F = [[1,0,1/30,0],[0,1,0,1/30],[0,0,1,0],[0,0,0,1]];
            const H = [[1,0,0,0],[0,1,0,0]];
            const Q = [[0.6,0,0,0],[0,0.6,0,0],[0,0,5,0],[0,0,0,5]];
            const R = [[this.sigma * this.sigma, 0], [0, this.sigma * this.sigma]];

            const xp = matMulVec(F, this.x);
            const Pp = matAdd(matMul(matMul(F, this.P), transpose(F)), Q);
            const S  = matAdd(matMul(matMul(H, Pp), transpose(H)), R);
            const K  = matMul(matMul(Pp, transpose(H)), inv2x2(S));
            
            this.x   = vecAdd(xp, matMulVec(K, [z[0] - xp[0], z[1] - xp[1]]));
            this.P   = matMul(matSub([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], matMul(K, H)), Pp);
            return [this.x[0], this.x[1]];
        }
    }

    function truePt(t) {
        return { x: W/2 + (W/2 - 80) * Math.cos(t), y: H/2 + (H/2 - 65) * Math.sin(t) };
    }

    function rmse(arr) {
        if (!arr.length) return null;
        return Math.sqrt(arr.reduce((s, e) => s + e * e, 0) / arr.length);
    }

    function resetSim() {
        t = 0; kf = null; movWin = [];
        trueTrail = []; gpsTrail = []; estTrail = []; gpsErrs = []; estErrs = [];
        errLabels = []; errGpsData = []; errEstData = [];
        running = false;
        if (frameId) cancelAnimationFrame(frameId);
        document.getElementById('simPlay').textContent = '▶ Play';
        drawBg();
        updateStats(0);
        if (errChart) {
            errChart.data.labels = []; errChart.data.datasets.forEach(d => d.data = []); errChart.update('none');
        }
    }

    function drawBg() {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }

    function drawPath(pts, color, lw) {
        if (pts.length < 2) return;
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
    }

    function drawDots(pts, color, r) {
        ctx.fillStyle = color;
        pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); });
    }

    function frame() {
        if (!running) return;
        t += 0.015 * speed;

        const tp = truePt(t);
        let nlosCount = 0;
        
        drawBg();

        // 1. Dibujar el Muro de Hormigón Central
        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(MURO.x, MURO.y, MURO.w, MURO.h);
        ctx.strokeRect(MURO.x, MURO.y, MURO.w, MURO.h);
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
        ctx.fillText(MURO.name, MURO.x + 15, MURO.y + 20);

        // 2. Comprobar Matemáticamente el estado NLOS de cada Ancla
        ANCHORS.forEach(anchor => {
            // El rayo va desde el AGV (tp.x, tp.y) hasta el Ancla (anchor.x, anchor.y)
            let isBlocked = lineIntersectsRect(tp.x, tp.y, anchor.x, anchor.y, MURO.x, MURO.y, MURO.w, MURO.h);
            if (isBlocked) nlosCount++;

            // Línea del rayo de radiofrecuencia (Verde LOS / Rojo discontinuo NLOS)
            ctx.strokeStyle = isBlocked ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.3)';
            ctx.lineWidth = isBlocked ? 2 : 1.2;
            if (isBlocked) ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(anchor.x, anchor.y); ctx.stroke();
            ctx.setLineDash([]);
        });

        // 3. Dibujar las Anclas
        ANCHORS.forEach(anchor => {
            ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(anchor.x, anchor.y, 8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif';
            ctx.fillText(anchor.id, anchor.x - 6, anchor.y + 3);
        });

        // 4. Inyección del Multitrayecto Físico por NLOS
        let effectiveNoise = noise;
        let biasX = 0, biasY = 0;
        
        if (nlosCount > 0) {
            effectiveNoise = noise * (1 + nlosCount * 1.5); // Aumenta la dispersión gaussiana
            
            // Simulación del rebote de onda: Empuja la medición bruta lejos del muro
            biasX = 25 * nlosCount * Math.sign(tp.x - W/2); 
            biasY = 25 * nlosCount * Math.sign(tp.y - H/2);
        }

        // Medición recibida (distorsionada)
        const gp = { x: tp.x + randn() * effectiveNoise + biasX, y: tp.y + randn() * effectiveNoise + biasY };

        // 5. Aplicar Filtro de Kalman (El filtro NO sabe del muro, asume varianza limpia)
        let ep;
        if (algo === 'kalman') {
            if (!kf) { kf = new KalmanFilter2D(noise); kf.x = [tp.x, tp.y, 0, 0]; }
            kf.sigma = noise; 
            const [ex, ey] = kf.step([gp.x, gp.y]);
            ep = { x: ex, y: ey };
        } else if (algo === 'moving') {
            movWin.push(gp); if (movWin.length > 8) movWin.shift();
            ep = { x: movWin.reduce((s, p) => s + p.x, 0) / movWin.length, y: movWin.reduce((s, p) => s + p.y, 0) / movWin.length };
        } else {
            ep = gp;
        }

        // Históricos
        trueTrail.push(tp); gpsTrail.push(gp); estTrail.push(ep);
        if (trueTrail.length > 250) { trueTrail.shift(); gpsTrail.shift(); estTrail.shift(); }

        const ge = Math.sqrt((gp.x - tp.x) ** 2 + (gp.y - tp.y) ** 2);
        const ee = Math.sqrt((ep.x - tp.x) ** 2 + (ep.y - tp.y) ** 2);
        gpsErrs.push(ge); estErrs.push(ee);
        if (gpsErrs.length > 300) { gpsErrs.shift(); estErrs.shift(); }

        // Renderizar estelas de posicionamiento
        ctx.setLineDash([4, 4]); drawPath(trueTrail, '#3b82f6', 1.5); ctx.setLineDash([]);
        drawDots(gpsTrail.filter((_, i) => i % 2 === 0), 'rgba(248,113,113,0.5)', 2);
        drawPath(estTrail, '#34d399', 2.5);

        // Nodos instantáneos frontales
        [[tp, '#60a5fa', 8], [gp, '#f87171', 5], [ep, '#34d399', 7]].forEach(([p, c, r]) => {
            ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        });

        updateStats(nlosCount);

        // Gráfica de Chart.js
        if (gpsErrs.length % 4 === 0 && errChart) {
            errLabels.push(gpsErrs.length); errGpsData.push(+ge.toFixed(1)); errEstData.push(+ee.toFixed(1));
            if (errLabels.length > 60) { errLabels.shift(); errGpsData.shift(); errEstData.shift(); }
            errChart.data.labels = [...errLabels]; errChart.data.datasets[0].data = [...errGpsData]; errChart.data.datasets[1].data = [...errEstData];
            errChart.update('none');
        }

        frameId = requestAnimationFrame(frame);
    }

    function updateStats(nlosCount) {
        const rg = rmse(gpsErrs), re = rmse(estErrs);
        
        const nlosEl = document.getElementById('nlosLinks');
        if (nlosEl) {
            nlosEl.textContent = `${nlosCount} / ${ANCHORS.length}`;
            nlosEl.className = 'stat-value ' + (nlosCount === 0 ? 'stat-good' : (nlosCount === ANCHORS.length ? 'stat-bad' : 'stat-highlight'));
        }

        const rmseGpsEl    = document.getElementById('rmseGPS');
        const rmseKalEl    = document.getElementById('rmseKalman');
        const rmseMejEl    = document.getElementById('rmseMejora');
        if (rmseGpsEl)  rmseGpsEl.textContent  = rg !== null ? rg.toFixed(1) + ' px' : '—';
        if (rmseKalEl)  rmseKalEl.textContent  = re !== null ? re.toFixed(1) + ' px' : '—';
        if (rg !== null && re !== null && rg > 0 && rmseMejEl) {
            rmseMejEl.textContent = ((rg - re) / rg * 100).toFixed(0) + '%';
        }
    }

    // Vinculación de Eventos
    document.getElementById('simPlay').addEventListener('click', function () {
        running = !running; this.textContent = running ? '⏸ Pausa' : '▶ Play'; if (running) frame();
    });
    document.getElementById('simReset').addEventListener('click', resetSim);
    document.getElementById('simSpeed').addEventListener('input', function () { speed = parseFloat(this.value); document.getElementById('simSpeedVal').textContent = `×${speed}`; });
    
    document.querySelectorAll('.noise-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.noise-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            noise = parseInt(this.dataset.noise);
        });
    });

    document.getElementById('algoSelect').addEventListener('change', function () {
        algo = this.value; kf = null; movWin = [];
    });

    // Gráfica de error
    const errCtx = document.getElementById('chartError');
    if (errCtx) {
        errChart = new Chart(errCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Bruto de Radio', data: [], borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,.06)', tension: 0.3, pointRadius: 0, borderWidth: 1.5 },
                    { label: 'Filtro', data: [], borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,.08)',  tension: 0.4, pointRadius: 0, borderWidth: 2 }
                ]
            },
            options: {
                responsive: true, animation: false,
                plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Desviación (px)' } }, x: { display: false } }
            }
        });
    }
    drawBg();
}