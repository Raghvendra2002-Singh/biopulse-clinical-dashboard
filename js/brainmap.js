/**
 * BioPulse Brain Lobe Mapping controller
 * Binds hover and click events to SVG brain elements to show localized diagnostic readouts.
 */

const LOBE_DETAILS = {
    'lobe-frontal': {
        name: "Frontal Lobe // Executive Center",
        color: "#10b981", // Mint
        desc: "Responsible for higher cognitive processing, attention, planning, operational memory, decision making, and voluntary motor actions.",
        stats: "Dominant Frequency: 24.5 Hz (Beta Band) // Synaptic Load: High // Response index: active."
    },
    'lobe-parietal': {
        name: "Parietal Lobe // Sensory Integrator",
        color: "#06b6d4", // Cyan
        desc: "Integrates sensory information from different modalities (touch, temperature, spatial sense) to construct coherent spatial maps.",
        stats: "Dominant Frequency: 10.2 Hz (Alpha Band) // Somatosensory status: Nominal // Spatial tracking: Active."
    },
    'lobe-occipital': {
        name: "Occipital Lobe // Visual Cortex",
        color: "#ec4899", // Pink
        desc: "The primary cortical region for visual processing. Handles shape parsing, color decoding, and motion detection.",
        stats: "Dominant Frequency: 32.0 Hz (Gamma Band) // Visual processing strain: Moderate (engaged in response tasks)."
    },
    'lobe-temporal': {
        name: "Temporal Lobe // Hippocampal Memory Hub",
        color: "#f59e0b", // Amber
        desc: "Associated with auditory reception, semantic language understanding, memory consolidation (hippocampus), and emotional processing.",
        stats: "Dominant Frequency: 6.8 Hz (Theta Band) // Memory recall channels: Active // Auditory cortex: Resting."
    },
    'lobe-cerebellum': {
        name: "Cerebellum // Balance & Motor Tuner",
        color: "#8b5cf6", // Purple
        desc: "Coordinates fine-grained muscle movements, maintains posture, and helps optimize timing and precision of motor actions.",
        stats: "Dominant Frequency: 18.0 Hz (Beta Band) // Micro-motor calibration: Stable // Coordination index: 96%."
    },
    'lobe-stem': {
        name: "Brain Stem // Autonomic Life Support",
        color: "#64748b", // Slate
        desc: "Acts as the central gateway connecting the cerebrum to the spinal cord. Regulates critical autonomic functions like breathing and heart rate.",
        stats: "Dominant Frequency: 3.5 Hz (Delta Band) // Cardiorespiratory feedback: Stable // Autonomic sync: 100%."
    }
};

export class BrainMapController {
    constructor(svgId, diagnosticPanelId) {
        this.svg = document.getElementById(svgId);
        this.panel = document.getElementById(diagnosticPanelId);
        
        this.diagTitle = document.getElementById('diag-lobe-name');
        this.diagDesc = document.getElementById('diag-lobe-desc');
        
        this.activeLobeId = null;

        this.init();
    }

    init() {
        // Query all path lobes in SVG
        const lobes = this.svg.querySelectorAll('.brain-lobe');
        
        lobes.forEach(lobe => {
            // Hover Enter
            lobe.addEventListener('mouseenter', (e) => {
                const id = e.target.id;
                this.highlightLobe(id);
            });

            // Hover Leave
            lobe.addEventListener('mouseleave', () => {
                this.clearHighlight();
            });

            // Mobile click support
            lobe.addEventListener('click', (e) => {
                const id = e.target.id;
                this.highlightLobe(id, true);
            });
        });
    }

    highlightLobe(id, isClick = false) {
        const details = LOBE_DETAILS[id];
        if (!details) return;

        // Clear existing highlights
        const lobes = this.svg.querySelectorAll('.brain-lobe');
        lobes.forEach(l => l.classList.remove('active-inspecting'));

        // Highlight this one
        const activeLobe = document.getElementById(id);
        if (activeLobe) {
            activeLobe.classList.add('active-inspecting');
        }

        // Update Panel Content
        this.diagTitle.innerHTML = `<i data-lucide="activity"></i> ${details.name}`;
        this.diagTitle.style.color = details.color;
        
        this.diagDesc.innerHTML = `
            ${details.desc}
            <span class="card-divider" style="display: block; margin: 8px 0;"></span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-text-main); font-weight: 500;">
                ${details.stats}
            </span>
        `;
        
        lucide.createIcons({ attrs: { class: 'brand-icon' } });
        this.activeLobeId = id;
    }

    clearHighlight() {
        const lobes = this.svg.querySelectorAll('.brain-lobe');
        lobes.forEach(l => l.classList.remove('active-inspecting'));
        
        this.diagTitle.innerHTML = `<i data-lucide="info"></i> Selection Mode`;
        this.diagTitle.style.color = 'var(--color-primary)';
        this.diagDesc.textContent = "Hover over any cortex lobe region in the diagram above to inspect real-time localized electro-cortical readings.";
        
        lucide.createIcons();
        this.activeLobeId = null;
    }
}
