class LevelManager {
    constructor() { this.tileWidth = 64; this.tileHeight = 64; }
    generateLevel(levelData, availableIcons) {
        let tiles = []; let totalTiles = levelData.length;
        if (totalTiles % 3 !== 0) return [];
        let iconPool = []; let numberOfUniqueIconsNeeded = totalTiles / 3;
        for (let i = 0; i < numberOfUniqueIconsNeeded; i++) {
            let icon = availableIcons[i % availableIcons.length]; iconPool.push(icon, icon, icon);
        }
        for (let i = iconPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); [iconPool[i], iconPool[j]] = [iconPool[j], iconPool[i]];
        }
        levelData.forEach((pos, index) => { tiles.push(new Tile(index, pos.x, pos.y, pos.z, iconPool[index])); });
        this.calculateLocks(tiles); return tiles;
    }
    calculateLocks(tiles) {
        tiles.forEach(t => t.isLocked = false);
        for (let i = 0; i < tiles.length; i++) {
            for (let j = 0; j < tiles.length; j++) {
                if (i === j) continue;
                if (tiles[i].z > tiles[j].z && this.checkOverlap(tiles[i], tiles[j])) tiles[j].isLocked = true;
            }
        }
    }
    checkOverlap(tileA, tileB) {
        const margin = 2; return (Math.abs(tileA.x - tileB.x) < (this.tileWidth - margin) && Math.abs(tileA.y - tileB.y) < (this.tileHeight - margin));
    }
}
