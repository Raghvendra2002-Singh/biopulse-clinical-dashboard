/**
 * BioPulse Clinical Telemetry wave analyzer
 * Renders real-time EEG (Electroencephalogram) waves on HTML5 Canvas.
 * Generates waveforms by combining multiple overlapping sine harmonics.
 */

export class TelemetryMonitor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;

        // Wave characteristics
        this.channels = {
            alpha: { label: 'Alpha (8-12 Hz)', color: '#10b981', frequency: 0.015, amplitude: 25, enabled: true, phase: 0 },
            beta: { label: 'Beta (12-30 Hz)', color: '#06b6d4', frequency: 0.04, amplitude: 12, enabled: true, phase: 0 },
            theta: { label: 'Theta (4-8 Hz)', color: '#f59e0b', frequency: 0.007, amplitude: 35, enabled: true, phase: 0 },
            gamma: { label: 'Gamma (30-100 Hz)', color: '#ec4899', frequency: 0.08, amplitude: 5, enabled: true, phase: 0 }
        };

        // Current modifier ratios (changes depending on selected patient profile)
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

        // Attach checkbox filter toggles
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
            // Healthy Normal
            this.modifiers = {
                alpha: { amp: 1.0, freq: 1.0 },
                beta: { amp: 1.0, freq: 1.0 },
                theta: { amp: 0.8, freq: 1.0 },
                gamma: { amp: 1.0, freq: 1.0 }
            };
        } else if (profileType === 'patient_2') {
            // High Stress (high beta/gamma, low alpha)
            this.modifiers = {
                alpha: { amp: 0.3, freq: 0.8 },
                beta: { amp: 2.2, freq: 1.4 },
                theta: { amp: 0.5, freq: 0.9 },
                gamma: { amp: 2.5, freq: 1.3 }
            };
        } else if (profileType === 'patient_3') {
            // Alpha suppression / Drowsiness (high theta, flat alpha)
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

        // Draw horizontal grid lines
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

        // Draw active waves
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

            // Overlay label
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.font = '9px Fira Code';
            this.ctx.fillText(key.toUpperCase(), 12, baselineY - chan.amplitude * mod.amp - 5);

            for (let x = 0; x < width; x++) {
                // Combine primary sine wave with random micro-noise to simulate organic neuron firing
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

            // Increment phase relative to delta time
            chan.phase += (chan.frequency * mod.freq) * 3;
            activeIndex++;
        });

        // If no channels enabled, draw a standard flatline
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
