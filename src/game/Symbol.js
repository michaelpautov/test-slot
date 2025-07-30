import { Container, Graphics, Text, Sprite, Texture } from 'pixi.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class Symbol extends Container {
    constructor(symbolId) {
        super();
        this.symbolId = symbolId;
        this.symbolData = GAME_CONFIG.SYMBOLS[symbolId];
        this.animationTimer = 0;
        
        this.createSymbol();
        this.addIdleAnimation();
    }

    createSymbol() {
        // Создаем градиентный фон символа
        const bg = this.createGradientBackground();
        this.addChild(bg);
        
        // Добавляем внутреннее свечение
        const innerGlow = this.createInnerGlow();
        this.addChild(innerGlow);
        
        // Рамка с градиентом
        const border = this.createGradientBorder();
        this.addChild(border);
        
        // Добавляем иконку/текст символа
        this.createSymbolIcon();
        
        // Добавляем блики
        this.createShine();
    }

    createGradientBackground() {
        const bg = new Graphics();
        const colors = this.getGradientColors();
        
        // Создаем радиальный градиент вручную
        const steps = 20;
        const centerX = GAME_CONFIG.SYMBOL_SIZE / 2;
        const centerY = GAME_CONFIG.SYMBOL_SIZE / 2;
        const maxRadius = GAME_CONFIG.SYMBOL_SIZE * 0.8;
        
        for (let i = steps; i >= 0; i--) {
            const radius = (i / steps) * maxRadius;
            const alpha = 1 - (i / steps) * 0.3;
            const colorLerp = this.lerpColor(colors.center, colors.edge, i / steps);
            
            bg.beginFill(colorLerp, alpha);
            bg.drawCircle(centerX, centerY, radius);
            bg.endFill();
        }
        
        // Обрезаем до округлого прямоугольника
        const mask = new Graphics();
        mask.beginFill(0xffffff);
        mask.drawRoundedRect(5, 5, GAME_CONFIG.SYMBOL_SIZE - 10, GAME_CONFIG.SYMBOL_SIZE - 10, 12);
        mask.endFill();
        
        bg.mask = mask;
        this.addChild(mask);
        
        return bg;
    }

    createInnerGlow() {
        const glow = new Graphics();
        const glowColor = this.getGlowColor();
        
        glow.lineStyle(8, glowColor, 0.4);
        glow.drawRoundedRect(8, 8, GAME_CONFIG.SYMBOL_SIZE - 16, GAME_CONFIG.SYMBOL_SIZE - 16, 10);
        
        glow.lineStyle(4, glowColor, 0.6);
        glow.drawRoundedRect(10, 10, GAME_CONFIG.SYMBOL_SIZE - 20, GAME_CONFIG.SYMBOL_SIZE - 20, 8);
        
        return glow;
    }

    createGradientBorder() {
        const border = new Graphics();
        const colors = this.getBorderColors();
        
        // Создаем многоцветную рамку
        border.lineStyle(3, colors.primary, 0.8);
        border.drawRoundedRect(5, 5, GAME_CONFIG.SYMBOL_SIZE - 10, GAME_CONFIG.SYMBOL_SIZE - 10, 12);
        
        border.lineStyle(1, colors.secondary, 1);
        border.drawRoundedRect(6, 6, GAME_CONFIG.SYMBOL_SIZE - 12, GAME_CONFIG.SYMBOL_SIZE - 12, 11);
        
        return border;
    }

    createShine() {
        // Добавляем блик в верхнем левом углу
        const shine = new Graphics();
        shine.beginFill(0xffffff, 0.3);
        
        // Создаем эллиптический блик
        shine.drawEllipse(25, 25, 20, 15);
        shine.endFill();
        
        // Добавляем дополнительные блики
        shine.beginFill(0xffffff, 0.1);
        shine.drawEllipse(GAME_CONFIG.SYMBOL_SIZE - 30, 30, 15, 10);
        shine.endFill();
        
        this.addChild(shine);
    }

    createSymbolIcon() {
        const iconText = this.getSymbolText();
        
        // Создаем текст с тенью
        const shadowText = new Text(iconText, {
            fontSize: this.symbolId === 'WILD' || this.symbolId === 'SCATTER' ? 16 : 24,
            fill: 0x000000,
            fontWeight: 'bold',
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 2,
            dropShadowDistance: 2
        });
        
        const text = new Text(iconText, {
            fontSize: this.symbolId === 'WILD' || this.symbolId === 'SCATTER' ? 16 : 24,
            fill: this.getTextGradient(),
            fontWeight: 'bold',
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 2
        });
        
        shadowText.anchor.set(0.5);
        shadowText.x = GAME_CONFIG.SYMBOL_SIZE / 2 + 1;
        shadowText.y = GAME_CONFIG.SYMBOL_SIZE / 2 + 1;
        
        text.anchor.set(0.5);
        text.x = GAME_CONFIG.SYMBOL_SIZE / 2;
        text.y = GAME_CONFIG.SYMBOL_SIZE / 2;
        
        this.addChild(shadowText);
        this.addChild(text);
        
        // Добавляем эмодзи для некоторых символов
        if (this.hasEmoji()) {
            const emoji = new Text(this.getEmoji(), {
                fontSize: 50,
                align: 'center',
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowBlur: 3,
                dropShadowDistance: 2
            });
            
            emoji.anchor.set(0.5);
            emoji.x = GAME_CONFIG.SYMBOL_SIZE / 2;
            emoji.y = GAME_CONFIG.SYMBOL_SIZE / 2 - 15;
            
            this.addChild(emoji);
            
            // Перемещаем текст ниже
            text.y = GAME_CONFIG.SYMBOL_SIZE / 2 + 25;
            shadowText.y = GAME_CONFIG.SYMBOL_SIZE / 2 + 26;
            text.style.fontSize = 14;
            shadowText.style.fontSize = 14;
        }
        
        this.textElement = text;
    }

    getTextGradient() {
        const textColors = {
            'cherry': 0xffffff,
            'lemon': 0xffffff,
            'orange': 0xffffff,
            'plum': 0xffffff,
            'bell': 0x000000,
            'bar': 0xffffff,
            'seven': 0xffff00,
            'wild': 0xffffff,
            'scatter': 0xffffff
        };
        
        return textColors[this.symbolId] || 0xffffff;
    }

    addIdleAnimation() {
        // Легкая анимация покачивания
        this.idleAnimation = setInterval(() => {
            this.animationTimer += 0.1;
            
            // Легкое покачивание
            this.rotation = Math.sin(this.animationTimer) * 0.02;
            
            // Легкое изменение масштаба
            const scale = 1 + Math.sin(this.animationTimer * 0.7) * 0.01;
            this.scale.set(scale);
            
        }, 50);
    }

    getGradientColors() {
        const gradients = {
            'cherry': { center: 0xff4757, edge: 0xc44569 },
            'lemon': { center: 0xffa502, edge: 0xff6348 },
            'orange': { center: 0xff9500, edge: 0xff6b35 },
            'plum': { center: 0xa55eea, edge: 0x5f27cd },
            'bell': { center: 0xfeca57, edge: 0xff9ff3 },
            'bar': { center: 0x3742fa, edge: 0x2f3542 },
            'seven': { center: 0xff3838, edge: 0xff9ff3 },
            'wild': { center: 0x2ed573, edge: 0x7bed9f },
            'scatter': { center: 0xa55eea, edge: 0xf368e0 }
        };
        
        return gradients[this.symbolId] || { center: 0x70a1ff, edge: 0x5352ed };
    }

    getGlowColor() {
        const glowColors = {
            'cherry': 0xff4757,
            'lemon': 0xffa502,
            'orange': 0xff9500,
            'plum': 0xa55eea,
            'bell': 0xfeca57,
            'bar': 0x3742fa,
            'seven': 0xff3838,
            'wild': 0x2ed573,
            'scatter': 0xf368e0
        };
        
        return glowColors[this.symbolId] || 0x70a1ff;
    }

    getBorderColors() {
        const borderColors = {
            'cherry': { primary: 0xffffff, secondary: 0xffcccc },
            'lemon': { primary: 0xffffff, secondary: 0xfff2cc },
            'orange': { primary: 0xffffff, secondary: 0xffe6cc },
            'plum': { primary: 0xffffff, secondary: 0xf0ccff },
            'bell': { primary: 0xffffff, secondary: 0xfff9cc },
            'bar': { primary: 0xffffff, secondary: 0xccddff },
            'seven': { primary: 0xffffff, secondary: 0xffcccc },
            'wild': { primary: 0xffffff, secondary: 0xccffdd },
            'scatter': { primary: 0xffffff, secondary: 0xffccf0 }
        };
        
        return borderColors[this.symbolId] || { primary: 0xffffff, secondary: 0xccddff };
    }

    lerpColor(color1, color2, t) {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return (r << 16) | (g << 8) | b;
    }

    getSymbolText() {
        const texts = {
            'cherry': 'CHERRY',
            'lemon': 'LEMON',
            'orange': 'ORANGE',
            'plum': 'PLUM',
            'bell': 'BELL',
            'bar': 'BAR',
            'seven': '777',
            'wild': 'WILD',
            'scatter': 'SCATTER'
        };
        
        return texts[this.symbolId] || this.symbolId.toUpperCase();
    }

    hasEmoji() {
        return ['cherry', 'lemon', 'orange', 'plum'].includes(this.symbolId);
    }

    getEmoji() {
        const emojis = {
            'cherry': '🍒',
            'lemon': '🍋',
            'orange': '🍊',
            'plum': '🟣'
        };
        
        return emojis[this.symbolId] || '';
    }

    // Анимация выигрышного символа
    highlight() {
        // Останавливаем анимацию покачивания
        if (this.idleAnimation) {
            clearInterval(this.idleAnimation);
        }
        
        // Создаем радужное свечение
        const rainbowGlow = new Graphics();
        this.addChild(rainbowGlow);
        
        // Создаем частицы
        this.createWinParticles();
        
        // Анимация радужного свечения
        let glowTimer = 0;
        let scaleTimer = 0;
        
        const glowAnimation = () => {
            glowTimer += 0.2;
            scaleTimer += 0.15;
            
            rainbowGlow.clear();
            
            // Радужные цвета
            const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff];
            const colorIndex = Math.floor(glowTimer) % colors.length;
            const currentColor = colors[colorIndex];
            
            // Пульсирующее свечение
            const glowAlpha = 0.6 + Math.sin(glowTimer * 2) * 0.3;
            rainbowGlow.lineStyle(6, currentColor, glowAlpha);
            rainbowGlow.drawRoundedRect(0, 0, GAME_CONFIG.SYMBOL_SIZE, GAME_CONFIG.SYMBOL_SIZE, 15);
            
            rainbowGlow.lineStyle(3, 0xffffff, glowAlpha * 0.8);
            rainbowGlow.drawRoundedRect(2, 2, GAME_CONFIG.SYMBOL_SIZE - 4, GAME_CONFIG.SYMBOL_SIZE - 4, 13);
            
            // Пульсация размера
            const scale = 1 + Math.sin(scaleTimer) * 0.1;
            this.scale.set(scale);
        };
        
        const interval = setInterval(glowAnimation, 50);
        
        // Убираем эффект через 3 секунды
        setTimeout(() => {
            clearInterval(interval);
            this.removeChild(rainbowGlow);
            this.scale.set(1);
            this.rotation = 0;
            
            // Восстанавливаем анимацию покачивания
            this.addIdleAnimation();
        }, 3000);
    }

    createWinParticles() {
        // Создаем частицы вокруг символа
        const particleCount = 15;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new Graphics();
            const colors = [0xffff00, 0xff8800, 0xff0080, 0x00ff80, 0x8000ff];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.beginFill(color);
            this.drawStar(particle, 0, 0, 5, 4, 2);
            particle.endFill();
            
            // Случайная позиция вокруг символа
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = GAME_CONFIG.SYMBOL_SIZE * 0.7;
            
            particle.x = GAME_CONFIG.SYMBOL_SIZE / 2 + Math.cos(angle) * radius;
            particle.y = GAME_CONFIG.SYMBOL_SIZE / 2 + Math.sin(angle) * radius;
            
            particle.vx = Math.cos(angle) * 2;
            particle.vy = Math.sin(angle) * 2;
            particle.life = 1.0;
            
            particles.push(particle);
            this.addChild(particle);
        }
        
        // Анимация частиц
        const animateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 0.02;
                particle.alpha = particle.life;
                particle.rotation += 0.2;
                
                // Гравитация
                particle.vy += 0.1;
            });
            
            // Удаляем "мертвые" частицы
            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].life <= 0) {
                    this.removeChild(particles[i]);
                    particles.splice(i, 1);
                }
            }
        };
        
        const particleInterval = setInterval(animateParticles, 50);
        
        // Остановка анимации частиц через 3 секунды
        setTimeout(() => {
            clearInterval(particleInterval);
            particles.forEach(particle => {
                if (this.children.includes(particle)) {
                    this.removeChild(particle);
                }
            });
        }, 3000);
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

    destroy() {
        // Очищаем анимации при удалении символа
        if (this.idleAnimation) {
            clearInterval(this.idleAnimation);
        }
        super.destroy();
    }
}