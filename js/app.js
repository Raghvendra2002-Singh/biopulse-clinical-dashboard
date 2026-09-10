/**
 * BioPulse Clinical Hub Master Coordinator
 * Handles clinical state variables, patient profile switching, telemetry bindings,
 * and updates session time records.
 */

import { TelemetryMonitor } from './telemetry.js';
import { BrainMapController } from './brainmap.js';
import { CognitiveAssessor } from './cognitive.js';

// Static Patient Profiles DB
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

document.addEventListener('DOMContentLoaded', () => {
    let currentPatientId = 'patient_1';
    let currentPatientData = { ...PATIENTS_DB.patient_1 };

    // 1. Initialize Telemetry waves
    const telemetry = new TelemetryMonitor('eeg-canvas');
    telemetry.setPatientModifier(currentPatientId);
    telemetry.start();

    // 2. Initialize Brain mapping SVG triggers
    const brainMap = new BrainMapController('brain-svg', 'lobe-diagnostic-panel');

    // 3. Initialize Cognitive Tests and link profile metric update triggers
    const cognitive = new CognitiveAssessor((newMetrics) => {
        // Callback updates active patient profile metrics
        if (newMetrics.focusIndex !== undefined) currentPatientData.focusIndex = newMetrics.focusIndex;
        if (newMetrics.cognitiveLoad !== undefined) currentPatientData.cognitiveLoad = newMetrics.cognitiveLoad;
        if (newMetrics.responseTime !== undefined) currentPatientData.responseTime = newMetrics.responseTime;

        updateMetricsUI(currentPatientData);
    });

    // 4. Hook patient selector dropdown
    const selectEl = document.getElementById('patient-select');
    selectEl.addEventListener('change', (e) => {
        currentPatientId = e.target.value;
        currentPatientData = { ...PATIENTS_DB[currentPatientId] };
        
        // Update components
        telemetry.setPatientModifier(currentPatientId);
        updateBioProfileUI(currentPatientData);
        updateMetricsUI(currentPatientData);
        
        // Reset game window to prevent overlapping active run states
        cognitive.resetAllGames();
    });

    // Initialize UI
    updateBioProfileUI(currentPatientData);
    updateMetricsUI(currentPatientData);

    // 5. Session clock timer
    let secondsElapsed = 0;
    const timerEl = document.getElementById('session-timer');
    setInterval(() => {
        secondsElapsed++;
        const hrs = Math.floor(secondsElapsed / 3600).toString().padStart(2, '0');
        const mins = Math.floor((secondsElapsed % 3600) / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        timerEl.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);


    // --- UI Rendering Helpers ---
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
        lucide.createIcons();
    }

    function updateMetricsUI(data) {
        // Focus Percentage
        const focusVal = document.getElementById('focus-val');
        const focusBar = document.getElementById('focus-bar');
        focusVal.textContent = `${data.focusIndex}%`;
        focusBar.style.width = `${data.focusIndex}%`;

        // Load Percentage
        const loadVal = document.getElementById('load-val');
        const loadBar = document.getElementById('load-bar');
        loadVal.textContent = `${data.cognitiveLoad}%`;
        loadBar.style.width = `${data.cognitiveLoad}%`;

        // Response Delay Value
        const speedVal = document.getElementById('speed-val');
        const speedBar = document.getElementById('speed-bar');
        speedVal.textContent = `${data.responseTime} ms`;
        
        // Map 100ms-800ms onto a progress bar representation (lower ms = full bar, higher ms = empty bar)
        const speedPercentage = Math.max(5, Math.min(100, Math.round(100 - (data.responseTime - 150) * 0.15)));
        speedBar.style.width = `${speedPercentage}%`;
    }
});
