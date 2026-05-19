class ShopManager {
    constructor() {
        this.coins = parseInt(localStorage.getItem('tileGame_coins')) || 0;
        this.diamonds = parseInt(localStorage.getItem('tileGame_diamonds')) || 0;
        this.activeTheme = localStorage.getItem('tileGame_activeTheme') || 'fruits';
        this.themes = {
            fruits:  { name: 'Fruits', price: 0, currency: 'coins', unlocked: true, icons: ['apple', 'banana', 'cherry', 'grape', 'kiwi', 'lemon', 'orange', 'peach', 'strawberry', 'watermelon'] },
            animals: { name: 'Animals', price: 20, currency: 'coins', unlocked: false, icons: ['bear', 'cat', 'dog', 'fox', 'koala', 'lion', 'monkey', 'panda', 'rabbit', 'tiger'] },
            flags:   { name: 'Flags', price: 40, currency: 'coins', unlocked: false, icons: ['australia', 'brazil', 'canada', 'france', 'germany', 'india', 'italy', 'japan', 'uk', 'usa'] },
            crypto:  { name: 'Crypto', price: 5, currency: 'diamonds', unlocked: false, icons: ['ada', 'bnb', 'btc', 'doge', 'dot', 'eth', 'link', 'ltc', 'sol', 'xrp'] }
        };
        this.loadUnlockedThemes(); this.updateWalletUI(); this.bindEvents();
    }
    loadUnlockedThemes() {
        const savedUnlocks = JSON.parse(localStorage.getItem('tileGame_unlockedThemes')) || ['fruits'];
        savedUnlocks.forEach(themeKey => { if (this.themes[themeKey]) this.themes[themeKey].unlocked = true; });
    }
    saveProgress() {
        localStorage.setItem('tileGame_coins', this.coins); localStorage.setItem('tileGame_diamonds', this.diamonds);
        localStorage.setItem('tileGame_activeTheme', this.activeTheme);
        const unlockedKeys = Object.keys(this.themes).filter(k => this.themes[k].unlocked);
        localStorage.setItem('tileGame_unlockedThemes', JSON.stringify(unlockedKeys));
    }
    addCurrency(type, amount) {
        if (type === 'coins') this.coins += amount; if (type === 'diamonds') this.diamonds += amount;
        this.saveProgress(); this.updateWalletUI();
    }
    updateWalletUI() {
        const coinDisplay = document.getElementById('coin-count');
        if (coinDisplay) coinDisplay.innerText = `🪙 ${this.coins} | 💎 ${this.diamonds}`;
    }
    openShop() {
        const shopMenu = document.getElementById('shop-menu'); const grid = shopMenu.querySelector('.tileset-grid'); grid.innerHTML = '';
        Object.keys(this.themes).forEach(key => {
            const theme = this.themes[key]; const card = document.createElement('div');
            card.className = `tileset-card ${this.activeTheme === key ? 'active' : ''} ${!theme.unlocked ? 'locked' : ''}`;
            if (theme.unlocked) card.innerHTML = `${theme.name} <br> <small>${this.activeTheme === key ? '(Selected)' : '(Tap to Equip)'}</small>`;
            else { const icon = theme.currency === 'diamonds' ? '💎' : '🪙'; card.innerHTML = `${theme.name} <br> <small>Unlock: ${theme.price} ${icon}</small>`; }
            card.addEventListener('click', () => { if (typeof triggerVibration === "function") triggerVibration(10); this.handleThemeClick(key); });
            grid.appendChild(card);
        });
        shopMenu.classList.remove('hidden');
    }
    handleThemeClick(key) {
        const theme = this.themes[key];
        if (theme.unlocked) { this.activeTheme = key; this.saveProgress(); this.openShop(); } 
        else {
            if (theme.currency === 'coins' && this.coins >= theme.price) { this.coins -= theme.price; theme.unlocked = true; this.activeTheme = key; this.saveProgress(); this.updateWalletUI(); this.openShop(); } 
            else if (theme.currency === 'diamonds' && this.diamonds >= theme.price) { this.diamonds -= theme.price; theme.unlocked = true; this.activeTheme = key; this.saveProgress(); this.updateWalletUI(); this.openShop(); } 
            else { if (typeof triggerVibration === "function") triggerVibration([20, 20, 20]); if (typeof playSound === "function") playSound('error'); alert(`Not enough ${theme.currency}!`); }
        }
    }
    bindEvents() {
        document.getElementById('btn-shop').addEventListener('click', () => this.openShop());
        document.getElementById('btn-close-shop').addEventListener('click', () => document.getElementById('shop-menu').classList.add('hidden'));
    }
    getActiveIcons() { return this.themes[this.activeTheme].icons; }
}
