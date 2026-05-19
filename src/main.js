// ==========================================
// 1. SYSTEM SETUP & STATE
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

let tiles = []; let particlesArray = []; let isLevelCleared = false; 
let currentLevelIndex = parseInt(localStorage.getItem('tileGame_currentLevel')) || 0; 
const levelManager = new LevelManager(); const queueManager = new QueueManager(); const shop = new ShopManager(); 
const loadedImages = {}; let baseImage = new Image(); let imagesLoaded = 0; let currentIconsToLoad = []; let totalImagesToLoad = 0;

// ==========================================
// 2. AUDIO & SETTINGS MANAGER
// ==========================================
const audio = {
    bgm: new Audio('assets/sounds/bgm-loop.mp3'), tap: new Audio('assets/sounds/tap.mp3'),
    match: new Audio('assets/sounds/match.mp3'), win: new Audio('assets/sounds/win.mp3'), error: new Audio('assets/sounds/error.mp3')
};
audio.bgm.loop = true; audio.bgm.volume = 0.4;

const gameSettings = {
    music: localStorage.getItem('tileGame_music') !== 'false', sfx: localStorage.getItem('tileGame_sfx') !== 'false', vibration: localStorage.getItem('tileGame_vibration') !== 'false'
};
document.getElementById('toggle-music').checked = gameSettings.music;
document.getElementById('toggle-sfx').checked = gameSettings.sfx;
document.getElementById('toggle-vibration').checked = gameSettings.vibration;

document.getElementById('toggle-music').addEventListener('change', (e) => {
    gameSettings.music = e.target.checked; localStorage.setItem('tileGame_music', gameSettings.music);
    if (gameSettings.music) audio.bgm.play().catch(() => {}); else audio.bgm.pause();
});
document.getElementById('toggle-sfx').addEventListener('change', (e) => { gameSettings.sfx = e.target.checked; localStorage.setItem('tileGame_sfx', gameSettings.sfx); });
document.getElementById('toggle-vibration').addEventListener('change', (e) => { gameSettings.vibration = e.target.checked; localStorage.setItem('tileGame_vibration', gameSettings.vibration); });
document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('settings-screen').classList.remove('hidden'));
document.getElementById('btn-close-settings').addEventListener('click', () => document.getElementById('settings-screen').classList.add('hidden'));

function playSound(soundName) {
    if (!gameSettings.sfx) return;
    const soundClone = audio[soundName].cloneNode(); soundClone.volume = soundName === 'match' ? 0.8 : 0.6; soundClone.play().catch(e => {});
}
function triggerVibration(pattern) { if (gameSettings.vibration && navigator.vibrate) navigator.vibrate(pattern); }

// ==========================================
// 3. ASSET LOADING & GAME INIT
// ==========================================
function loadAssets() {
    if (gameSettings.music) audio.bgm.play().catch(() => {});
    document.getElementById('btn-play').innerText = "Loading..."; imagesLoaded = 0; 
    currentIconsToLoad = shop.getActiveIcons(); totalImagesToLoad = currentIconsToLoad.length + 1; 
    baseImage.src = 'assets/ui/blank-tile.png'; baseImage.onload = checkLoad;
    currentIconsToLoad.forEach(name => {
        let img = new Image(); img.src = `assets/tilesets/${shop.activeTheme}/${name}.png`;
        img.onload = () => { loadedImages[name] = img; checkLoad(); }; img.onerror = () => console.error(`Missing image: ${img.src}`);
    });
}
function checkLoad() {
    imagesLoaded++; if (imagesLoaded === totalImagesToLoad && document.getElementById('splash-screen').classList.contains('hidden')) startGame();
}
function startGame() {
    document.getElementById('main-menu').classList.add('hidden'); document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('level-display').innerText = currentLevelIndex === 0 ? "Tutorial" : `Level ${currentLevelIndex}`;
    isLevelCleared = false; queueManager.slots = []; particlesArray = []; 
    const centerX = canvas.width / 2 - 32; const centerY = canvas.height / 2 - 32;
    const rawLevelData = LEVELS[currentLevelIndex];
    const levelLayout = rawLevelData.map(pos => { return { x: centerX + pos.ox, y: centerY + pos.oy, z: pos.z }; });
    tiles = levelManager.generateLevel(levelLayout, currentIconsToLoad);
    if (currentLevelIndex === 0) tiles.forEach(t => t.isTutorialTarget = true);
    requestAnimationFrame(gameLoop);
}

// ==========================================
// 4. INPUT & MATCH EXPLOSION
// ==========================================
function handleInput(e) {
    if (isLevelCleared) return; 
    const rect = canvas.getBoundingClientRect(); const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseX = clientX - rect.left; const mouseY = clientY - rect.top;
    const clickableTiles = [...tiles].sort((a, b) => b.z - a.z);
    for (let tile of clickableTiles) {
        if (tile.isClicked(mouseX, mouseY)) {
            if (queueManager.addTile(tile)) {
                tile.isTutorialTarget = false; tile.onClick(); playSound('tap'); triggerVibration(15);
                const activeBoardTiles = tiles.filter(t => !t.inQueue); levelManager.calculateLocks(activeBoardTiles);
            } else playSound('error');
            break; 
        }
    }
}
function createMatchExplosion(matchedTiles, iconName) {
    const colorMap = { btc: '#f7931a', eth: '#627eea', doge: '#ba9f33', apple: '#ff4d4d', banana: '#ffe066', grape: '#8e44ad', strawberry: '#e74c3c', panda: '#4a4a4a', lion: '#d35400' };
    const explosionColor = colorMap[iconName] || '#ffffff';
    matchedTiles.forEach(tile => { const centerX = tile.x + 32; const centerY = tile.y + 32; for (let i = 0; i < 20; i++) particlesArray.push(new Particle(centerX, centerY, explosionColor)); });
}
function handleWin() {
    isLevelCleared = true; const winReward = 4; shop.addCurrency('coins', winReward);
    triggerVibration([100, 50, 100]); playSound('win');
    document.getElementById('win-coins-display').innerText = `+${winReward} Coins!`; document.getElementById('btn-play').innerText = "Play Again"; 
    setTimeout(() => { document.getElementById('win-screen').classList.remove('hidden'); }, 500); 
}
canvas.addEventListener('mousedown', handleInput); canvas.addEventListener('touchstart', handleInput, { passive: true });

// ==========================================
// 5. GAME LOOP
// ==========================================
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; const barWidth = 520; ctx.beginPath(); ctx.roundRect(canvas.width / 2 - (barWidth / 2), queueManager.barY - 15, barWidth, 90, 15); ctx.fill();
    tiles.sort((a, b) => a.z - b.z);
    tiles.forEach(tile => { tile.update(); tile.draw(ctx, baseImage, loadedImages[tile.iconName]); });
    for (let i = particlesArray.length - 1; i >= 0; i--) { particlesArray[i].draw(ctx); if (!particlesArray[i].update()) particlesArray.splice(i, 1); }
    if (currentLevelIndex === 0 && !isLevelCleared) {
        ctx.save(); ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px Segoe UI'; ctx.textAlign = 'center'; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 4;
        if (queueManager.slots.length < 3) ctx.fillText("Tap all 3 tiles to make a match!", canvas.width / 2, canvas.height - 100); ctx.restore();
    }
    if (!isLevelCleared && tiles.length > 0 && tiles.every(t => t.inQueue) && queueManager.slots.length === 0) handleWin();
    if (!isLevelCleared) requestAnimationFrame(gameLoop);
}

// ==========================================
// 6. UI EVENT LISTENERS
// ==========================================
document.getElementById('btn-play').addEventListener('click', loadAssets);
document.getElementById('btn-next-level').addEventListener('click', () => {
    currentLevelIndex++; if (currentLevelIndex >= LEVELS.length) { alert("Congratulations! You've beaten all current levels!"); currentLevelIndex = 1; }
    localStorage.setItem('tileGame_currentLevel', currentLevelIndex); startGame(); 
});
document.getElementById('btn-home').addEventListener('click', () => { document.getElementById('win-screen').classList.add('hidden'); document.getElementById('main-menu').classList.remove('hidden'); ctx.clearRect(0, 0, canvas.width, canvas.height); });

// ==========================================
// 7. BOOT SEQUENCE & REFERRAL
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.opacity = '0'; 
        setTimeout(() => { document.getElementById('splash-screen').classList.add('hidden'); document.getElementById('main-menu').classList.remove('hidden'); updateReferralUI(); }, 800);
    }, 2000);
});

function updateReferralUI() {
    const today = new Date().toDateString(); let refData = JSON.parse(localStorage.getItem('tileGame_referrals')) || { date: today, count: 0 };
    if (refData.date !== today) { refData = { date: today, count: 0 }; localStorage.setItem('tileGame_referrals', JSON.stringify(refData)); }
    const btnInvite = document.getElementById('btn-invite');
    if (btnInvite) btnInvite.innerHTML = `💌 Invite Friends <br><span style="font-size: 0.8rem; font-weight: normal;">Earn 1 💎 per invite (${refData.count}/10 Today)</span>`;
}
document.getElementById('btn-invite').addEventListener('click', () => {
    const today = new Date().toDateString(); let refData = JSON.parse(localStorage.getItem('tileGame_referrals')) || { date: today, count: 0 };
    if (refData.count < 10) {
        refData.count++; localStorage.setItem('tileGame_referrals', JSON.stringify(refData)); shop.addCurrency('diamonds', 1); 
        triggerVibration([30, 50, 30]); alert("Thanks for sharing! +1 💎"); updateReferralUI();
    } else alert("Daily referral limit reached (10/10). Come back tomorrow to earn more diamonds!");
});
