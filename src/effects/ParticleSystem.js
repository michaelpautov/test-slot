import { Container, Graphics } from 'pixi.js';

export class ParticleSystem extends Container {
    constructor() {
        super();
        this.particles = [];
        this.isActive = false;
    }

    createFireworks(x, y, color = 0xffffff) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new Graphics();
            particle.beginFill(color);
            particle.drawCircle(0, 0, 3);
            particle.endFill();
            
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 1.0;
            particle.gravity = 0.1;
            
            this.particles.push(particle);
            this.addChild(particle);
        }
        
        this.isActive = true;
    }

    createSparkles(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const sparkle = new Graphics();
            const colors = [0xffff00, 0xff8800, 0xff0080, 0x00ff80, 0x8000ff];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            sparkle.beginFill(color);
            this.drawStar(sparkle, 0, 0, 4, 6, 3);
            sparkle.endFill();
            
            sparkle.x = x + (Math.random() - 0.5) * 100;
            sparkle.y = y + (Math.random() - 0.5) * 100;
            sparkle.vx = (Math.random() - 0.5) * 3;
            sparkle.vy = (Math.random() - 0.5) * 3;
            sparkle.life = 1.0;
            sparkle.rotationSpeed = (Math.random() - 0.5) * 0.3;
            
            this.particles.push(sparkle);
            this.addChild(sparkle);
        }
        
        this.isActive = true;
    }

    createRainbow(startX, startY, endX, endY) {
        const steps = 50;
        const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x4400ff, 0x8800ff];
        
        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const colorIndex = Math.floor(t * (colors.length - 1));
            const color = colors[colorIndex];
            
            const particle = new Graphics();
            particle.beginFill(color, 0.8);
            particle.drawCircle(0, 0, 4);
            particle.endFill();
            
            particle.x = startX + (endX - startX) * t;
            particle.y = startY + (endY - startY) * t;
            particle.vy = -2;
            particle.life = 1.0;
            
            this.particles.push(particle);
            this.addChild(particle);
        }
        
        this.isActive = true;
    }

    update() {
        if (!this.isActive) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Обновляем позицию
            particle.x += particle.vx || 0;
            particle.y += particle.vy || 0;
            
            // Применяем гравитацию
            if (particle.gravity) {
                particle.vy += particle.gravity;
            }
            
            // Вращение
            if (particle.rotationSpeed) {
                particle.rotation += particle.rotationSpeed;
            }
            
            // Уменьшаем время жизни
            particle.life -= 0.02;
            particle.alpha = particle.life;
            
            // Удаляем мертвые частицы
            if (particle.life <= 0) {
                this.removeChild(particle);
                this.particles.splice(i, 1);
            }
        }
        
        // Деактивируем систему если нет частиц
        if (this.particles.length === 0) {
            this.isActive = false;
        }
    }

    // Метод для рисования звезды
    drawStar(graphics, x, y, points, outerRadius, innerRadius) {
        const angle = Math.PI / points;
        
        graphics.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const currentAngle = angle * i - Math.PI / 2;
            const px = x + Math.cos(currentAngle) * radius;
            const py = y + Math.sin(currentAngle) * radius;
            graphics.lineTo(px, py);
        }
        
        graphics.closePath();
    }

    clear() {
        this.particles.forEach(particle => {
            this.removeChild(particle);
        });
        this.particles = [];
        this.isActive = false;
    }
}