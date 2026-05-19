class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.vx = (Math.random() - 0.5) * 10; this.vy = (Math.random() * -6) - 2;
        this.gravity = 0.25; this.radius = Math.random() * 3 + 1;
        this.life = 1.0; this.decay = Math.random() * 0.04 + 0.02;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += this.gravity;
        this.life -= this.decay; this.radius *= 0.98;
        return this.life > 0;
    }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha = this.life; ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
}
