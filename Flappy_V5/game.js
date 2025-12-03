// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;

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
const countdownMessage = document.getElementById('countdownMessage');
const gameOverCoinsCount = document.getElementById('gameOverCoinsCount');
const levelCompletePopup = document.getElementById('levelCompletePopup');
const levelCompleteCoinsCount = document.getElementById('levelCompleteCoinsCount');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const returnToMenuFromCompleteBtn = document.getElementById('returnToMenuFromCompleteBtn');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const levelCompleteTitle = document.getElementById('levelCompleteTitle');
const levelCompleteMessage = document.getElementById('levelCompleteMessage');

// Soundtrack setup (per country)
const soundtrackSources = {
    Brazil: 'Soundtracks/Brazil.mp3',
    Japan: 'Soundtracks/Japan.mp3',
    France: 'Soundtracks/Paris.mp3',
    Egypt: 'Soundtracks/Egypt.mp3',
    USA: 'Soundtracks/USA.mp3',
    Australia: 'Soundtracks/Australia.mp3'
};
let currentMusic = null;
let currentMusicCountry = null;
let musicFadeInterval = null;
const MUSIC_VOLUME = 0.45;
const MUSIC_FADE_MS = 600;
let deathCount = 0;
let clearCount = 0;

// Background images by country
const backgroundSources = {};
const backgroundImages = {};
const backgroundReady = {};
function registerBackground(country, src) {
    backgroundSources[country] = src;
    const img = new Image();
    backgroundReady[country] = false;
    img.onload = () => { backgroundReady[country] = true; };
    img.src = src;
    backgroundImages[country] = img;
}

registerBackground('Brazil', 'Backgrounds/Brazil.png');
registerBackground('Japan', 'Backgrounds/Japan.png');
registerBackground('France', 'Backgrounds/Paris.png');
registerBackground('USA', 'Backgrounds/USA.png');
registerBackground('Egypt', 'Backgrounds/Egypt.png');
registerBackground('Australia', 'Backgrounds/Australia.png');

// Shared balloon image (used for every level)
const balloonImage = new Image();
let balloonReady = false;
balloonImage.onload = () => { balloonReady = true; };
balloonImage.src = 'Balloon.png';

// Coin image
const coinImage = new Image();
let coinReady = false;
let coinSpriteRatio = 1;
coinImage.onload = () => {
    coinReady = true;
    if (coinImage.height !== 0) {
        coinSpriteRatio = coinImage.width / coinImage.height;
    }
    coins.forEach(c => {
        const size = c.size || 60;
        c.width = size * coinSpriteRatio;
        c.height = size;
        c.hitRadius = Math.min(c.width, c.height) / 2;
    });
};
coinImage.src = 'Coin.png';

const defaultPalette = {
    skyTop: '#8bd0ff',
    skyMid: '#bde5ff',
    skyBottom: '#e2f6ff',
    horizon: '#c5ead3',
    ground: '#7fc98a',
    detail: '#ff9f6e',
    obstacle: '#d8f3ff',
    outline: '#1f2f56',
    banner: '#ffbe3d',
    cloud: '#ffffff',
    cloudShadow: '#d2e8ff'
};

// Single pillar theme (blue-ish) used for every level
const pillarTheme = { base: '#4f7ac8', shade: '#335ba4', accent1: '#4f7ac8', accent2: '#4f7ac8' };

// Level definitions
const levels = [
    {
        name: "Fuji Ascent",
        country: "Japan",
        pipeSpeed: 1.2,
        pipeGap: 260,
        pipeSpawnInterval: 190,
        totalPipes: 3,
        description: "Rising toward Mt. Fuji's snowy crown.",
        palette: {
            skyTop: '#7cc8ff',
            skyMid: '#b5e5ff',
            skyBottom: '#e7f7ff',
            horizon: '#cde6d6',
            ground: '#7aa85a',
            detail: '#f07ba5',
            obstacle: '#d8f3ff',
            outline: '#1f2f56',
            banner: '#ffbe3d',
            cloud: '#ffffff',
            cloudShadow: '#d2e8ff'
        },
        landmarks: ['pagoda', 'torii']
    },
    {
        name: "Paris Lights",
        country: "France",
        pipeSpeed: 1.4,
        pipeGap: 250,
        pipeSpawnInterval: 185,
        totalPipes: 4,
        description: "Twilight over the Seine.",
        palette: {
            skyTop: '#f8b35c',
            skyMid: '#f28b45',
            skyBottom: '#f5d18b',
            horizon: '#f0b874',
            ground: '#5a4d64',
            detail: '#f7d9a1',
            obstacle: '#f9e5bf',
            outline: '#2f2140',
            banner: '#ffd271',
            cloud: '#ffe6b4',
            cloudShadow: '#e5b478'
        },
        landmarks: ['paris-skyline']
    },
    {
        name: "Cairo Currents",
        country: "Egypt",
        pipeSpeed: 1.6,
        pipeGap: 245,
        pipeSpawnInterval: 180,
        totalPipes: 5,
        description: "Desert thermals by pyramids.",
        palette: {
            skyTop: '#ffdf9a',
            skyMid: '#ffd4a0',
            skyBottom: '#ffe8c7',
            horizon: '#f1d4a8',
            ground: '#d9a25f',
            detail: '#f78f3f',
            obstacle: '#ffe9c2',
            outline: '#6a3b1a',
            banner: '#ffbe3d',
            cloud: '#fff1d5',
            cloudShadow: '#e8c59f'
        },
        landmarks: ['pyramids', 'palm']
    },
    {
        name: "Rio Breeze",
        country: "Brazil",
        pipeSpeed: 1.8,
        pipeGap: 240,
        pipeSpawnInterval: 175,
        totalPipes: 6,
        totalPipesOverride: 15,
        pipeSpacingDistance: 380,
        description: "Beach fronts and lush hills.",
        palette: {
            skyTop: '#7ae0ff',
            skyMid: '#a5f1ff',
            skyBottom: '#d8ffec',
            horizon: '#b4f2c1',
            ground: '#5cb37a',
            detail: '#ff8b57',
            obstacle: '#d6f7ff',
            outline: '#164036',
            banner: '#ffd271',
            cloud: '#ffffff',
            cloudShadow: '#c8f1ff'
        },
        landmarks: ['cristo', 'palm']
    },
    {
        name: "Arizona Outriders",
        country: "USA",
        pipeSpeed: 2,
        pipeGap: 235,
        pipeSpawnInterval: 170,
        totalPipes: 7,
        totalPipesOverride: 15,
        pipeSpacingDistance: 380,
        description: "Far West desert run past mesas and saguaro silhouettes.",
        palette: {
            skyTop: '#3d4c73',
            skyMid: '#566d9a',
            skyBottom: '#9ab7e0',
            horizon: '#b7c9e5',
            ground: '#4f6280',
            detail: '#ffb347',
            obstacle: '#c9d9f7',
            outline: '#0c1026',
            banner: '#ffcf5c',
            cloud: '#f2f5ff',
            cloudShadow: '#b9c7e3'
        },
        landmarks: []
    },
    {
        name: "Sydney Drift",
        country: "Australia",
        pipeSpeed: 2.1,
        pipeGap: 230,
        pipeSpawnInterval: 165,
        totalPipes: 8,
        totalPipesOverride: 15,
        pipeSpacingDistance: 380,
        description: "Harbor winds by the Opera House.",
        palette: {
            skyTop: '#75c8ff',
            skyMid: '#9de1ff',
            skyBottom: '#d1f5ff',
            horizon: '#c8e7f2',
            ground: '#71a3c6',
            detail: '#ffbe6b',
            obstacle: '#d6f0ff',
            outline: '#14405b',
            banner: '#ffd271',
            cloud: '#ffffff',
            cloudShadow: '#c9e5ff'
        },
        landmarks: ['opera', 'sail']
    }
];

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver', 'levelComplete', 'countdown'
let score = 0;
let currentLevel = null;
let currentLevelIndex = 0;
let countdownInterval = null;
let isInvincible = false;
let invincibilityTimeout = null;
let invincibilityBlinkInterval = null;
let birdBlinkOn = true;
let pendingInvincibility = false;
let collidingPipe = null; // Store the pipe that caused the collision
let levelCoinsCollected = 0; // Track coins collected during the current level
let backgroundOffset = 0;

// Level settings (will be set based on selected level)
const BASE_PIPE_GAP = 240; // consistent vertical gap across levels
const FIXED_TOTAL_PIPES = 12; // consistent level length
const PIPE_SPACING_DISTANCE = 320; // consistent horizontal spacing
const SPEED_BASE_BOOST = 1.5; // global speed bump
const SPEED_LEVEL_STEP = 0.25; // extra speed increase per level

let pipeWidth = 60; // original width for custom painted pillars
let pipeGap = BASE_PIPE_GAP;
let pipeSpeed = 3;
let pipeSpawnInterval = Math.max(60, Math.round(PIPE_SPACING_DISTANCE / pipeSpeed));
let totalPipes = FIXED_TOTAL_PIPES;
let pipesSpawned = 0;
let finishLineX = null;

// Balloon properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 60,
    height: 84,
    velocity: 0,
    gravity: 0.15,
    jumpStrength: -5,
    color: '#ff9368'
};

// Pipes array
const pipes = [];
let pipeSpawnTimer = 0;

// Coins array
const coins = [];
let coinSpawnTimer = 0;
const coinSpawnInterval = 80; // Spawn coins more frequently than pipes
const MIN_COIN_SPACING = 120; // prevent overlapping coin spawns

// LocalStorage functions
function getUnlockedLevels() {
    return levels.map((_, i) => i);
}

function unlockLevel(levelIndex) {
    return true;
}

function isLevelUnlocked(levelIndex) {
    return true;
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
    if (!coins || coins === '0' || coins === '') {
        localStorage.setItem('totalCoins', '0');
        return 0;
    }
    return parseInt(coins);
}

function addCoin() {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + 1).toString());
    updateCoinDisplay();
}

function addCoins(amount) {
    const currentCoins = getCoins();
    localStorage.setItem('totalCoins', (currentCoins + amount).toString());
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
        coinsElement.textContent = `Coins: ${totalCoins}`;
    }
    if (gameOverCoinsCount) {
        gameOverCoinsCount.textContent = totalCoins;
    }
}

function getPalette() {
    return currentLevel?.palette || defaultPalette;
}

// Cheeky messages for deaths/completions
const gameOverTitles = [
    "Balloon Down!",
    "Oof, Gravity Wins!",
    "Pilot, We Talked About Pipes!",
    "Balloon Bloopers Live!"
];

const gameOverMessages = [
    "Want to try this skyline again?",
    "That's one way to test the ground crew.",
    "The pipes say hi. Maybe don't greet them.",
    "At this rate, the repair crew is getting overtime."
];

const levelCompleteTitles = [
    "Nice Flight!",
    "Sky Boss!",
    "Cloud Cruiser!",
    "Pipe Dodger Supreme!"
];

const levelCompleteMessages = [
    "Skyline cleared!",
    "You threaded those pipes like a pro.",
    "Did you just flex on gravity?",
    "You made that look easy. Pipes are offended."
];

function pickMessage(list, count) {
    if (!list || list.length === 0) return '';
    return list[count % list.length];
}

function clearMusicFade() {
    if (musicFadeInterval) {
        clearInterval(musicFadeInterval);
        musicFadeInterval = null;
    }
}

function fadeMusic(targetVolume, duration = 800, onComplete = null, musicRef = currentMusic) {
    if (!musicRef) {
        if (onComplete) onComplete();
        return;
    }
    clearMusicFade();
    const startVolume = musicRef.volume;
    const volumeDelta = targetVolume - startVolume;
    const steps = Math.max(1, Math.floor(duration / 40));
    let currentStep = 0;
    
    musicFadeInterval = setInterval(() => {
        currentStep++;
        const progress = Math.min(1, currentStep / steps);
        const newVolume = startVolume + volumeDelta * progress;
        musicRef.volume = Math.max(0, Math.min(1, newVolume));
        
        if (progress >= 1) {
            clearMusicFade();
            if (onComplete) {
                onComplete();
            }
        }
    }, duration / steps);
}

function playLevelMusic(country) {
    const src = soundtrackSources[country];
    if (!src) {
        stopLevelMusic(true);
        return;
    }
    
    if (currentMusic && currentMusicCountry === country) {
        fadeMusic(MUSIC_VOLUME);
        return;
    }
    
    if (currentMusic) {
        clearMusicFade();
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    
    const music = new Audio(src);
    music.loop = true;
    music.volume = 0;
    currentMusic = music;
    currentMusicCountry = country;
    
    const beginFade = () => fadeMusic(MUSIC_VOLUME, MUSIC_FADE_MS);
    const playPromise = music.play();
    if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(beginFade).catch(() => {});
    } else {
        beginFade();
    }
}

function stopLevelMusic(resetPosition = false) {
    const music = currentMusic;
    if (!music) return;
    
    fadeMusic(0, MUSIC_FADE_MS, () => {
        music.pause();
        if (resetPosition) {
            music.currentTime = 0;
        }
        if (music === currentMusic) {
            currentMusic = null;
            currentMusicCountry = null;
        }
    }, music);
}

function pauseLevelMusic() {
    if (!currentMusic) return;
    fadeMusic(0, MUSIC_FADE_MS, () => {
        currentMusic.pause();
    });
}

function resumeLevelMusic(country = currentLevel?.country) {
    if (currentMusic && currentMusicCountry === country) {
        const playPromise = currentMusic.play();
        const bringUp = () => fadeMusic(MUSIC_VOLUME, MUSIC_FADE_MS);
        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(bringUp).catch(() => {});
        } else {
            bringUp();
        }
        return;
    }
    playLevelMusic(country);
}

// Initialize level selection screen
function initLevelSelection() {
    levelButtonsElement.innerHTML = '';
    updateCoinDisplay(); // Update coin display when showing menu
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.title = `${level.name} - ${level.description}`;
        const preview = document.createElement('div');
        preview.className = 'level-preview';
        const bgSrc = backgroundSources[level.country];
        if (bgSrc) {
            preview.style.backgroundImage = `url(${bgSrc})`;
        }
        const label = document.createElement('div');
        label.className = 'level-label';
        label.textContent = `${index + 1}. ${level.country}`;
        
        if (isLevelCompleted(index)) {
            button.classList.add('completed');
        }
        
        const unlocked = isLevelUnlocked(index);
        if (!unlocked) {
            button.classList.add('locked');
            preview.classList.add('locked');
            button.disabled = true;
        }
        
        button.addEventListener('click', () => startLevel(index));
        button.appendChild(preview);
        button.appendChild(label);
        
        levelButtonsElement.appendChild(button);
    });
}

// Start a level
function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentLevel = levels[levelIndex];
    
    // Set level-specific settings
    pipeSpeed = currentLevel.pipeSpeed + SPEED_BASE_BOOST + (currentLevelIndex * SPEED_LEVEL_STEP);
    pipeGap = BASE_PIPE_GAP;
    const baseSpacing = currentLevel.pipeSpacingDistance || PIPE_SPACING_DISTANCE;
    const adjustedSpacing = baseSpacing + (pipeWidth - 60); // keep approximate edge-to-edge spacing after widening pipes
    pipeSpawnInterval = Math.max(60, Math.round(adjustedSpacing / pipeSpeed));
    totalPipes = currentLevel.totalPipesOverride || FIXED_TOTAL_PIPES;
    
    // Reset game state
    gameState = 'playing';
    score = 0;
    pipesSpawned = 0;
    finishLineX = null;
    stopInvincibility();
    pendingInvincibility = false;
    collidingPipe = null; // Reset colliding pipe
    backgroundOffset = 0;
    scoreElement.textContent = `Score: ${score}`;
    levelInfoElement.textContent = `${currentLevel.country} - ${currentLevel.name}`;
    progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
    gameOverPopup.classList.add('hidden');
    levelCompleteElement.classList.add('hidden');
    levelCompletePopup.classList.add('hidden');
    levelCompletePopup.style.display = 'none';
    
    // Reset balloon
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
    levelCoinsCollected = 0;
    
    // Update coin display
    updateCoinDisplay();
    
    // Handle soundtrack
    playLevelMusic(currentLevel.country);
    
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
    const coinSize = 60; // height (larger coins)
    const coinWidth = coinSize * coinSpriteRatio;
    const coinHeight = coinSize;
    // Aim coins near the center of the gap the player will fly through and keep them inside the opening
    let margin = Math.max(30, coinHeight * 0.55);
    // Pick the rightmost (newest) pipe so the coin aligns with the upcoming gap
    let targetPipe = null;
    pipes.forEach(pipe => {
        if (!targetPipe || pipe.x > targetPipe.x) {
            targetPipe = pipe;
        }
    });
    
    // Adjust margin if the gap gets tight relative to coin size
    const usableGap = pipeGap - coinHeight - margin * 2;
    if (usableGap < 0) {
        margin = Math.max(6, (pipeGap - coinHeight) / 2);
    }
    
    const gapTop = targetPipe ? targetPipe.topHeight + margin : margin;
    const gapBottom = targetPipe ? targetPipe.bottomY - coinHeight - margin : canvas.height - coinHeight - margin;
    const centerY = targetPipe ? (targetPipe.topHeight + pipeGap / 2) - coinHeight / 2 : (canvas.height / 2) - coinHeight / 2;
    const sway = targetPipe ? Math.max(10, pipeGap * 0.12) : 50;
    
    let coinY = centerY + (Math.random() * sway * 2 - sway);
    coinY = Math.max(gapTop, Math.min(gapBottom, coinY));
    
    let spawnX = targetPipe ? targetPipe.x + pipeWidth + 18 : canvas.width;
    if (coins.length > 0) {
        const last = coins[coins.length - 1];
        const lastWidth = last.width || last.size || coinWidth;
        if (!last.collected && spawnX - (last.x + lastWidth) < MIN_COIN_SPACING) {
            spawnX = last.x + lastWidth + MIN_COIN_SPACING;
        }
    }
    
    coins.push({
        x: spawnX,
        y: coinY,
        size: coinSize,
        width: coinWidth,
        height: coinHeight,
        hitRadius: Math.min(coinWidth, coinHeight) / 2,
        collected: false,
        rotation: 0
    });
}

// Draw background and parallax skyline with a softer painted look
function drawBackground() {
    if (currentLevel) {
        const bgImg = backgroundImages[currentLevel.country];
        if (bgImg && backgroundReady[currentLevel.country]) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            return;
        }
    }
    const palette = getPalette();
    const horizonY = canvas.height * 0.7;
    
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, palette.skyTop);
    skyGradient.addColorStop(0.45, palette.skyMid);
    skyGradient.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const mist = ctx.createLinearGradient(0, horizonY - 90, 0, horizonY + 120);
    mist.addColorStop(0, 'rgba(255,255,255,0.2)');
    mist.addColorStop(0.5, 'rgba(255,255,255,0.07)');
    mist.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, horizonY - 90, canvas.width, 210);
    
    drawCloudLayer(palette, horizonY);
    drawLandmarks(palette, horizonY);
    drawGround(palette, horizonY);
}

function drawCloudLayer(palette, horizonY) {
    const spacing = 140;
    const offset = (backgroundOffset * 0.35) % (spacing * 4);
    for (let i = -2; i < 6; i++) {
        const x = i * spacing - offset;
        const y = 70 + Math.sin((backgroundOffset + i * 12) * 0.01) * 10;
        drawSoftCloud(x, y, 1.1, palette);
    }
    
    // Lower, slower clouds
    const lowSpacing = 210;
    const lowOffset = (backgroundOffset * 0.18) % (lowSpacing * 3);
    for (let i = -2; i < 5; i++) {
        const x = i * lowSpacing - lowOffset + 30;
        const y = horizonY - 200 + Math.cos((backgroundOffset + i * 22) * 0.008) * 8;
        drawSoftCloud(x, y, 0.9, palette);
    }
}

function drawSoftCloud(x, y, scale, palette) {
    const width = 160 * scale;
    const height = 68 * scale;
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, palette.cloud);
    gradient.addColorStop(1, palette.cloudShadow);
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.quadraticCurveTo(x + width * 0.08, y + height * 0.25, x + width * 0.3, y + height * 0.35);
    ctx.quadraticCurveTo(x + width * 0.38, y, x + width * 0.55, y + height * 0.32);
    ctx.quadraticCurveTo(x + width * 0.72, y - height * 0.15, x + width * 0.88, y + height * 0.35);
    ctx.quadraticCurveTo(x + width, y + height * 0.55, x + width * 0.94, y + height);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + width * 0.4, y + height * 0.45, width * 0.22, height * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Paris-specific skyline for the France level
function drawParisSet(palette, horizonY) {
    const parallax = (backgroundOffset * 0.2) % 600;
    const base = horizonY - 4;
    
    // Far skyline silhouettes
    const distantColor = 'rgba(47, 33, 64, 0.65)';
    ctx.fillStyle = distantColor;
    const distantBuildings = [
        { x: -80, w: 90, h: 90 },
        { x: 10, w: 110, h: 120 },
        { x: 150, w: 80, h: 100 },
        { x: 230, w: 140, h: 140 },
        { x: 400, w: 110, h: 110 }
    ];
    distantBuildings.forEach(b => {
        const x = (b.x - parallax) % 620 - 120;
        ctx.fillRect(x, base - b.h, b.w, b.h);
    });
    
    // Louvre glass pyramid
    ctx.save();
    const louvreX = ((-120 - parallax) % 620) + 160;
    const pyramidW = 120;
    const pyramidH = 80;
    const pyramidGrad = ctx.createLinearGradient(0, base - pyramidH, 0, base);
    pyramidGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
    pyramidGrad.addColorStop(1, 'rgba(240,184,116,0.4)');
    ctx.fillStyle = pyramidGrad;
    ctx.beginPath();
    ctx.moveTo(louvreX, base);
    ctx.lineTo(louvreX + pyramidW / 2, base - pyramidH);
    ctx.lineTo(louvreX + pyramidW, base);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(47, 33, 64, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(louvreX, base);
    ctx.lineTo(louvreX + pyramidW / 2, base - pyramidH);
    ctx.lineTo(louvreX + pyramidW, base);
    ctx.moveTo(louvreX + pyramidW / 2, base - pyramidH);
    ctx.lineTo(louvreX + pyramidW / 2, base);
    ctx.moveTo(louvreX + pyramidW * 0.25, base - pyramidH * 0.5);
    ctx.lineTo(louvreX + pyramidW * 0.75, base - pyramidH * 0.5);
    ctx.stroke();
    ctx.restore();
    
    // Eiffel Tower centerpiece
    ctx.save();
    const eiffelX = canvas.width / 2 - 12 - (backgroundOffset * 0.12 % 40);
    const eiffelY = base;
    ctx.translate(eiffelX, eiffelY);
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(-10, -160);
    ctx.quadraticCurveTo(0, -178, 10, -160);
    ctx.lineTo(28, 0);
    ctx.quadraticCurveTo(0, -20, -28, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = palette.detail;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, -30);
    ctx.lineTo(22, -30);
    ctx.moveTo(-18, -62);
    ctx.lineTo(18, -62);
    ctx.moveTo(-12, -96);
    ctx.lineTo(12, -96);
    ctx.moveTo(-6, -132);
    ctx.lineTo(6, -132);
    ctx.stroke();
    
    ctx.fillStyle = palette.detail;
    ctx.fillRect(-18, -44, 36, 10);
    ctx.fillRect(-14, -78, 28, 8);
    ctx.restore();
    
    // Sacré-Cœur inspired dome
    ctx.save();
    const sacreX = ((220 - parallax) % 620) - 80;
    ctx.translate(sacreX, base - 26);
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.ellipse(0, -28, 34, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-38, -28, 76, 54);
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(0, -66);
    ctx.quadraticCurveTo(8, -74, 0, -82);
    ctx.quadraticCurveTo(-8, -74, 0, -66);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Croissant sign (whimsical)
    ctx.save();
    const croissantX = ((-40 - parallax * 1.2) % 620) + 40;
    const croissantY = base - 34;
    ctx.translate(croissantX, croissantY);
    ctx.fillStyle = palette.banner;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Foreground rooftop band
    const roofColor = palette.outline;
    const roofHighlight = 'rgba(247, 217, 161, 0.5)';
    const roofs = [
        { x: -140, w: 160, h: 60 },
        { x: 40, w: 140, h: 52 },
        { x: 210, w: 150, h: 58 },
        { x: 380, w: 160, h: 66 }
    ];
    roofs.forEach(r => {
        const x = (r.x - parallax * 1.1) % 640 - 120;
        const top = base - r.h;
        ctx.fillStyle = roofColor;
        ctx.fillRect(x, top, r.w, r.h);
        ctx.fillStyle = roofHighlight;
        ctx.fillRect(x + 8, top + r.h * 0.55, r.w - 16, 8);
    });
}

function drawLandmarks(palette, horizonY) {
    if (!currentLevel) return;
    if (currentLevel.country === 'France') {
        drawParisSet(palette, horizonY);
        return;
    }
    const spacing = 210;
    const types = currentLevel.landmarks || [];
    const offset = (backgroundOffset * 0.3) % (spacing * (types.length || 1));
    
    for (let i = -1; i < 4; i++) {
        const type = types.length ? types[i % types.length] : 'palm';
        const x = i * spacing - offset + spacing * 0.4;
        drawLandmark(type, x, horizonY, palette);
    }
}

function drawGround(palette, horizonY) {
    const groundGradient = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
    groundGradient.addColorStop(0, palette.ground);
    groundGradient.addColorStop(1, palette.outline);
    ctx.fillStyle = groundGradient;
    
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.bezierCurveTo(canvas.width * 0.2, horizonY - 18, canvas.width * 0.4, horizonY + 24, canvas.width * 0.6, horizonY + 6);
    ctx.bezierCurveTo(canvas.width * 0.8, horizonY - 8, canvas.width, horizonY + 18, canvas.width, horizonY + 12);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.horizon;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(0, horizonY - 6);
    ctx.bezierCurveTo(canvas.width * 0.25, horizonY - 28, canvas.width * 0.55, horizonY - 8, canvas.width, horizonY - 18);
    ctx.lineTo(canvas.width, horizonY);
    ctx.lineTo(0, horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
}

// Landmark silhouettes per country
function drawLandmark(type, baseX, horizonY, palette) {
    ctx.save();
    ctx.translate(baseX, horizonY);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = palette.outline;
    
    switch (type) {
        case 'pagoda':
            drawPagoda(palette);
            break;
        case 'torii':
            drawTorii(palette);
            break;
        case 'eiffel':
            drawEiffel(palette);
            break;
        case 'arc':
            drawArc(palette);
            break;
        case 'pyramids':
            drawPyramids(palette);
            break;
        case 'palm':
            drawPalm(palette);
            break;
        case 'cristo':
            drawCristo(palette);
            break;
        case 'skyscraper':
            drawSkyscraper(palette);
            break;
        case 'bridge':
            drawBridge(palette);
            break;
        case 'opera':
            drawOperaHouse(palette);
            break;
        case 'sail':
        default:
            drawSail(palette);
            break;
    }
    
    ctx.restore();
}

function drawPagoda(palette) {
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(-48, -14);
    ctx.quadraticCurveTo(0, -36, 48, -14);
    ctx.quadraticCurveTo(18, -8, -18, -8);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-38, -34);
    ctx.quadraticCurveTo(0, -58, 38, -34);
    ctx.quadraticCurveTo(12, -28, -12, -26);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-28, -54);
    ctx.quadraticCurveTo(0, -78, 28, -54);
    ctx.quadraticCurveTo(10, -48, -10, -46);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(-8, -88);
    ctx.lineTo(8, -88);
    ctx.lineTo(12, -18);
    ctx.lineTo(-12, -18);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.detail;
    ctx.fillRect(-6, -70, 12, 18);
}

function drawTorii(palette) {
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(-64, -28);
    ctx.quadraticCurveTo(0, -40, 64, -28);
    ctx.lineTo(60, -18);
    ctx.quadraticCurveTo(0, -30, -60, -18);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.outline;
    ctx.fillRect(-36, -26, 12, 52);
    ctx.fillRect(24, -26, 12, 52);
    
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(-48, -10);
    ctx.lineTo(48, -10);
    ctx.lineTo(46, -4);
    ctx.quadraticCurveTo(0, -2, -46, -4);
    ctx.closePath();
    ctx.fill();
}

function drawEiffel(palette) {
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(-38, 0);
    ctx.lineTo(0, -104);
    ctx.lineTo(38, 0);
    ctx.quadraticCurveTo(0, -12, -38, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = palette.detail;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-28, -18);
    ctx.lineTo(28, -18);
    ctx.moveTo(-20, -42);
    ctx.lineTo(20, -42);
    ctx.moveTo(-12, -66);
    ctx.lineTo(12, -66);
    ctx.moveTo(0, -104);
    ctx.lineTo(0, -12);
    ctx.stroke();
}

function drawArc(palette) {
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(-44, 0);
    ctx.quadraticCurveTo(0, -46, 44, 0);
    ctx.lineTo(32, 0);
    ctx.quadraticCurveTo(0, -30, -32, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.quadraticCurveTo(0, -18, 14, 0);
    ctx.closePath();
    ctx.fill();
}

function drawPyramids(palette) {
    const pyramidGradient = ctx.createLinearGradient(-60, -60, 40, 20);
    pyramidGradient.addColorStop(0, palette.detail);
    pyramidGradient.addColorStop(1, palette.ground);
    ctx.fillStyle = pyramidGradient;
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(-10, -64);
    ctx.lineTo(40, 0);
    ctx.closePath();
    ctx.fill();
    
    const pyramidGradient2 = ctx.createLinearGradient(0, -54, 110, 12);
    pyramidGradient2.addColorStop(0, palette.detail);
    pyramidGradient2.addColorStop(1, palette.outline);
    ctx.fillStyle = pyramidGradient2;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(60, -52);
    ctx.lineTo(110, 0);
    ctx.closePath();
    ctx.fill();
}

function drawPalm(palette) {
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, -28, 0, -58);
    ctx.stroke();
    
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(0, -58);
    ctx.quadraticCurveTo(-26, -70, -6, -82);
    ctx.quadraticCurveTo(6, -70, 26, -72);
    ctx.quadraticCurveTo(4, -60, 0, -58);
    ctx.closePath();
    ctx.fill();
}

function drawCristo(palette) {
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-12, -48);
    ctx.quadraticCurveTo(-32, -48, -32, -56);
    ctx.lineTo(-32, -64);
    ctx.lineTo(-12, -64);
    ctx.lineTo(-12, -88);
    ctx.lineTo(12, -88);
    ctx.lineTo(12, -64);
    ctx.lineTo(32, -64);
    ctx.lineTo(32, -56);
    ctx.quadraticCurveTo(32, -48, 12, -48);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.detail;
    ctx.fillRect(-8, -46, 16, 24);
}

function drawSkyscraper(palette) {
    const towerGradient = ctx.createLinearGradient(-22, -110, 22, 10);
    towerGradient.addColorStop(0, palette.outline);
    towerGradient.addColorStop(1, palette.detail);
    ctx.fillStyle = towerGradient;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-12, -110);
    ctx.lineTo(12, -110);
    ctx.lineTo(22, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let y = -90; y < -8; y += 18) {
        ctx.fillRect(-10, y, 8, 10);
        ctx.fillRect(4, y + 6, 8, 10);
    }
    
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(34, -72);
    ctx.lineTo(52, -72);
    ctx.lineTo(46, 0);
    ctx.closePath();
    ctx.fill();
}

function drawBridge(palette) {
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(-70, -6);
    ctx.quadraticCurveTo(-20, -34, 30, -6);
    ctx.quadraticCurveTo(60, 10, 80, -2);
    ctx.lineTo(80, 6);
    ctx.quadraticCurveTo(58, 20, 24, 6);
    ctx.quadraticCurveTo(-22, -16, -70, 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.detail;
    ctx.fillRect(-60, -8, 120, 6);
}

function drawOperaHouse(palette) {
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(-44, 0);
    ctx.quadraticCurveTo(-10, -32, 18, 0);
    ctx.quadraticCurveTo(-6, -10, -44, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(30, -40, 62, 0);
    ctx.quadraticCurveTo(30, -12, -8, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.outline;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.quadraticCurveTo(42, -28, 70, 0);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
}

function drawSail(palette) {
    ctx.fillStyle = palette.detail;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(-4, -30, 34, -12);
    ctx.quadraticCurveTo(10, -2, -8, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.outline;
    ctx.fillRect(-10, -32, 4, 32);
}

// Finish line
function drawFinishLine() {
    if (finishLineX === null) return;
    const palette = getPalette();
    
    const poleGradient = ctx.createLinearGradient(finishLineX, 0, finishLineX, canvas.height);
    poleGradient.addColorStop(0, palette.banner);
    poleGradient.addColorStop(1, palette.outline);
    ctx.fillStyle = poleGradient;
    ctx.fillRect(finishLineX - 4, 0, 8, canvas.height);
    
    const flagGradient = ctx.createLinearGradient(finishLineX - 22, canvas.height / 2 - 28, finishLineX + 22, canvas.height / 2 + 28);
    flagGradient.addColorStop(0, 'rgba(255,255,255,0.9)');
    flagGradient.addColorStop(1, palette.banner);
    ctx.fillStyle = flagGradient;
    ctx.beginPath();
    ctx.moveTo(finishLineX - 2, canvas.height / 2 - 34);
    ctx.quadraticCurveTo(finishLineX + 28, canvas.height / 2 - 20, finishLineX - 2, canvas.height / 2 - 6);
    ctx.quadraticCurveTo(finishLineX + 26, canvas.height / 2 + 8, finishLineX - 2, canvas.height / 2 + 22);
    ctx.quadraticCurveTo(finishLineX + 22, canvas.height / 2 + 36, finishLineX - 2, canvas.height / 2 + 34);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.outline;
    ctx.font = 'bold 16px "Segoe UI", "Manrope", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLineX + 12, canvas.height / 2 + 6);
    ctx.textAlign = 'left';
}

// Draw balloon (bird)
function drawBird() {
    const needsAlpha = isInvincible;
    const palette = getPalette();
    ctx.save();
    if (needsAlpha) {
        ctx.globalAlpha = birdBlinkOn ? 0.35 : 1;
    }

    // Use shared balloon image when ready
    if (balloonReady) {
        const imgWidth = bird.width + 18;
        const imgHeight = bird.height + 22;
        const drawX = bird.x - 9;
        const drawY = bird.y - 10;
        ctx.drawImage(balloonImage, drawX, drawY, imgWidth, imgHeight);
        ctx.restore();
        return;
    }

    const envelopeWidth = bird.width + 14;
    const envelopeHeight = bird.height * 0.7;
    const centerX = bird.x + envelopeWidth / 2 - 7;
    const centerY = bird.y + envelopeHeight / 2;
    
    const envelopeGradient = ctx.createLinearGradient(centerX, bird.y, centerX, bird.y + envelopeHeight);
    envelopeGradient.addColorStop(0, bird.color);
    envelopeGradient.addColorStop(1, palette.detail);
    ctx.fillStyle = envelopeGradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, envelopeWidth / 2, envelopeHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(centerX - envelopeWidth * 0.15, centerY - envelopeHeight * 0.1, envelopeWidth * 0.18, envelopeHeight * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const basketWidth = 24;
    const basketHeight = 12;
    const basketX = centerX - basketWidth / 2;
    const basketY = bird.y + envelopeHeight + 10;
    
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 12, bird.y + envelopeHeight * 0.85);
    ctx.lineTo(centerX - 8, basketY);
    ctx.moveTo(centerX + 12, bird.y + envelopeHeight * 0.85);
    ctx.lineTo(centerX + 8, basketY);
    ctx.stroke();
    
    const basketGradient = ctx.createLinearGradient(0, basketY, 0, basketY + basketHeight);
    basketGradient.addColorStop(0, '#c3834c');
    basketGradient.addColorStop(1, '#8b5a2b');
    ctx.fillStyle = basketGradient;
    ctx.beginPath();
    ctx.moveTo(basketX + 4, basketY);
    ctx.lineTo(basketX + basketWidth - 4, basketY);
    ctx.quadraticCurveTo(basketX + basketWidth, basketY, basketX + basketWidth, basketY + 4);
    ctx.lineTo(basketX + basketWidth, basketY + basketHeight - 4);
    ctx.quadraticCurveTo(basketX + basketWidth, basketY + basketHeight, basketX + basketWidth - 4, basketY + basketHeight);
    ctx.lineTo(basketX + 4, basketY + basketHeight);
    ctx.quadraticCurveTo(basketX, basketY + basketHeight, basketX, basketY + basketHeight - 4);
    ctx.lineTo(basketX, basketY + 4);
    ctx.quadraticCurveTo(basketX, basketY, basketX + 4, basketY);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = palette.banner;
    ctx.beginPath();
    ctx.arc(centerX, basketY - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Draw pipes with a shared painted pillar style
function drawPipes() {
    const palette = getPalette();
    pipes.forEach(pipe => {
        drawThemedPillarSegment(pipe.x, 0, pipe.topHeight, palette);
        drawThemedPillarSegment(pipe.x, pipe.bottomY, canvas.height - pipe.bottomY, palette);
    });
}

function drawThemedPillarSegment(x, y, height, palette) {
    if (height <= 0) return;
    const theme = pillarTheme;
    const width = pipeWidth;
    const radius = Math.min(width * 0.18, 18);
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, theme.base);
    gradient.addColorStop(1, theme.shade);
    
    ctx.save();
    drawRoundedColumnPath(x, y, width, height, radius);
    ctx.clip();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(x + width * 0.08, y + radius, width * 0.16, Math.max(0, height - radius * 2));
    
    // Simple vertical accent band
    // No additional accents; solid color pillar
    
    // Outline
    ctx.restore();
    ctx.save();
    drawRoundedColumnPath(x, y, width, height, radius);
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawRoundedColumnPath(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.closePath();
}


// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            const palette = getPalette();
            const width = coin.width || coin.size;
            const height = coin.height || coin.size;
            const radius = Math.min(width, height) / 2;
            const centerX = coin.x + width / 2;
            const centerY = coin.y + height / 2;

            if (coinReady) {
                ctx.drawImage(coinImage, coin.x, coin.y, width, height);
            } else {
                // Fallback: painted coin
                const shine = ctx.createRadialGradient(
                    centerX - radius * 0.4,
                    centerY - radius * 0.4,
                    radius * 0.2,
                    centerX,
                    centerY,
                    radius
                );
                shine.addColorStop(0, '#ffe9a9');
                shine.addColorStop(0.5, '#f6d860');
                shine.addColorStop(1, '#e2a72a');
                
                ctx.fillStyle = shine;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = palette.outline;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

// Update balloon
function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
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
        if (pipesSpawned < totalPipes) {
            pipeSpawnTimer++;
            if (pipeSpawnTimer >= pipeSpawnInterval) {
                createPipe();
                pipesSpawned++;
                pipeSpawnTimer = 0;
            }
        }
        
        if (score >= totalPipes && finishLineX === null) {
            let rightmostX = bird.x + 200;
            if (pipes.length > 0) {
        pipes.forEach(pipe => {
            if (pipe.x + pipeWidth > rightmostX) {
                rightmostX = pipe.x + pipeWidth;
            }
        });
                finishLineX = rightmostX + 150;
            } else {
                finishLineX = bird.x + 200;
            }
        }
        
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
                progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
            }
        });
        
        if (finishLineX !== null) {
            finishLineX -= pipeSpeed;
        }
        
        while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }
}

// Update background scroll
function updateBackgroundScroll() {
    if (gameState === 'playing') {
        backgroundOffset += pipeSpeed * 0.6;
    }
}

// Update coins
function updateCoins() {
    if (gameState === 'playing') {
        coinSpawnTimer++;
        if (coinSpawnTimer >= coinSpawnInterval) {
            if (pipesSpawned < totalPipes || pipes.length > 0) {
                createCoin();
            }
            coinSpawnTimer = 0;
        }
        
        coins.forEach(coin => {
            if (!coin.collected) {
                coin.x -= pipeSpeed;
            }
        });
        
        for (let i = coins.length - 1; i >= 0; i--) {
            const coinWidth = coins[i].width || coins[i].size;
            if (coins[i].collected || coins[i].x + coinWidth < 0) {
                coins.splice(i, 1);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    if (gameState !== 'playing') return;
    
    if (finishLineX !== null && bird.x > finishLineX && score >= totalPipes) {
        completeLevel();
        return;
    }
    
    if (!isInvincible) {
        const hitboxPadding = Math.max(0, pipeWidth * 0.4); // much slimmer hitbox; match only the visible core width
        pipes.forEach(pipe => {
            const leftX = pipe.x + hitboxPadding;
            const rightX = pipe.x + pipeWidth - hitboxPadding;
            const overlapX = bird.x < rightX && bird.x + bird.width > leftX;
            
            if (overlapX && bird.y < pipe.topHeight) {
                collidingPipe = pipe;
                gameOver();
            }
            
            if (overlapX && bird.y + bird.height > pipe.bottomY) {
                collidingPipe = pipe;
                gameOver();
            }
        });
    }
    
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinWidth = coin.width || coin.size;
            const coinHeight = coin.height || coin.size;
            const coinRadius = coin.hitRadius || Math.min(coinWidth, coinHeight) / 2;
            const coinCenterX = coin.x + coinWidth / 2;
            const coinCenterY = coin.y + coinHeight / 2;
            const birdCenterX = bird.x + bird.width / 2;
            const birdCenterY = bird.y + bird.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(coinCenterX - birdCenterX, 2) + 
                Math.pow(coinCenterY - birdCenterY, 2)
            );
            
            if (distance < (coinRadius + bird.width / 2)) {
                coin.collected = true;
                levelCoinsCollected++;
                addCoin();
            }
        }
    });
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameOver';
        pauseLevelMusic();
        deathCount++;
        if (gameOverTitle) {
            gameOverTitle.textContent = pickMessage(gameOverTitles, deathCount);
        }
        if (gameOverMessage) {
            gameOverMessage.textContent = pickMessage(gameOverMessages, deathCount);
        }
        gameOverPopup.classList.remove('hidden');
        gameOverPopup.style.display = 'flex';
        notEnoughCoinsElement.classList.add('hidden');
        
        updateCoinDisplay();
        
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
        stopInvincibility();
        pendingInvincibility = false;
        stopLevelMusic();
        clearCount++;
        if (levelCompleteTitle) {
            levelCompleteTitle.textContent = pickMessage(levelCompleteTitles, clearCount);
        }
        if (levelCompleteMessage) {
            levelCompleteMessage.textContent = pickMessage(levelCompleteMessages, clearCount);
        }
        
        levelCompleteElement.classList.add('hidden');
        gameOverPopup.classList.add('hidden');
        
        const levelNumber = currentLevelIndex + 1;
        const coinsEarned = Math.ceil(levelNumber * 1.5);
        const totalCoinsEarned = coinsEarned + levelCoinsCollected;
        
        addCoins(coinsEarned);
        
        levelCompletePopup.classList.remove('hidden');
        levelCompletePopup.style.display = 'flex';
        
        if (levelCompleteCoinsCount) {
            levelCompleteCoinsCount.textContent = totalCoinsEarned;
        }
        
        markLevelCompleted(currentLevelIndex);
        
        if (currentLevelIndex + 1 < levels.length) {
            unlockLevel(currentLevelIndex + 1);
            if (nextLevelBtn) {
                nextLevelBtn.style.display = 'block';
            }
        } else {
            if (nextLevelBtn) {
                nextLevelBtn.style.display = 'none';
            }
        }
    }
}

// Continue game (revive)
function continueGame() {
    if (gameState === 'gameOver') {
        if (!spendCoins(10)) {
            notEnoughCoinsElement.classList.remove('hidden');
            return;
        }
        
        collidingPipe = null;
        pendingInvincibility = true;
        stopInvincibility();
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        coins.forEach(coin => {
            if (coin.x < bird.x - 100) {
                coin.collected = true;
            }
        });
        
        gameOverPopup.classList.add('hidden');
        notEnoughCoinsElement.classList.add('hidden');
        
        if (gameOverPopup) {
            gameOverPopup.style.display = 'none';
        }
        
        if (gameScreenElement) {
            gameScreenElement.classList.remove('hidden');
        }
        
        startCountdown();
    }
}

function pauseGame() {
    if (gameState !== 'playing') return;
    gameState = 'paused';
    pauseLevelMusic();
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    countdownText.textContent = 'PAUSED';
    countdownText.style.animation = 'none';
    if (countdownMessage) {
        countdownMessage.textContent = 'Press ESC to resume';
    }
    countdownOverlay.classList.remove('hidden');
}

function resumeFromPause() {
    if (gameState !== 'paused') return;
    startCountdown('Resuming...');
}

function togglePause() {
    if (gameState === 'playing') {
        pauseGame();
    } else if (gameState === 'paused') {
        resumeFromPause();
    }
}

// Start countdown before resuming game
function startCountdown(message = 'Get ready!') {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    gameState = 'countdown';
    countdownOverlay.classList.remove('hidden');
    if (countdownMessage) {
        countdownMessage.textContent = message;
    }
    
    let countdown = 3;
    countdownText.textContent = countdown;
    countdownText.style.animation = 'pulse 1s ease-in-out';
    
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.textContent = countdown;
            countdownText.style.animation = 'none';
            setTimeout(() => {
                countdownText.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownText.textContent = 'GO!';
            
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                gameState = 'playing';
                resumeLevelMusic(currentLevel?.country);
                
                if (pendingInvincibility) {
                    startInvincibility();
                    pendingInvincibility = false;
                }
            }, 500);
        }
    }, 1000);
}

function startInvincibility(duration = 3000) {
    stopInvincibility();
    isInvincible = true;
    birdBlinkOn = false;
    
    invincibilityBlinkInterval = setInterval(() => {
        birdBlinkOn = !birdBlinkOn;
    }, 200);
    
    invincibilityTimeout = setTimeout(() => {
        stopInvincibility();
    }, duration);
}

function stopInvincibility() {
    if (invincibilityTimeout) {
        clearTimeout(invincibilityTimeout);
        invincibilityTimeout = null;
    }
    
    if (invincibilityBlinkInterval) {
        clearInterval(invincibilityBlinkInterval);
        invincibilityBlinkInterval = null;
    }
    
    isInvincible = false;
    birdBlinkOn = true;
}

// Reset game (play again)
function resetGame() {
    if (gameState === 'gameOver' || gameState === 'levelComplete') {
        gameState = 'playing';
        score = 0;
        pipesSpawned = 0;
        finishLineX = null;
        collidingPipe = null;
        scoreElement.textContent = `Score: ${score}`;
        progressElement.textContent = `Progress: ${score} / ${totalPipes}`;
        gameOverPopup.classList.add('hidden');
        levelCompleteElement.classList.add('hidden');
        levelCompletePopup.classList.add('hidden');
        levelCompletePopup.style.display = 'none';
        stopInvincibility();
        pendingInvincibility = false;
        backgroundOffset = 0;
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.length = 0;
        pipeSpawnTimer = 0;
        createPipe();
        pipesSpawned = 1;
        
        coins.length = 0;
        coinSpawnTimer = 0;
        levelCoinsCollected = 0;
        
        resumeLevelMusic(currentLevel?.country);
    }
}

// Go to next level
function goToNextLevel() {
    if (currentLevelIndex + 1 < levels.length) {
        levelCompletePopup.classList.add('hidden');
        levelCompletePopup.style.display = 'none';
        startLevel(currentLevelIndex + 1);
    } else {
        returnToMenu();
    }
}

// Return to menu
function returnToMenu() {
    gameState = 'menu';
    stopInvincibility();
    pendingInvincibility = false;
    stopLevelMusic(true);
    
    levelSelectionElement.classList.remove('hidden');
    gameScreenElement.classList.add('hidden');
    
    gameOverPopup.classList.add('hidden');
    gameOverPopup.style.display = 'none';
    
    levelCompletePopup.classList.add('hidden');
    levelCompletePopup.style.display = 'none';
    
    notEnoughCoinsElement.classList.add('hidden');
    
    countdownOverlay.classList.add('hidden');
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    initLevelSelection();
}

// Jump function
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jumpStrength;
    } else if (gameState === 'levelComplete') {
        returnToMenu();
    }
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' || e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        togglePause();
        return;
    }
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

// Level complete popup buttons
nextLevelBtn.addEventListener('click', goToNextLevel);
returnToMenuFromCompleteBtn.addEventListener('click', returnToMenu);

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateBackgroundScroll();
        drawBackground();
        
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
const currentCoins = localStorage.getItem('totalCoins');
if (!currentCoins || currentCoins === '0' || currentCoins === '') {
    localStorage.setItem('totalCoins', '0');
}
updateCoinDisplay();
gameOverPopup.classList.add('hidden');
levelCompletePopup.classList.add('hidden');
levelCompletePopup.style.display = 'none';
notEnoughCoinsElement.classList.add('hidden');
countdownOverlay.classList.add('hidden');
initLevelSelection();
gameLoop();
