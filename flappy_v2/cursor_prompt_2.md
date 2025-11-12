# Adjust bird gravity for better gameplay
_Exported on 11/12/2025 at 11:46:27 MST from Cursor (1.7.46)_

---

**User**

this is my basic game recreation of flappy bird. i want to improve it by having the bird fall at a slower rate, decreasing the gravitational power, so i can have more time to pick it up

---

**Cursor**


Examining the code to see how gravity is implemented.



Reducing gravity so the bird falls slower and gives more time to react.


```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Resume game
        gameState = 'playing';
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
    }
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
initLevelSelection();
gameLoop();

```


Reduced gravity from `0.25` to `0.15` (40% slower). The bird falls slower, giving more time to react. Checking for issues:



Change applied with no errors. The bird now falls at 40% of the previous rate, giving more time to react and control it.

**What changed:**
- Gravity reduced from `0.25` to `0.15`

This slows the downward acceleration. The jump strength is unchanged (`-5`), so jumps feel similar.

Test the game. If you want it slower, we can reduce gravity further (e.g., `0.12` or `0.1`). If it feels too floaty, we can increase it (e.g., `0.18`).

---

**User**

once i click continue after spending 10 coins, i want it to have a 3 second countdown to resume playing the game

---

**Cursor**


Adding a 3-second countdown after "Continue". Checking the HTML structure, then updating the code:



Reading the continueGame function:



Adding a countdown element and updating the code:



Implementing a 3-second countdown. Adding a countdown element in HTML, styling it in CSS, and updating the JavaScript to show and start it.


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flappy Bird</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Flappy Bird</h1>
        
        <!-- Level Selection Screen -->
        <div id="levelSelection" class="level-selection">
            <h2>Select Level</h2>
            <div id="coinDisplay" class="coin-display">💰 Coins: <span id="totalCoins">0</span></div>
            <div id="levelButtons" class="level-buttons"></div>
            <p class="level-instructions">Complete a level to unlock the next one!</p>
        </div>
        
        <!-- Game Screen -->
        <div id="gameScreen" class="hidden">
            <canvas id="gameCanvas" width="400" height="600"></canvas>
            <div class="instructions">
                <p>Press <strong>SPACE</strong> to flap and avoid the pipes!</p>
                <p id="levelInfo">Level: 1</p>
                <p id="progress">Progress: 0 / 0</p>
                <p id="score">Score: 0</p>
                <p id="coins">💰 Coins: 0</p>
                <p id="levelComplete" class="hidden">Level Complete! Press SPACE to continue</p>
                <button id="backToMenu" class="back-button">Back to Menu</button>
            </div>
        </div>
        
        <!-- Game Over Popup -->
        <div id="gameOverPopup" class="popup-overlay hidden">
            <div class="popup-content">
                <h2>Game Over!</h2>
                <p>What would you like to do?</p>
                <div class="popup-buttons">
                    <button id="playAgainBtn" class="popup-button play-again-btn">Play Again</button>
                    <button id="continueBtn" class="popup-button continue-btn">Continue (10 coins)</button>
                </div>
                <p id="notEnoughCoins" class="error-message hidden">Not enough coins!</p>
            </div>
        </div>
        
        <!-- Countdown Overlay -->
        <div id="countdownOverlay" class="countdown-overlay hidden">
            <div class="countdown-content">
                <div id="countdownText" class="countdown-text">3</div>
                <p class="countdown-message">Get ready!</p>
            </div>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>


```

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

.container {
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

h1 {
    color: #333;
    margin-bottom: 15px;
    font-size: 2.5em;
}

#gameCanvas {
    border: 3px solid #333;
    border-radius: 10px;
    background: linear-gradient(to bottom, #87CEEB 0%, #87CEEB 70%, #90EE90 70%, #90EE90 100%);
    display: block;
    margin: 0 auto;
}

.instructions {
    margin-top: 15px;
    color: #555;
}

.instructions p {
    margin: 8px 0;
    font-size: 1.1em;
}

#score {
    font-size: 1.5em;
    font-weight: bold;
    color: #667eea;
}

#gameOver {
    font-size: 1.3em;
    font-weight: bold;
    color: #e74c3c;
    margin-top: 10px;
}

.hidden {
    display: none;
}

/* Level Selection Styles */
.level-selection {
    padding: 20px;
}

.level-selection h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2em;
}

.level-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.level-button {
    padding: 20px;
    font-size: 1.5em;
    font-weight: bold;
    border: 3px solid #333;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    transition: all 0.3s;
}

.level-button:hover:not(.locked) {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.level-button.locked {
    background: #ccc;
    color: #888;
    cursor: not-allowed;
    opacity: 0.6;
}

.level-button.completed {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.level-instructions {
    color: #666;
    font-size: 1em;
    margin-top: 15px;
}

.coin-display {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 20px;
    padding: 10px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    border-radius: 10px;
    color: #333;
    display: inline-block;
}

#coins {
    font-size: 1.2em;
    font-weight: bold;
    color: #FFD700;
}

#levelInfo {
    font-size: 1.3em;
    font-weight: bold;
    color: #764ba2;
}

#progress {
    font-size: 1.2em;
    font-weight: bold;
    color: #e67e22;
}

#levelComplete {
    font-size: 1.3em;
    font-weight: bold;
    color: #27ae60;
    margin-top: 10px;
}

.back-button {
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 1em;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.back-button:hover {
    background: #5568d3;
}

/* Game Over Popup Styles */
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.popup-overlay.hidden {
    display: none !important;
}

.popup-content {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    text-align: center;
    max-width: 400px;
    width: 90%;
}

.popup-content h2 {
    color: #e74c3c;
    margin-bottom: 15px;
    font-size: 2em;
}

.popup-content p {
    color: #555;
    margin-bottom: 20px;
    font-size: 1.1em;
}

.popup-buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
}

.popup-button {
    padding: 15px 30px;
    font-size: 1.2em;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    color: white;
}

.play-again-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.play-again-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.continue-btn {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #333;
}

.continue-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.continue-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error-message {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: 10px;
    font-weight: bold;
}

/* Countdown Overlay Styles */
.countdown-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.countdown-overlay.hidden {
    display: none !important;
}

.countdown-content {
    text-align: center;
}

.countdown-text {
    font-size: 8em;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6);
    animation: pulse 1s ease-in-out;
    line-height: 1;
    margin-bottom: 20px;
}

.countdown-message {
    font-size: 2em;
    color: white;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

@keyframes pulse {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }
    50% {
        transform: scale(1.2);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}


```


Updating JavaScript to add countdown references and modify `continueGame` to show the countdown and start a 3-second timer:


```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Resume game
        gameState = 'playing';
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
    }
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
initLevelSelection();
gameLoop();

```


Updating `continueGame` to add a 3-second countdown before resuming, and preventing input during the countdown:


```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
initLevelSelection();
gameLoop();

```


Updating the `jump` function to prevent input during countdown, and ensuring the game loop handles the countdown state:



Jump only works when `gameState === 'playing'`, so it's blocked during countdown. Verifying the game loop doesn't update during countdown and updating it if needed:



Verifying that update functions only run when `gameState === 'playing'`:



Update functions only run when `gameState === 'playing'`, so the game pauses during countdown. Ensuring the countdown overlay is hidden on initialization:


```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden'); // Ensure countdown is hidden on startup
initLevelSelection();
gameLoop();

```


Preventing multiple countdown timers if "Continue" is clicked multiple times:


```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete', 'countdown'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;
let countdownInterval = null;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden'); // Ensure countdown is hidden on startup
initLevelSelection();
gameLoop();

```

```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete', 'countdown'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;
let countdownInterval = null;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    countdownText.style.animation = 'pulse 1s ease-in-out';
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden'); // Ensure countdown is hidden on startup
initLevelSelection();
gameLoop();

```


Updating `returnToMenu` to clear any countdown and hide the overlay:


```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete', 'countdown'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;
let countdownInterval = null;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    countdownText.style.animation = 'pulse 1s ease-in-out';
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    countdownOverlay.classList.add('hidden'); // Hide countdown when returning to menu
    // Clear any active countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden'); // Ensure countdown is hidden on startup
initLevelSelection();
gameLoop();

```


Verifying everything works and checking for issues:



Implementation complete. Summary:

## Changes made:

1. **HTML** (`index.html`):
   - Added a countdown overlay with a large countdown number and "Get ready!" message

2. **CSS** (`style.css`):
   - Styled the countdown overlay (dark semi-transparent background)
   - Large golden countdown number (8em) with glow
   - Pulse animation for each number
   - "GO!" message at the end

3. **JavaScript** (`game.js`):
   - Added references to the countdown overlay elements
   - Updated `gameState` to include `'countdown'`
   - Modified `continueGame()` to start the countdown instead of immediately resuming
   - Added `startCountdown()` that:
     - Shows the countdown overlay
     - Counts down from 3 to 1
     - Shows "GO!" after 3 seconds
     - Resumes the game after 0.5 seconds
   - Prevents input during countdown (jump only works when `gameState === 'playing'`)
   - Ensures updates pause during countdown
   - Clears countdown intervals on cleanup

## How it works:

1. Click "Continue (10 coins)"
2. Game over popup hides
3. 3-second countdown appears with large numbers (3 → 2 → 1 → GO!)
4. Game pauses during countdown (bird, pipes, coins frozen)
5. After countdown, game resumes with the bird in the center

Ready to test. The countdown gives a moment to prepare before the game resumes.

---

**User**

in the pop up display, also add a "return back to main menu" option

---

**Cursor**


Checking the game over popup structure to add a "Return to Main Menu" button.



Checking where the popup buttons are initialized in JavaScript:



Checking CSS for popup button styling:



Adding a "Return to Main Menu" button to the popup: updating HTML, CSS, and JavaScript.


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flappy Bird</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Flappy Bird</h1>
        
        <!-- Level Selection Screen -->
        <div id="levelSelection" class="level-selection">
            <h2>Select Level</h2>
            <div id="coinDisplay" class="coin-display">💰 Coins: <span id="totalCoins">0</span></div>
            <div id="levelButtons" class="level-buttons"></div>
            <p class="level-instructions">Complete a level to unlock the next one!</p>
        </div>
        
        <!-- Game Screen -->
        <div id="gameScreen" class="hidden">
            <canvas id="gameCanvas" width="400" height="600"></canvas>
            <div class="instructions">
                <p>Press <strong>SPACE</strong> to flap and avoid the pipes!</p>
                <p id="levelInfo">Level: 1</p>
                <p id="progress">Progress: 0 / 0</p>
                <p id="score">Score: 0</p>
                <p id="coins">💰 Coins: 0</p>
                <p id="levelComplete" class="hidden">Level Complete! Press SPACE to continue</p>
                <button id="backToMenu" class="back-button">Back to Menu</button>
            </div>
        </div>
        
        <!-- Game Over Popup -->
        <div id="gameOverPopup" class="popup-overlay hidden">
            <div class="popup-content">
                <h2>Game Over!</h2>
                <p>What would you like to do?</p>
                <div class="popup-buttons">
                    <button id="playAgainBtn" class="popup-button play-again-btn">Play Again</button>
                    <button id="continueBtn" class="popup-button continue-btn">Continue (10 coins)</button>
                    <button id="returnToMenuBtn" class="popup-button return-to-menu-btn">Return to Main Menu</button>
                </div>
                <p id="notEnoughCoins" class="error-message hidden">Not enough coins!</p>
            </div>
        </div>
        
        <!-- Countdown Overlay -->
        <div id="countdownOverlay" class="countdown-overlay hidden">
            <div class="countdown-content">
                <div id="countdownText" class="countdown-text">3</div>
                <p class="countdown-message">Get ready!</p>
            </div>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>


```

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

.container {
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

h1 {
    color: #333;
    margin-bottom: 15px;
    font-size: 2.5em;
}

#gameCanvas {
    border: 3px solid #333;
    border-radius: 10px;
    background: linear-gradient(to bottom, #87CEEB 0%, #87CEEB 70%, #90EE90 70%, #90EE90 100%);
    display: block;
    margin: 0 auto;
}

.instructions {
    margin-top: 15px;
    color: #555;
}

.instructions p {
    margin: 8px 0;
    font-size: 1.1em;
}

#score {
    font-size: 1.5em;
    font-weight: bold;
    color: #667eea;
}

#gameOver {
    font-size: 1.3em;
    font-weight: bold;
    color: #e74c3c;
    margin-top: 10px;
}

.hidden {
    display: none;
}

/* Level Selection Styles */
.level-selection {
    padding: 20px;
}

.level-selection h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2em;
}

.level-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.level-button {
    padding: 20px;
    font-size: 1.5em;
    font-weight: bold;
    border: 3px solid #333;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    transition: all 0.3s;
}

.level-button:hover:not(.locked) {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.level-button.locked {
    background: #ccc;
    color: #888;
    cursor: not-allowed;
    opacity: 0.6;
}

.level-button.completed {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.level-instructions {
    color: #666;
    font-size: 1em;
    margin-top: 15px;
}

.coin-display {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 20px;
    padding: 10px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    border-radius: 10px;
    color: #333;
    display: inline-block;
}

#coins {
    font-size: 1.2em;
    font-weight: bold;
    color: #FFD700;
}

#levelInfo {
    font-size: 1.3em;
    font-weight: bold;
    color: #764ba2;
}

#progress {
    font-size: 1.2em;
    font-weight: bold;
    color: #e67e22;
}

#levelComplete {
    font-size: 1.3em;
    font-weight: bold;
    color: #27ae60;
    margin-top: 10px;
}

.back-button {
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 1em;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.back-button:hover {
    background: #5568d3;
}

/* Game Over Popup Styles */
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.popup-overlay.hidden {
    display: none !important;
}

.popup-content {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    text-align: center;
    max-width: 400px;
    width: 90%;
}

.popup-content h2 {
    color: #e74c3c;
    margin-bottom: 15px;
    font-size: 2em;
}

.popup-content p {
    color: #555;
    margin-bottom: 20px;
    font-size: 1.1em;
}

.popup-buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
}

.popup-button {
    padding: 15px 30px;
    font-size: 1.2em;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    color: white;
}

.play-again-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.play-again-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.continue-btn {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #333;
}

.continue-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.continue-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.return-to-menu-btn {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;
}

.return-to-menu-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(149, 165, 166, 0.4);
}

.error-message {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: 10px;
    font-weight: bold;
}

/* Countdown Overlay Styles */
.countdown-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.countdown-overlay.hidden {
    display: none !important;
}

.countdown-content {
    text-align: center;
}

.countdown-text {
    font-size: 8em;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6);
    animation: pulse 1s ease-in-out;
    line-height: 1;
    margin-bottom: 20px;
}

.countdown-message {
    font-size: 2em;
    color: white;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

@keyframes pulse {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }
    50% {
        transform: scale(1.2);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}


```

```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const returnToMenuBtn = document.getElementById('returnToMenuBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete', 'countdown'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;
let countdownInterval = null;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    countdownText.style.animation = 'pulse 1s ease-in-out';
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    countdownOverlay.classList.add('hidden'); // Hide countdown when returning to menu
    // Clear any active countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden'); // Ensure countdown is hidden on startup
initLevelSelection();
gameLoop();

```

```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const returnToMenuBtn = document.getElementById('returnToMenuBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete', 'countdown'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;
let countdownInterval = null;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    countdownText.style.animation = 'pulse 1s ease-in-out';
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    gameOverPopup.classList.add('hidden'); // Hide popup when returning to menu
    notEnoughCoinsElement.classList.add('hidden');
    countdownOverlay.classList.add('hidden'); // Hide countdown when returning to menu
    // Clear any active countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    initLevelSelection(); // Refresh to show newly unlocked levels
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);
returnToMenuBtn.addEventListener('click', returnToMenu);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden'); // Ensure countdown is hidden on startup
initLevelSelection();
gameLoop();

```


Checking for linting errors:



Added the "Return to Main Menu" button to the game over popup.

## Changes Made:

1. **HTML** (`index.html`):
   - Added a "Return to Main Menu" button in the popup, below the other buttons

2. **CSS** (`style.css`):
   - Added styling for `.return-to-menu-btn` (gray gradient, hover scale/shadow)

3. **JavaScript** (`game.js`):
   - Added a reference to the new button (`returnToMenuBtn`)
   - Added a click event listener that calls `returnToMenu()`

## How it works:

The popup now shows three buttons:
1. Play Again — restarts the current level
2. Continue (10 coins) — continues from the current position (with countdown)
3. Return to Main Menu — returns to the level selection screen

The new button uses a gray gradient to differentiate it. It hides the popup, clears any active countdown, and returns to the level selection screen, consistent with the existing "Back to Menu" button on the game screen.

Ready to test. The button is functional and styled.

---

**User**

ensure that when you press the return to main menu, it will go back to the screen with the levels 

---

**Cursor**


Checking `returnToMenu()` and confirming it shows the level selection screen and hides the popup.



Updating `returnToMenu()` to clear the popup’s inline display so it hides correctly, and ensuring the level selection screen shows:


```javascript
// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelCompleteElement = document.getElementById('levelComplete');
const gameOverPopup = document.getElementById('gameOverPopup');
const playAgainBtn = document.getElementById('playAgainBtn');
const continueBtn = document.getElementById('continueBtn');
const returnToMenuBtn = document.getElementById('returnToMenuBtn');
const notEnoughCoinsElement = document.getElementById('notEnoughCoins');
const levelInfoElement = document.getElementById('levelInfo');
const progressElement = document.getElementById('progress');
const coinsElement = document.getElementById('coins');
const totalCoinsElement = document.getElementById('totalCoins');
const levelSelectionElement = document.getElementById('levelSelection');
const gameScreenElement = document.getElementById('gameScreen');
const levelButtonsElement = document.getElementById('levelButtons');
const backToMenuButton = document.getElementById('backToMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');

// Level definitions
const levels = [
    {
        name: "Level 1",
        pipeSpeed: 2,
        pipeGap: 180,
        pipeSpawnInterval: 140,
        totalPipes: 5,
        description: "Easy - Pass 5 pipes"
    },
    {
        name: "Level 2",
        pipeSpeed: 2.5,
        pipeGap: 160,
        pipeSpawnInterval: 130,
        totalPipes: 8,
        description: "Medium - Pass 8 pipes"
    },
    {
        name: "Level 3",
        pipeSpeed: 3,
        pipeGap: 150,
        pipeSpawnInterval: 120,
        totalPipes: 12,
        description: "Hard - Pass 12 pipes"
    },
    {
        name: "Level 4",
        pipeSpeed: 3.5,
        pipeGap: 140,
        pipeSpawnInterval: 110,
        totalPipes: 18,
        description: "Very Hard - Pass 18 pipes"
    },
    {
        name: "Level 5",
        pipeSpeed: 4,
        pipeGap: 130,
        pipeSpawnInterval: 100,
        totalPipes: 25,
        description: "Expert - Pass 25 pipes"
    },
    {
        name: "Level 6",
        pipeSpeed: 4.5,
        pipeGap: 120,
        pipeSpawnInterval: 90,
        totalPipes: 35,
        description: "Master - Pass 35 pipes"
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete', 'countdown'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;
let countdownInterval = null;

// Level settings (will be set based on selected level)
let pipeWidth = 60;
let pipeGap = 150;
let pipeSpeed = 3;
let pipeSpawnInterval = 120;
let totalPipes = 0;
let pipesSpawned = 0;
let finishLineX = null;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#FFD700'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes

// LocalStorage functions
function getUnlockedLevels() {
    const unlocked = localStorage.getItem('unlockedLevels');
    return unlocked ? JSON.parse(unlocked) : [0]; // Level 0 (first level) is always unlocked
}

function unlockLevel(levelIndex) {
    const unlocked = getUnlockedLevels();
    if (!unlocked.includes(levelIndex) && levelIndex < levels.length) {
        unlocked.push(levelIndex);
        localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
    }
}

function isLevelUnlocked(levelIndex) {
    return getUnlockedLevels().includes(levelIndex);
}

function markLevelCompleted(levelIndex) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelIndex)) {
        completed.push(levelIndex);
        localStorage.setItem('completedLevels', JSON.stringify(completed));
    }
}

function getCompletedLevels() {
    const completed = localStorage.getItem('completedLevels');
    return completed ? JSON.parse(completed) : [];
}

function isLevelCompleted(levelIndex) {
    return getCompletedLevels().includes(levelIndex);
}

// Coin functions
function getCoins() {
    const coins = localStorage.getItem('totalCoins');
    return coins ? parseInt(coins) : 0;
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function spendCoins(amount) {
    const currentCoins = getCoins();
    if (currentCoins >= amount) {
        localStorage.setItem('totalCoins', (currentCoins - amount).toString());
        updateCoinDisplay();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const totalCoins = getCoins();
    if (totalCoinsElement) {
        totalCoinsElement.textContent = totalCoins;
    }
    if (coinsElement) {
        coinsElement.textContent = `💰 Coins: ${totalCoins}`;
    }
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.textContent = index + 1;
        button.title = level.description;
        
        if (!isLevelUnlocked(index)) {
            button.classList.add('locked');
        } else if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        if (isLevelUnlocked(index)) {
            button.addEventListener('click', () => startLevel(index));
        }
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed;
    pipeGap = currentLevel.pipeGap;
    pipeSpawnInterval = currentLevel.pipeSpawnInterval;
    totalPipes = currentLevel.totalPipes;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `Level: ${levelIndex + 1}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    
    // Reset bird
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Reset pipes
    pipes.length = 0;
    pipeSpawnTimer = 0;
    createPipe();
    pipesSpawned = 1;
    
    // Reset coins
    coins.length = 0;
    coinSpawnTimer = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Show game screen, hide level selection
    levelSelectionElement.classList.add('hidden');
    gameScreenElement.classList.remove('hidden');
}

// Initialize first pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Create coin
function createCoin() {
    // Find a safe Y position that avoids pipes
    const coinSize = 20;
    let coinY;
    let attempts = 0;
    let safePosition = false;
    
    // Try to find a safe position
    while (!safePosition && attempts < 10) {
        coinY = 50 + Math.random() * (canvas.height - 100); // Random Y, avoiding top/bottom edges
        
        // Check if this position would overlap with any nearby pipes
        let tooCloseToPipe = false;
        pipes.forEach(pipe => {
            const distance = Math.abs(pipe.x - canvas.width);
            // Only check pipes that are close to spawn point
            if (distance < 100) {
                // Check if coin would be in pipe area
                if (coinY < pipe.topHeight || coinY + coinSize > pipe.bottomY) {
                    tooCloseToPipe = true;
                }
            }
        });
        
        if (!tooCloseToPipe) {
            safePosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a safe position, use center
    if (!safePosition) {
        coinY = canvas.height / 2;
    }
    
    coins.push({
        x: canvas.width,
        y: coinY,
        size: coinSize,
        collected: false,
        rotation: 0
    });
}

// Draw finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishLineX, 0);
    ctx.lineTo(finishLineX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw "FINISH" text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Draw bird
function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    ctx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    ctx.closePath();
    ctx.fill();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
            coin.rotation += 0.1;
            ctx.rotate(coin.rotation);
            
            // Draw coin (golden circle)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw coin border
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw $ symbol
            ctx.fillStyle = '#FF8C00';
            ctx.font = `${coin.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
            
            ctx.restore();
        }
    });
}

// Update bird
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check boundaries
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            gameOver();
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }
}

// Update pipes
function updatePipes() {
    if (gameState === 'playing') {
        // Spawn new pipes until we reach the total
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        // Show finish line when all pipes are passed
        if (score >= totalPipes && finishLineX === null) {
            // Find the rightmost pipe position and place finish line after it
            let rightmostX = bird.x + 200; // Default position ahead of bird
            if (pipes.length > 0) {
                pipes.forEach(pipe => {
                    if (pipe.x + pipeWidth > rightmostX) {
                        rightmostX = pipe.x + pipeWidth;
                    }
                });
                finishLineX = rightmostX + 150;
            } else {
                // If no pipes left, place finish line ahead of bird
                finishLineX = bird.x + 200;
            }
        }
        
        // Move pipes
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
                
                // Check if all pipes are passed - complete level immediately
                if (score >= totalPipes) {
                    completeLevel();
                }
            }
        });
        
        // Move finish line (visual indicator only)
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        // Remove off-screen pipes
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        // Spawn coins periodically
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            // Only spawn coins if we haven't reached the pipe limit
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        // Move coins
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        // Remove off-screen or collected coins
        for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i].collected || coins[i].x + coins[i].size < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    // Check pipe collisions
    pipes.forEach(pipe => {
        // Check collision with top pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom pipe
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            bird.y + bird.height > pipe.bottomY) {
            gameOver();
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinCenterX = coin.x + coin.size / 2;
            const coinCenterY = coin.y + coin.size / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            // Check if bird is close enough to collect coin
            if (distance < (coin.size / 2 + bird.width / 2)) {
                coin.collected = true;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex'; // Ensure popup is visible
        notEnoughCoinsElement.classList.add('hidden');
        
        // Update continue button based on available coins
        const hasEnoughCoins = getCoins() >= 10;
        continueBtn.disabled = !hasEnoughCoins;
        if (!hasEnoughCoins) {
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }
    }
}

// Complete level
function completeLevel() {
    if (gameState === 'playing') {
        gameState = 'levelComplete';
        levelCompleteElement.classList.remove('hidden');
        gameOverPopup.classList.add('hidden');
        
        // Mark level as completed
        markLevelCompleted(currentLevelIndex);
        
        // Unlock next level
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        // Check if user has enough coins
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        // Remove next 2-3 pipes and move them to the back
        const pipesToRemove = Math.min(3, pipes.length);
        const removedPipes = [];
        
        // Remove pipes that are ahead of the bird
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].x > bird.x && removedPipes.length < pipesToRemove) {
                removedPipes.push(pipes.splice(i, 1)[0]);
            }
        }
        
        // Move removed pipes to the back (far right)
        removedPipes.forEach(pipe => {
            pipe.x = canvas.width + 200 + Math.random() * 200; // Place them far ahead
            pipe.passed = false; // Reset passed status
            pipes.push(pipe);
        });
        
        // Sort pipes by x position to maintain order
        pipes.sort((a, b) => a.x - b.x);
        
        // Reset bird to middle of screen
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        // Clear collected coins that are off-screen
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        // Hide game over popup
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        // Force hide popup with inline style as backup
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        // Ensure game screen is visible
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        // Start countdown
        startCountdown();
    }
}

// Start countdown before resuming game
function startCountdown() {
    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    
    let countdown = 3;
    countdownText.textContent = countdown;
    countdownText.style.animation = 'pulse 1s ease-in-out';
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            // Trigger animation by briefly removing and adding class
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownText.textContent = 'GO!';
            
            // Hide countdown and resume game after a brief delay
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
            }, 500);
        }
    }, 1000);
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        // Reset coins
        coins.length = 0;
        coinSpawnTimer = 0;
    }
}

// Return to menu
function returnToMenu() {
    // Set game state to menu
    gameState = 'menu';
    
    // Show level selection screen
    levelSelectionElement.classList.remove('hidden');
    
    // Hide game screen
    gameScreenElement.classList.add('hidden');
    
    // Hide game over popup (both class and inline style)
    gameOverPopup.classList.add('hidden');
    gameOverPopup.style.display = 'none';
    
    // Hide error messages
    notEnoughCoinsElement.classList.add('hidden');
    
    // Hide countdown overlay
    countdownOverlay.classList.add('hidden');
    
    // Clear any active countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Refresh level selection to show newly unlocked levels
    initLevelSelection();
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
    // Game over now uses popup buttons, not space key
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

// Mouse/touch input
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Back to menu button
backToMenuButton.addEventListener('click', returnToMenu);

// Game over popup buttons
playAgainBtn.addEventListener('click', resetGame);
continueBtn.addEventListener('click', continueGame);
returnToMenuBtn.addEventListener('click', returnToMenu);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        updateBird();
        updatePipes();
        updateCoins();
        checkCollisions();
        
        drawPipes();
        drawCoins();
        drawFinishLine();
        drawBird();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateCoinDisplay(); // Initialize coin display
gameOverPopup.classList.add('hidden'); // Ensure popup is hidden on startup
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden'); // Ensure countdown is hidden on startup
initLevelSelection();
gameLoop();

```


Updated `returnToMenu()` for reliability:

- Hides the popup using both the `hidden` class and inline `display: none` (consistent with `continueGame()`)
- Sets game state to `'menu'`
- Shows the level selection screen
- Hides the game screen
- Clears any active countdown
- Refreshes the level selection

Verifying the implementation flow:



The implementation looks correct. Verifying the button is connected:



Verifying the button event listener setup:



Checking that the popup's return to menu button is connected:



Checking the popup button event listeners:



The button is connected. Verifying the returnToMenu function flow:



Everything is correctly set up.

## Summary of Changes:

The `returnToMenu()` function was updated to:

1. Set game state to `'menu'`
2. Show the level selection screen by removing the `hidden` class from `levelSelectionElement`
3. Hide the game screen by adding the `hidden` class to `gameScreenElement`
4. Hide the popup using both:
   - Adding the `hidden` class
   - Setting inline `display: none` (prevents inline `display: flex` from `gameOver()` from blocking it)
5. Hide error messages and countdown overlay
6. Clear any active countdown intervals
7. Refresh the level selection screen to show newly unlocked levels

## How it works:

When you click the "Return to Main Menu" button in the game over popup:
- The popup closes
- The game screen hides
- The level selection screen appears
- The level buttons refresh (newly unlocked levels appear)
- All game state is reset

The button event listener is connected on line 778, so clicking "Return to Main Menu" in the popup returns to the level selection screen.

Ready to test. It should work as expected.

