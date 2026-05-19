class Tile {
    constructor(id, x, y, z, iconName) {
        this.id = id; this.x = x; this.y = y; this.z = z; this.iconName = iconName;
        this.width = 64; this.height = 64;
        this.isLocked = false; this.inQueue = false; this.isMoving = false; this.isTutorialTarget = false;
        this.targetX = x; this.targetY = y;
    }
    isClicked(mouseX, mouseY) {
        if (this.isLocked || this.inQueue) return false;
        return (mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height);
    }
    onClick() {
        this.inQueue = true; this.isMoving = true;
    }
    update() {
        if (this.isMoving) {
            const speed = 0.2;
            this.x += (this.targetX - this.x) * speed;
            this.y += (this.targetY - this.y) * speed;
            if (Math.abs(this.targetX - this.x) < 1 && Math.abs(this.targetY - this.y) < 1) {
                this.x = this.targetX; this.y = this.targetY; this.isMoving = false;
            }
        }
    }
    draw(ctx, baseImage, iconImage) {
        if (baseImage) ctx.drawImage(baseImage, this.x, this.y, this.width, this.height);
        else { ctx.fillStyle = this.isLocked ? '#cccccc' : '#ffffff'; ctx.fillRect(this.x, this.y, this.width, this.height); }
        if (iconImage) { const padding = 10; ctx.drawImage(iconImage, this.x + padding, this.y + padding, this.width - (padding * 2), this.height - (padding * 2)); }
        if (this.isLocked) { ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.fillRect(this.x, this.y, this.width, this.height); }
        if (this.isTutorialTarget) {
            const pulse = Math.abs(Math.sin(Date.now() / 300));
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + (pulse * 0.6)})`; ctx.lineWidth = 4; ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }
    }
}
