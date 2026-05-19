class QueueManager {
    constructor() {
        this.maxSize = 7; this.slots = []; this.slotSpacing = 70; this.barY = 100;
    }
    addTile(tile) {
        if (this.slots.length >= this.maxSize) return false;
        this.slots.push(tile); this.sortQueue(); this.updateTilePositions();
        setTimeout(() => this.checkForMatch(), 250); return true;
    }
    sortQueue() { this.slots.sort((a, b) => a.iconName.localeCompare(b.iconName)); }
    updateTilePositions() {
        const screenCenterX = window.innerWidth > 600 ? 300 : window.innerWidth / 2;
        const totalWidth = this.slots.length * this.slotSpacing;
        const startX = screenCenterX - (totalWidth / 2) + (this.slotSpacing / 2) - (this.slots[0]?.width / 2 || 32);
        this.slots.forEach((tile, index) => { tile.targetX = startX + (index * this.slotSpacing); tile.targetY = this.barY; });
    }
    checkForMatch() {
        let counts = {};
        this.slots.forEach(t => { counts[t.iconName] = (counts[t.iconName] || 0) + 1; });
        for (let icon in counts) { if (counts[icon] >= 3) { this.removeTriplet(icon); return; } }
        if (this.slots.length >= this.maxSize) this.triggerGameOver();
    }
    removeTriplet(iconName) {
        let matchedTiles = this.slots.filter(t => t.iconName === iconName).slice(0, 3);
        if (typeof createMatchExplosion === "function") createMatchExplosion(matchedTiles, iconName);
        this.slots = this.slots.filter(t => !matchedTiles.includes(t));
        if (typeof playSound === "function") playSound('match');
        if (typeof triggerVibration === "function") triggerVibration([30, 50, 30]);
        this.updateTilePositions();
    }
    triggerGameOver() {
        if (typeof playSound === "function") playSound('error');
        const canvas = document.getElementById('gameCanvas');
        canvas.style.transform = "translate(5px, 5px)"; setTimeout(() => canvas.style.transform = "translate(0px, 0px)", 50);
    }
}
