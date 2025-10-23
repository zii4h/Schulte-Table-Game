
let gridSize = 3;
let clickColor = 'green';
let showColors = true;

let gameState = 'ready';
let currentNumber = 1;
let startTime = 0;
let timerInterval = null;
let timeElapsed = 0;
let maxNumber = gridSize * gridSize;

const colorMap = {
    green: '#6ee7b7b4',
    blue: '#93c4fdab',
    purple: '#c3b5fdaf',
    pink: '#f9a8d4a6',
    yellow: '#fddf479c',
    orange: '#fdbb74a1'
};

const textColorMap = {
    green: '#065f46',
    blue: '#1e3a8a',
    purple: '#4c1d95',
    pink: '#831843',
    yellow: '#713f12',
    orange: '#7c2d12'
};

// Theme-specific gray colors for when showColors is FALSE
const LIGHT_MODE_GRAY = '#cacacaea';      
const DARK_MODE_GRAY = '#414141ff';       
const TEXT_COLOR_LIGHT = '#6e6e6eff';     
const TEXT_COLOR_DARK = '#aaaaaaff';   


const board = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const timerDisplay = document.getElementById('timer-display');
const targetNumberDisplay = document.getElementById('target-number');
const highScoreDisplay = document.getElementById('high-score');
const showColorsCheckbox = document.getElementById('show-colors');
const darkModeToggle = document.getElementById('dark-mode-toggle');


/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Formats milliseconds into MM:SS.ms format (timer)
 */
function formatTime(ms) {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const hundredths = Math.floor((ms % 1000) / 10);
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}

/**
 * Checks if dark mode is active
 */
function isDarkMode() {
    return document.body.classList.contains('dark-mode');
}


/**
 * Loads the high score for the current grid size
 */
function loadHighScore() {
    const key = `highScore_${gridSize}x${gridSize}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        highScoreDisplay.textContent = formatTime(parseInt(saved));
    } else {
        highScoreDisplay.textContent = '--:--';
    }
}

/**
 * Saves the high score if it's a new best
 */
function saveHighScore(time) {
    const key = `highScore_${gridSize}x${gridSize}`;
    const currentBest = localStorage.getItem(key);
    if (!currentBest || time < parseInt(currentBest)) {
        localStorage.setItem(key, time.toString());
        loadHighScore();
        return true;
    }
    return false;
}

/**
 * Creates and renders the game board
 */
function createBoard() {
    maxNumber = gridSize * gridSize;
    const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    shuffleArray(numbers);

    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    board.className = `schulte-grid grid-${gridSize}`;

    numbers.forEach(number => {
        const cell = document.createElement('div');
        cell.className = 'schulte-cell';
        cell.textContent = number;
        cell.dataset.number = number;
        board.appendChild(cell);
    });

    timerDisplay.textContent = '00:00.00';
    targetNumberDisplay.textContent = '1';
}

/**
 * Starts the game timer
 */
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timeElapsed = 0;
    timerInterval = setInterval(() => {
        timeElapsed = Date.now() - startTime;
        timerDisplay.textContent = formatTime(timeElapsed);
    }, 10);
}

/**
 * Stops the game timer
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Starts or resets the game
 */
function startGame() {
    stopTimer();
    gameState = 'playing';
    currentNumber = 1;
    maxNumber = gridSize * gridSize;
    createBoard();
    startButton.textContent = 'Reset';
    targetNumberDisplay.textContent = '1';
    loadHighScore();
}

/**
 * Handles cell click events
 */
function checkClick(event) {
    if (gameState !== 'playing') return;

    const cell = event.target.closest('.schulte-cell');
    if (!cell) return;

    const clickedNumber = parseInt(cell.dataset.number, 10);

    if (clickedNumber === currentNumber) {
        // Correct click
        if (currentNumber === 1) {
            startTimer();
        }

        if (showColors) {
            cell.style.backgroundColor = colorMap[clickColor];
            
            if (isDarkMode()) {
                cell.style.color = '#ffffff'; 
            } else {
                cell.style.color = textColorMap[clickColor]; 
            }
        } else {
            if (isDarkMode()) {
                cell.style.backgroundColor = DARK_MODE_GRAY;
                cell.style.color = TEXT_COLOR_DARK;
            } else {
                cell.style.backgroundColor = LIGHT_MODE_GRAY;
                cell.style.color = TEXT_COLOR_LIGHT;
            }
        }
        cell.style.pointerEvents = 'none';

        currentNumber++;

        if (currentNumber > maxNumber) {
            // Game won
            gameState = 'finished';
            stopTimer();

            saveHighScore(timeElapsed);

            startButton.textContent = 'Play Again';
            targetNumberDisplay.textContent = '✓';
        } else {
            targetNumberDisplay.textContent = currentNumber;
        }
    } else {
        // Incorrect click
        cell.classList.add('incorrect');
        setTimeout(() => {
            cell.classList.remove('incorrect');
        }, 500);
    }
}


// Grid size buttons
document.querySelectorAll('.grid-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        gridSize = parseInt(this.dataset.size);
        gameState = 'ready';
        currentNumber = 1;
        stopTimer();
        createBoard();
        startButton.textContent = 'Start Game';
        loadHighScore();
    });
});

// Color options
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        clickColor = this.dataset.color;
    });
});

// Show colors checkbox
showColorsCheckbox.addEventListener('change', function() {
    showColors = this.checked;
});

// Dark mode toggle
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});

// Start button
startButton.addEventListener('click', startGame);

// Board click handler
board.addEventListener('click', checkClick);

// Initialize on page load
window.onload = function() {
    createBoard();
    loadHighScore();
};