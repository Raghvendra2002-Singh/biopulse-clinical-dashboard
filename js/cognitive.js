/**
 * BioPulse Cognitive Assessment Games
 * Implements Stroop Color-Word inhibition task and spatial reflex click grid task.
 * Feeds back performance data (reaction speed, error rates) to the dashboard metrics.
 */

export class CognitiveAssessor {
    constructor(onMetricsUpdated) {
        this.onMetricsUpdated = onMetricsUpdated; // Callback to update profile sidebar stats

        // Colors list definitions
        this.colors = [
            { name: 'RED', hex: '#ef4444' },
            { name: 'BLUE', hex: '#3b82f6' },
            { name: 'GREEN', hex: '#10b981' },
            { name: 'YELLOW', hex: '#f59e0b' }
        ];

        // Stroop game states
        this.stroopTimer = null;
        this.stroopTimeRemaining = 10;
        this.stroopScore = { correct: 0, total: 0 };
        this.stroopStartTimestamp = null;
        this.stroopReactionTimes = [];
        this.currentStroopColorHex = '';

        // Grid game states
        this.gridTimer = null;
        this.gridTimeRemaining = 10;
        this.gridScore = 0;
        this.activeGridIndex = -1;

        this.init();
    }

    init() {
        // Tab switching logic
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

        // Stroop buttons
        document.getElementById('btn-start-stroop').addEventListener('click', () => this.startStroop());
        document.getElementById('btn-restart-stroop').addEventListener('click', () => this.startStroop());

        // Grid buttons
        document.getElementById('btn-start-grid').addEventListener('click', () => this.startGrid());
        document.getElementById('btn-restart-grid').addEventListener('click', () => this.startGrid());
        
        // Build the 4x4 Grid dots programmatically
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
        // Stop any running intervals
        clearInterval(this.stroopTimer);
        clearInterval(this.gridTimer);
        this.stroopTimer = null;
        this.gridTimer = null;

        // Reset views to intro screens
        document.getElementById('stroop-intro').classList.remove('hidden');
        document.getElementById('stroop-play').classList.add('hidden');
        document.getElementById('stroop-results').classList.add('hidden');

        document.getElementById('grid-intro').classList.remove('hidden');
        document.getElementById('grid-play').classList.add('hidden');
        document.getElementById('grid-results').classList.add('hidden');
    }

    /* ==========================================
       GAME 1: STROOP COLOR-WORD TASK
       ========================================== */
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
        // Pick random text and random styling color
        const textWord = this.colors[Math.floor(Math.random() * this.colors.length)];
        const colorWord = this.colors[Math.floor(Math.random() * this.colors.length)];

        this.currentStroopColorHex = colorWord.hex;
        
        const displayEl = document.getElementById('stroop-word-display');
        displayEl.textContent = textWord.name;
        displayEl.style.color = colorWord.hex;

        // Render response option buttons
        const optionsGrid = document.getElementById('stroop-options-grid');
        optionsGrid.innerHTML = '';

        // Shuffle options for added cognitive challenge
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

        // Calculate results
        const accuracy = this.stroopScore.total > 0 ? Math.round((this.stroopScore.correct / this.stroopScore.total) * 100) : 0;
        const totalReactionTime = this.stroopReactionTimes.reduce((a, b) => a + b, 0);
        const avgReactionTime = this.stroopReactionTimes.length > 0 ? Math.round(totalReactionTime / this.stroopReactionTimes.length) : 0;

        document.getElementById('stroop-count').textContent = this.stroopScore.total;
        
        const accEl = document.getElementById('stroop-acc');
        accEl.textContent = `${accuracy}%`;
        accEl.className = accuracy > 75 ? 'green' : (accuracy > 50 ? 'warning' : 'error');

        document.getElementById('stroop-delay').textContent = `${avgReactionTime} ms`;

        // Update bio-metrics profile values:
        // Focus index maps to accuracy, Reaction time maps to synaptic delay
        this.onMetricsUpdated({
            focusIndex: accuracy,
            cognitiveLoad: Math.round(50 + (100 - accuracy) * 0.5), // Lower accuracy translates to higher processing load
            responseTime: avgReactionTime
        });
    }


    /* ==========================================
       GAME 2: REACTION REFLEX TARGET GRID
       ========================================== */
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

        // Calculate average delay
        const reactionTimes = this.gridReactionTimes || [];
        const totalReactionTime = reactionTimes.reduce((a, b) => a + b, 0);
        const avgReactionTime = reactionTimes.length > 0 ? Math.round(totalReactionTime / reactionTimes.length) : 350;

        // Feedback values to patient profile:
        // Clicks speed maps to focus level, response time updates synaptic metrics
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
