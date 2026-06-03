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
// MODULE 3 — GPS noise demo
// ============================================================
function initModule3() {
    initGPSDemo();
    initQuiz();
}

function initGPSDemo() {
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

        // Grid
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        const sigma = parseFloat(slider.value) * SCALE;

        // Error radius circle
        ctx.strokeStyle = 'rgba(96,165,250,0.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(cx, cy, sigma, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(96,165,250,0.06)';
        ctx.beginPath(); ctx.arc(cx, cy, sigma, 0, Math.PI * 2); ctx.fill();

        // GPS measurements
        pts.forEach(p => {
            ctx.fillStyle = 'rgba(248,113,113,0.85)';
            ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 4, 0, Math.PI * 2); ctx.fill();
        });

        // Mean estimate
        if (pts.length > 1) {
            const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
            ctx.fillStyle = '#34d399';
            ctx.beginPath(); ctx.arc(cx + mx, cy + my, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#34d399'; ctx.font = '11px sans-serif';
            ctx.fillText('Media', cx + mx + 9, cy + my + 4);
        }

        // True position
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Real', cx + 10, cy - 4);
    }

    function updateStats() {
        if (pts.length === 0) { statsEl.textContent = 'Sin mediciones aún.'; return; }
        const errs = pts.map(p => Math.sqrt(p.x * p.x + p.y * p.y) / SCALE);
        const mean = errs.reduce((s, e) => s + e, 0) / errs.length;
        const rmse = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) / errs.length);
        statsEl.innerHTML = `<strong>${pts.length}</strong> mediciones &nbsp;·&nbsp; Error medio: <strong>${mean.toFixed(1)} m</strong> &nbsp;·&nbsp; RMSE: <strong>${rmse.toFixed(1)} m</strong>`;
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
// MODULE 3 — Quiz
// ============================================================
const QUIZ = [
    {
        q: '¿Qué sensor usarías para localización dentro de un túnel largo?',
        opts: ['GPS / GNSS', 'IMU + odometría', 'LiDAR', 'Cámara estéreo'],
        ans: 1,
        exp: 'El GPS no recibe señal satelital en túneles. La IMU con odometría (dead-reckoning) es la solución estándar.'
    },
    {
        q: 'Necesitas detectar obstáculos de noche con precisión centimétrica. ¿Qué sensor eliges?',
        opts: ['Cámara RGB', 'GPS diferencial', 'LiDAR', 'IMU'],
        ans: 2,
        exp: 'El LiDAR es independiente de la luz ambiental y ofrece precisión centimétrica en 3D.'
    },
    {
        q: '¿Qué problema tiene usar la IMU sola durante periodos largos?',
        opts: ['Baja frecuencia de muestreo', 'Deriva acumulativa del error', 'Requiere cobertura celular', 'No mide ángulos'],
        ans: 1,
        exp: 'La integración de aceleraciones acumula error (drift) con el tiempo, haciendo que la posición estimada se aleje de la real.'
    }
];

function initQuiz() {
    const quizEl   = document.getElementById('quiz');
    const resultEl = document.getElementById('quizResult');
    if (!quizEl) return;

    let answers = {};
    const saved = localStorage.getItem('quiz_score_m3');

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
        localStorage.setItem('quiz_score_m3', score);
        resultEl.className = 'quiz-result show ' + (correct === QUIZ.length ? 'passed' : 'failed');
        resultEl.textContent = correct === QUIZ.length
            ? `¡Perfecto! ${score} respuestas correctas. Puntuación guardada en localStorage.`
            : `${score} correctas. Las respuestas correctas están marcadas en verde. Puntuación guardada.`;
    });

    if (saved) {
        resultEl.className = 'quiz-result show info';
        resultEl.textContent = `Última puntuación guardada (localStorage): ${saved}`;
    }
}

// ============================================================
// MODULE 4 — Charts + Table
// ============================================================
const SENSOR_DATA = [
    { name: 'GPS',       error: 4.2,  std: 1.8,  freq: 10,   cost: '★☆☆', robustez: 'Media' },
    { name: 'LiDAR',     error: 0.08, std: 0.02, freq: 20,   cost: '★★★', robustez: 'Alta' },
    { name: 'Cámara',    error: 0.22, std: 0.12, freq: 30,   cost: '★★☆', robustez: 'Media-baja' },
    { name: 'IMU',       error: 0.15, std: 0.05, freq: 1000, cost: '★☆☆', robustez: 'Alta' },
    { name: 'Fusión IA', error: 0.04, std: 0.01, freq: null, cost: '★★★', robustez: 'Muy alta' },
];

const COLORS = { 'GPS': '#64748b', 'LiDAR': '#ef4444', 'Cámara': '#f59e0b', 'IMU': '#10b981', 'Fusión IA': '#8b5cf6' };

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
            scales: { y: { beginAtZero: true, title: { display: true, text: 'metros' } } }
        }
    });

    // Kalman convergence synthetic curve
    const iters = Array.from({ length: 25 }, (_, i) => i + 1);
    chartLine = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: iters,
            datasets: [
                {
                    label: 'GPS sin filtro',
                    data: iters.map(() => +(4.2 + randn() * 0.4).toFixed(2)),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,.1)',
                    tension: 0.3,
                    pointRadius: 3,
                },
                {
                    label: 'Filtro de Kalman',
                    data: iters.map(i => +Math.max(0.04, 4.2 * Math.exp(-i * 0.22) + randn() * 0.04).toFixed(3)),
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
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Error (m)' } } }
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
// MODULE 5 — Kalman filter simulation
// ============================================================

// -- Matrix helpers --
function matMul(A, B) {
    return A.map(row =>
        B[0].map((_, j) => row.reduce((sum, v, k) => sum + v * B[k][j], 0))
    );
}
function matAdd(A, B) { return A.map((r, i) => r.map((v, j) => v + B[i][j])); }
function matSub(A, B) { return A.map((r, i) => r.map((v, j) => v - B[i][j])); }
function transpose(A) { return A[0].map((_, j) => A.map(r => r[j])); }
function matMulVec(M, v) { return M.map(row => row.reduce((s, val, j) => s + val * v[j], 0)); }
function vecAdd(a, b) { return a.map((v, i) => v + b[i]); }
function inv2x2(M) {
    const d = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    return [[M[1][1] / d, -M[0][1] / d], [-M[1][0] / d, M[0][0] / d]];
}
function eye4() { return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]; }

class KalmanFilter2D {
    constructor(sigma) {
        this.x = [320, 190, 0, 0]; // [px, py, vx, vy]
        this.P = [[500,0,0,0],[0,500,0,0],[0,0,100,0],[0,0,0,100]];
        this.sigma = sigma;
    }

    step(z) {
        const dt = 1 / 30;
        const F = [[1,0,dt,0],[0,1,0,dt],[0,0,1,0],[0,0,0,1]];
        const H = [[1,0,0,0],[0,1,0,0]];
        const q = 0.8;
        const Q = [[q,0,0,0],[0,q,0,0],[0,0,q*8,0],[0,0,0,q*8]];
        const r = this.sigma * this.sigma;
        const R = [[r,0],[0,r]];

        // Predict
        const xp = matMulVec(F, this.x);
        const Pp = matAdd(matMul(matMul(F, this.P), transpose(F)), Q);

        // Update
        const Ht = transpose(H);
        const S  = matAdd(matMul(matMul(H, Pp), Ht), R);
        const K  = matMul(matMul(Pp, Ht), inv2x2(S));
        const y  = [z[0] - xp[0], z[1] - xp[1]];
        this.x   = vecAdd(xp, matMulVec(K, y));
        this.P   = matMul(matSub(eye4(), matMul(K, H)), Pp);

        return [this.x[0], this.x[1]];
    }
}

function initModule5() {
    const canvas = document.getElementById('simCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    let running   = false;
    let t         = 0;
    let noise     = 10;
    let algo      = 'kalman';
    let speed     = 1;
    let kf        = null;
    let movWin    = [];
    let frameId;

    let trueTrail = [], gpsTrail = [], estTrail = [];
    let gpsErrs   = [], estErrs  = [];

    let errChart;
    let errLabels = [], errGpsData = [], errEstData = [];

    // Oval path centered on canvas
    function truePt(t) {
        return { x: W/2 + (W/2 - 70) * Math.cos(t), y: H/2 + (H/2 - 55) * Math.sin(t) };
    }

    function rmse(arr) {
        if (!arr.length) return null;
        return Math.sqrt(arr.reduce((s, e) => s + e * e, 0) / arr.length);
    }

    function resetSim() {
        t = 0; kf = null; movWin = [];
        trueTrail = []; gpsTrail = []; estTrail = [];
        gpsErrs = []; estErrs = [];
        errLabels = []; errGpsData = []; errEstData = [];
        running = false;
        if (frameId) cancelAnimationFrame(frameId);
        document.getElementById('simPlay').textContent = '▶ Play';
        drawBg();
        updateStats();
        if (errChart) {
            errChart.data.labels = [];
            errChart.data.datasets.forEach(d => d.data = []);
            errChart.update('none');
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
        ctx.strokeStyle = color; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    }

    function drawDots(pts, color, r) {
        pts.forEach(p => {
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        });
    }

    function frame() {
        if (!running) return;
        t += 0.018 * speed;

        const tp = truePt(t);
        const gp = { x: tp.x + randn() * noise, y: tp.y + randn() * noise };

        let ep;
        if (algo === 'kalman') {
            if (!kf) { kf = new KalmanFilter2D(noise); kf.x = [tp.x, tp.y, 0, 0]; }
            const [ex, ey] = kf.step([gp.x, gp.y]);
            ep = { x: ex, y: ey };
        } else if (algo === 'moving') {
            movWin.push(gp);
            if (movWin.length > 8) movWin.shift();
            ep = { x: movWin.reduce((s, p) => s + p.x, 0) / movWin.length,
                   y: movWin.reduce((s, p) => s + p.y, 0) / movWin.length };
        } else {
            ep = gp;
        }

        trueTrail.push(tp); gpsTrail.push(gp); estTrail.push(ep);
        const MAX = 350;
        if (trueTrail.length > MAX) { trueTrail.shift(); gpsTrail.shift(); estTrail.shift(); }

        const ge = Math.sqrt((gp.x - tp.x) ** 2 + (gp.y - tp.y) ** 2);
        const ee = Math.sqrt((ep.x - tp.x) ** 2 + (ep.y - tp.y) ** 2);
        gpsErrs.push(ge); estErrs.push(ee);
        if (gpsErrs.length > 300) { gpsErrs.shift(); estErrs.shift(); }

        // Draw
        drawBg();
        ctx.setLineDash([6, 5]);
        drawPath(trueTrail, '#3b82f6', 1.5);
        ctx.setLineDash([]);
        drawDots(gpsTrail.filter((_, i) => i % 3 === 0), 'rgba(248,113,113,0.7)', 2.5);
        drawPath(estTrail, '#34d399', 2.5);

        // Current dots
        [[tp, '#60a5fa', 8], [gp, '#f87171', 5], [ep, '#34d399', 7]].forEach(([p, c, r]) => {
            ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        });

        updateStats();

        if (gpsErrs.length % 4 === 0) {
            const n = gpsErrs.length;
            errLabels.push(n);
            errGpsData.push(+ge.toFixed(1));
            errEstData.push(+ee.toFixed(1));
            if (errLabels.length > 80) { errLabels.shift(); errGpsData.shift(); errEstData.shift(); }
            if (errChart) {
                errChart.data.labels = [...errLabels];
                errChart.data.datasets[0].data = [...errGpsData];
                errChart.data.datasets[1].data = [...errEstData];
                errChart.update('none');
            }
        }

        frameId = requestAnimationFrame(frame);
    }

    function updateStats() {
        const rg = rmse(gpsErrs), re = rmse(estErrs);
        document.getElementById('rmseGPS').textContent     = rg !== null ? rg.toFixed(1) + ' px' : '—';
        document.getElementById('rmseKalman').textContent  = re !== null ? re.toFixed(1) + ' px' : '—';
        if (rg !== null && re !== null && rg > 0) {
            document.getElementById('rmseMejora').textContent = ((rg - re) / rg * 100).toFixed(0) + '%';
        } else {
            document.getElementById('rmseMejora').textContent = '—';
        }
        document.getElementById('numMediciones').textContent = gpsErrs.length;
    }

    // Controls
    document.getElementById('simPlay').addEventListener('click', function () {
        running = !running;
        this.textContent = running ? '⏸ Pausa' : '▶ Play';
        if (running) frame();
    });

    document.getElementById('simReset').addEventListener('click', resetSim);

    document.getElementById('simSpeed').addEventListener('input', function () {
        speed = parseFloat(this.value);
        document.getElementById('simSpeedVal').textContent = `×${speed}`;
    });

    document.querySelectorAll('.noise-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.noise-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            noise = parseInt(this.dataset.noise);
            if (kf) kf.sigma = noise;
        });
    });

    document.getElementById('algoSelect').addEventListener('change', function () {
        algo = this.value;
        kf = null; movWin = [];
    });

    // Error chart
    const errCtx = document.getElementById('chartError');
    if (errCtx) {
        errChart = new Chart(errCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'GPS',       data: [], borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,.08)', tension: 0.3, pointRadius: 0, borderWidth: 1.5 },
                    { label: 'Estimado',  data: [], borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,.1)',   tension: 0.4, pointRadius: 0, borderWidth: 2 }
                ]
            },
            options: {
                responsive: true,
                animation: false,
                plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Error (px)' } },
                    x: { display: false }
                }
            }
        });
    }

    drawBg();
}
