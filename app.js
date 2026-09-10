/**
 * BioPulse Consolidated Application Script
 * Integrates EEG waveforms canvas, Brain anatomical SVG controls, cognitive tasks logic, and patient bio database.
 * Structured as a single file to bypass browser file:// CORS restrictions on ES6 modules.
 */

function safeCreateIcons(options) {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        try {
            lucide.createIcons(options);
        } catch (e) {
            console.warn("Lucide failed to render icons", e);
        }
    }
}


// ==========================================
// 1. BRAIN LOBE MAPPING DIAGNOSTICS DATA
// ==========================================
const LOBE_DETAILS = {
    'lobe-frontal': {
        name: "Frontal Lobe // Executive Center",
        color: "#10b981",
        desc: "Responsible for higher cognitive processing, attention, planning, operational memory, decision making, and voluntary motor actions.",
        stats: "Dominant Frequency: 24.5 Hz (Beta Band) // Synaptic Load: High // Response index: active."
    },
    'lobe-parietal': {
        name: "Parietal Lobe // Sensory Integrator",
        color: "#06b6d4",
        desc: "Integrates sensory information from different modalities (touch, temperature, spatial sense) to construct coherent spatial maps.",
        stats: "Dominant Frequency: 10.2 Hz (Alpha Band) // Somatosensory status: Nominal // Spatial tracking: Active."
    },
    'lobe-occipital': {
        name: "Occipital Lobe // Visual Cortex",
        color: "#ec4899",
        desc: "The primary cortical region for visual processing. Handles shape parsing, color decoding, and motion detection.",
        stats: "Dominant Frequency: 32.0 Hz (Gamma Band) // Visual processing strain: Moderate (engaged in response tasks)."
    },
    'lobe-temporal': {
        name: "Temporal Lobe // Hippocampal Memory Hub",
        color: "#f59e0b",
        desc: "Associated with auditory reception, semantic language understanding, memory consolidation (hippocampus), and emotional processing.",
        stats: "Dominant Frequency: 6.8 Hz (Theta Band) // Memory recall channels: Active // Auditory cortex: Resting."
    },
    'lobe-cerebellum': {
        name: "Cerebellum // Balance & Motor Tuner",
        color: "#8b5cf6",
        desc: "Coordinates fine-grained muscle movements, maintains posture, and helps optimize timing and precision of motor actions.",
        stats: "Dominant Frequency: 18.0 Hz (Beta Band) // Micro-motor calibration: Stable // Coordination index: 96%."
    },
    'lobe-stem': {
        name: "Brain Stem // Autonomic Life Support",
        color: "#64748b",
        desc: "Acts as the central gateway connecting the cerebrum to the spinal cord. Regulates critical autonomic functions like breathing and heart rate.",
        stats: "Dominant Frequency: 3.5 Hz (Delta Band) // Cardiorespiratory feedback: Stable // Autonomic sync: 100%."
    }
};

// ==========================================
// 2. CLINICAL TELEMETRY WAVE ANALYZER
// ==========================================
class TelemetryMonitor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;

        this.channels = {
            alpha: { label: 'Alpha (8-12 Hz)', color: '#10b981', frequency: 0.015, amplitude: 25, enabled: true, phase: 0 },
            beta: { label: 'Beta (12-30 Hz)', color: '#06b6d4', frequency: 0.04, amplitude: 12, enabled: true, phase: 0 },
            theta: { label: 'Theta (4-8 Hz)', color: '#f59e0b', frequency: 0.007, amplitude: 35, enabled: true, phase: 0 },
            gamma: { label: 'Gamma (30-100 Hz)', color: '#ec4899', frequency: 0.08, amplitude: 5, enabled: true, phase: 0 }
        };

        this.modifiers = {
            alpha: { amp: 1.0, freq: 1.0 },
            beta: { amp: 1.0, freq: 1.0 },
            theta: { amp: 1.0, freq: 1.0 },
            gamma: { amp: 1.0, freq: 1.0 }
        };

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        document.getElementById('chk-alpha').addEventListener('change', (e) => this.channels.alpha.enabled = e.target.checked);
        document.getElementById('chk-beta').addEventListener('change', (e) => this.channels.beta.enabled = e.target.checked);
        document.getElementById('chk-theta').addEventListener('change', (e) => this.channels.theta.enabled = e.target.checked);
        document.getElementById('chk-gamma').addEventListener('change', (e) => this.channels.gamma.enabled = e.target.checked);
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    setPatientModifier(profileType) {
        if (profileType === 'patient_1') {
            this.modifiers = {
                alpha: { amp: 1.0, freq: 1.0 },
                beta: { amp: 1.0, freq: 1.0 },
                theta: { amp: 0.8, freq: 1.0 },
                gamma: { amp: 1.0, freq: 1.0 }
            };
        } else if (profileType === 'patient_2') {
            this.modifiers = {
                alpha: { amp: 0.3, freq: 0.8 },
                beta: { amp: 2.2, freq: 1.4 },
                theta: { amp: 0.5, freq: 0.9 },
                gamma: { amp: 2.5, freq: 1.3 }
            };
        } else if (profileType === 'patient_3') {
            this.modifiers = {
                alpha: { amp: 0.1, freq: 1.0 },
                beta: { amp: 0.6, freq: 0.8 },
                theta: { amp: 2.4, freq: 0.7 },
                gamma: { amp: 0.4, freq: 0.9 }
            };
        }
    }

    start() {
        if (this.animationId) return;
        const render = () => {
            this.draw();
            this.animationId = requestAnimationFrame(render);
        };
        this.animationId = requestAnimationFrame(render);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    draw() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        this.ctx.clearRect(0, 0, width, height);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        const gridLines = 4;
        for (let i = 1; i < gridLines; i++) {
            const y = (height / gridLines) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        let activeIndex = 0;
        const enabledKeys = Object.keys(this.channels).filter(key => this.channels[key].enabled);
        const channelHeight = height / (enabledKeys.length || 1);

        enabledKeys.forEach((key) => {
            const chan = this.channels[key];
            const mod = this.modifiers[key];
            const baselineY = channelHeight * activeIndex + channelHeight / 2;
            
            this.ctx.strokeStyle = chan.color;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.font = '9px Fira Code';
            this.ctx.fillText(key.toUpperCase(), 12, baselineY - chan.amplitude * mod.amp - 5);

            for (let x = 0; x < width; x++) {
                const noise = Math.sin(x * 0.4 + chan.phase * 5) * 1.5;
                const waveMath = Math.sin(x * (chan.frequency * mod.freq) + chan.phase) * (chan.amplitude * mod.amp);
                const y = baselineY + waveMath + noise;

                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();

            chan.phase += (chan.frequency * mod.freq) * 3;
            activeIndex++;
        });

        if (enabledKeys.length === 0) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, height / 2);
            this.ctx.lineTo(width, height / 2);
            this.ctx.stroke();
        }
    }
}

// ==========================================
// 3. BRAIN LOBES INTERACTION CONTROLLER
// ==========================================
class BrainMapController {
    constructor(svgId, diagnosticPanelId) {
        this.svg = document.getElementById(svgId);
        this.panel = document.getElementById(diagnosticPanelId);
        
        this.diagTitle = document.getElementById('diag-lobe-name');
        this.diagDesc = document.getElementById('diag-lobe-desc');
        
        this.activeLobeId = null;
        this.init();
    }

    init() {
        const lobes = this.svg.querySelectorAll('.brain-lobe');
        
        lobes.forEach(lobe => {
            lobe.addEventListener('mouseenter', (e) => {
                const id = e.target.id;
                this.highlightLobe(id);
            });

            lobe.addEventListener('mouseleave', () => {
                this.clearHighlight();
            });

            lobe.addEventListener('click', (e) => {
                const id = e.target.id;
                this.highlightLobe(id, true);
            });
        });
    }

    highlightLobe(id, isClick = false) {
        const details = LOBE_DETAILS[id];
        if (!details) return;

        const lobes = this.svg.querySelectorAll('.brain-lobe');
        lobes.forEach(l => l.classList.remove('active-inspecting'));

        const activeLobe = document.getElementById(id);
        if (activeLobe) {
            activeLobe.classList.add('active-inspecting');
        }

        this.diagTitle.innerHTML = `<i data-lucide="activity"></i> ${details.name}`;
        this.diagTitle.style.color = details.color;
        
        this.diagDesc.innerHTML = `
            ${details.desc}
            <span class="card-divider" style="display: block; margin: 8px 0;"></span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-text-main); font-weight: 500;">
                ${details.stats}
            </span>
        `;
        
        safeCreateIcons({ attrs: { class: 'brand-icon' } });
        this.activeLobeId = id;
    }

    clearHighlight() {
        const lobes = this.svg.querySelectorAll('.brain-lobe');
        lobes.forEach(l => l.classList.remove('active-inspecting'));
        
        this.diagTitle.innerHTML = `<i data-lucide="info"></i> Selection Mode`;
        this.diagTitle.style.color = 'var(--color-primary)';
        this.diagDesc.textContent = "Hover over any cortex lobe region in the diagram above to inspect real-time localized electro-cortical readings.";
        
        safeCreateIcons();
        this.activeLobeId = null;
    }
}

// ==========================================
// 4. COGNITIVE ASSESSMENT GAMES
// ==========================================
class CognitiveAssessor {
    constructor(onMetricsUpdated) {
        this.onMetricsUpdated = onMetricsUpdated;

        this.colors = [
            { name: 'RED', hex: '#ef4444' },
            { name: 'BLUE', hex: '#3b82f6' },
            { name: 'GREEN', hex: '#10b981' },
            { name: 'YELLOW', hex: '#f59e0b' }
        ];

        this.stroopTimer = null;
        this.stroopTimeRemaining = 10;
        this.stroopScore = { correct: 0, total: 0 };
        this.stroopStartTimestamp = null;
        this.stroopReactionTimes = [];
        this.currentStroopColorHex = '';

        this.gridTimer = null;
        this.gridTimeRemaining = 10;
        this.gridScore = 0;
        this.activeGridIndex = -1;

        this.init();
    }

    init() {
        const tabStroop = document.getElementById('tab-stroop');
        const tabGrid = document.getElementById('tab-grid');
        const gameStroop = document.getElementById('game-stroop');
        const gameGrid = document.getElementById('game-grid');

        tabStroop.addEventListener('click', () => {
            tabStroop.classList.add('active');
            tabGrid.classList.remove('active');
            gameStroop.classList.remove('hidden');
            gameGrid.classList.add('hidden');
            this.resetAllGames();
        });

        tabGrid.addEventListener('click', () => {
            tabGrid.classList.add('active');
            tabStroop.classList.remove('active');
            gameGrid.classList.remove('hidden');
            gameStroop.classList.add('hidden');
            this.resetAllGames();
        });

        document.getElementById('btn-start-stroop').addEventListener('click', () => this.startStroop());
        document.getElementById('btn-restart-stroop').addEventListener('click', () => this.startStroop());

        document.getElementById('btn-start-grid').addEventListener('click', () => this.startGrid());
        document.getElementById('btn-restart-grid').addEventListener('click', () => this.startGrid());
        
        const gridContainer = document.getElementById('reaction-target-grid');
        gridContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const dot = document.createElement('div');
            dot.className = 'grid-dot';
            dot.setAttribute('data-index', i);
            dot.addEventListener('click', (e) => this.handleGridDotClick(e));
            gridContainer.appendChild(dot);
        }
    }

    resetAllGames() {
        clearInterval(this.stroopTimer);
        clearInterval(this.gridTimer);
        this.stroopTimer = null;
        this.gridTimer = null;

        document.getElementById('stroop-intro').classList.remove('hidden');
        document.getElementById('stroop-play').classList.add('hidden');
        document.getElementById('stroop-results').classList.add('hidden');

        document.getElementById('grid-intro').classList.remove('hidden');
        document.getElementById('grid-play').classList.add('hidden');
        document.getElementById('grid-results').classList.add('hidden');
    }

    startStroop() {
        this.resetAllGames();
        this.stroopTimeRemaining = 10;
        this.stroopScore = { correct: 0, total: 0 };
        this.stroopReactionTimes = [];

        document.getElementById('stroop-intro').classList.add('hidden');
        document.getElementById('stroop-results').classList.add('hidden');
        document.getElementById('stroop-play').classList.remove('hidden');
        document.getElementById('stroop-timer').textContent = this.stroopTimeRemaining;

        this.nextStroopQuestion();

        this.stroopTimer = setInterval(() => {
            this.stroopTimeRemaining--;
            document.getElementById('stroop-timer').textContent = this.stroopTimeRemaining;
            if (this.stroopTimeRemaining <= 0) {
                this.endStroop();
            }
        }, 1000);
    }

    nextStroopQuestion() {
        const textWord = this.colors[Math.floor(Math.random() * this.colors.length)];
        const colorWord = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.currentStroopColorHex = colorWord.hex;
        
        const displayEl = document.getElementById('stroop-word-display');
        displayEl.textContent = textWord.name;
        displayEl.style.color = colorWord.hex;

        const optionsGrid = document.getElementById('stroop-options-grid');
        optionsGrid.innerHTML = '';

        const shuffledOptions = [...this.colors].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = `stroop-btn color-${opt.name}`;
            btn.textContent = opt.name;
            btn.addEventListener('click', () => this.handleStroopAnswer(opt.hex));
            optionsGrid.appendChild(btn);
        });

        this.stroopStartTimestamp = performance.now();
    }

    handleStroopAnswer(chosenHex) {
        const timeTaken = performance.now() - this.stroopStartTimestamp;
        this.stroopReactionTimes.push(timeTaken);
        this.stroopScore.total++;
        if (chosenHex === this.currentStroopColorHex) {
            this.stroopScore.correct++;
        }
        this.nextStroopQuestion();
    }

    endStroop() {
        clearInterval(this.stroopTimer);
        this.stroopTimer = null;

        document.getElementById('stroop-play').classList.add('hidden');
        const resultsEl = document.getElementById('stroop-results');
        resultsEl.classList.remove('hidden');

        const accuracy = this.stroopScore.total > 0 ? Math.round((this.stroopScore.correct / this.stroopScore.total) * 100) : 0;
        const totalReactionTime = this.stroopReactionTimes.reduce((a, b) => a + b, 0);
        const avgReactionTime = this.stroopReactionTimes.length > 0 ? Math.round(totalReactionTime / this.stroopReactionTimes.length) : 0;

        document.getElementById('stroop-count').textContent = this.stroopScore.total;
        
        const accEl = document.getElementById('stroop-acc');
        accEl.textContent = `${accuracy}%`;
        accEl.className = accuracy > 75 ? 'green' : (accuracy > 50 ? 'warning' : 'error');

        document.getElementById('stroop-delay').textContent = `${avgReactionTime} ms`;

        this.onMetricsUpdated({
            focusIndex: accuracy,
            cognitiveLoad: Math.round(50 + (100 - accuracy) * 0.5),
            responseTime: avgReactionTime
        });
    }

    startGrid() {
        this.resetAllGames();
        this.gridTimeRemaining = 10;
        this.gridScore = 0;

        document.getElementById('grid-intro').classList.add('hidden');
        document.getElementById('grid-results').classList.add('hidden');
        document.getElementById('grid-play').classList.remove('hidden');
        document.getElementById('grid-timer').textContent = this.gridTimeRemaining;

        this.nextGridTarget();

        this.gridTimer = setInterval(() => {
            this.gridTimeRemaining--;
            document.getElementById('grid-timer').textContent = this.gridTimeRemaining;
            if (this.gridTimeRemaining <= 0) {
                this.endGrid();
            }
        }, 1000);
    }

    nextGridTarget() {
        const dots = document.querySelectorAll('#reaction-target-grid .grid-dot');
        dots.forEach(d => d.classList.remove('target'));

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * 16);
        } while (randomIndex === this.activeGridIndex);

        this.activeGridIndex = randomIndex;
        dots[randomIndex].classList.add('target');
        
        this.gridStartTimestamp = performance.now();
    }

    handleGridDotClick(e) {
        if (this.gridTimeRemaining <= 0) return;

        const clickedIndex = parseInt(e.target.getAttribute('data-index'));
        if (clickedIndex === this.activeGridIndex) {
            const timeTaken = performance.now() - this.gridStartTimestamp;
            this.gridScore++;
            this.gridReactionTimes = this.gridReactionTimes || [];
            this.gridReactionTimes.push(timeTaken);

            this.nextGridTarget();
        }
    }

    endGrid() {
        clearInterval(this.gridTimer);
        this.gridTimer = null;

        document.getElementById('grid-play').classList.add('hidden');
        document.getElementById('grid-results').classList.remove('hidden');

        const clicksPerSec = (this.gridScore / 10).toFixed(1);
        document.getElementById('grid-score').textContent = this.gridScore;
        document.getElementById('grid-speed').textContent = `${clicksPerSec} clicks/sec`;

        const reactionTimes = this.gridReactionTimes || [];
        const totalReactionTime = reactionTimes.reduce((a, b) => a + b, 0);
        const avgReactionTime = reactionTimes.length > 0 ? Math.round(totalReactionTime / reactionTimes.length) : 350;

        const calculatedFocus = Math.min(100, Math.round(this.gridScore * 4.5));
        const calculatedLoad = Math.max(10, Math.round(80 - this.gridScore * 2.5));

        this.onMetricsUpdated({
            focusIndex: calculatedFocus,
            cognitiveLoad: calculatedLoad,
            responseTime: avgReactionTime
        });
        
        this.gridReactionTimes = [];
    }
}

// ==========================================
// 5. SUBJECT DATABASE & COORDINATION
// ==========================================
const PATIENTS_DB = {
    patient_1: {
        id: "SUB-8271",
        name: "Elena Rostova",
        age: 24,
        gender: "Female",
        condition: "Healthy Control",
        statusClass: "healthy",
        heartRate: 68,
        focusIndex: 82,
        cognitiveLoad: 41,
        responseTime: 310
    },
    patient_2: {
        id: "SUB-4409",
        name: "Marcus Vance",
        age: 38,
        gender: "Male",
        condition: "High Cognitive Stress",
        statusClass: "stress",
        heartRate: 104,
        focusIndex: 45,
        cognitiveLoad: 89,
        responseTime: 485
    },
    patient_3: {
        id: "SUB-1192",
        name: "Dr. Sarah Chen",
        age: 52,
        gender: "Female",
        condition: "Alpha Suppression",
        statusClass: "suppressed",
        heartRate: 76,
        focusIndex: 64,
        cognitiveLoad: 65,
        responseTime: 390
    }
};

function initializeBioPulse() {
    let currentPatientId = 'patient_1';
    let currentPatientData = { ...PATIENTS_DB.patient_1 };

    const telemetry = new TelemetryMonitor('eeg-canvas');
    telemetry.setPatientModifier(currentPatientId);
    telemetry.start();

    const brainMap = new BrainMapController('brain-svg', 'lobe-diagnostic-panel');

    const cognitive = new CognitiveAssessor((newMetrics) => {
        if (newMetrics.focusIndex !== undefined) currentPatientData.focusIndex = newMetrics.focusIndex;
        if (newMetrics.cognitiveLoad !== undefined) currentPatientData.cognitiveLoad = newMetrics.cognitiveLoad;
        if (newMetrics.responseTime !== undefined) currentPatientData.responseTime = newMetrics.responseTime;
        updateMetricsUI(currentPatientData);
    });

    const selectEl = document.getElementById('patient-select');
    selectEl.addEventListener('change', (e) => {
        currentPatientId = e.target.value;
        currentPatientData = { ...PATIENTS_DB[currentPatientId] };
        
        telemetry.setPatientModifier(currentPatientId);
        updateBioProfileUI(currentPatientData);
        updateMetricsUI(currentPatientData);
        
        cognitive.resetAllGames();
    });

    updateBioProfileUI(currentPatientData);
    updateMetricsUI(currentPatientData);

    let secondsElapsed = 0;
    const timerEl = document.getElementById('session-timer');
    setInterval(() => {
        secondsElapsed++;
        const hrs = Math.floor(secondsElapsed / 3600).toString().padStart(2, '0');
        const mins = Math.floor((secondsElapsed % 3600) / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        timerEl.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);

    function updateBioProfileUI(data) {
        const bioCard = document.getElementById('patient-bio-card');
        bioCard.innerHTML = `
            <div class="patient-info-row">
                <span>Subject ID:</span>
                <span>${data.id}</span>
            </div>
            <div class="patient-info-row">
                <span>Full Name:</span>
                <span>${data.name}</span>
            </div>
            <div class="patient-info-row">
                <span>Age / Sex:</span>
                <span>${data.age} / ${data.gender}</span>
            </div>
            <div class="patient-info-row">
                <span>Heart Rate:</span>
                <span style="font-family: var(--font-mono); color: #f43f5e;">
                    <i data-lucide="heart" style="width: 10px; height: 10px; display: inline-block; fill: #f43f5e; animation: heartbeat 1s infinite alternate;"></i> 
                    ${data.heartRate} BPM
                </span>
            </div>
            <div class="patient-info-row">
                <span>Clinical Status:</span>
                <span class="status-capsule ${data.statusClass}">${data.condition}</span>
            </div>
        `;
        safeCreateIcons();
    }

    function updateMetricsUI(data) {
        const focusVal = document.getElementById('focus-val');
        const focusBar = document.getElementById('focus-bar');
        focusVal.textContent = `${data.focusIndex}%`;
        focusBar.style.width = `${data.focusIndex}%`;

        const loadVal = document.getElementById('load-val');
        const loadBar = document.getElementById('load-bar');
        loadVal.textContent = `${data.cognitiveLoad}%`;
        loadBar.style.width = `${data.cognitiveLoad}%`;

        const speedVal = document.getElementById('speed-val');
        const speedBar = document.getElementById('speed-bar');
        speedVal.textContent = `${data.responseTime} ms`;
        
        const speedPercentage = Math.max(5, Math.min(100, Math.round(100 - (data.responseTime - 150) * 0.15)));
        speedBar.style.width = `${speedPercentage}%`;
    }
}

if (document.readyState !== 'loading') {
    initializeBioPulse();
} else {
    document.addEventListener('DOMContentLoaded', initializeBioPulse);
}
