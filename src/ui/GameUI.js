import { Container, Graphics, Text } from 'pixi.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class GameUI extends Container {
    constructor(game) {
        super();
        this.game = game;
        
        this.balanceText = null;
        this.betText = null;
        this.winText = null;
        this.spinButton = null;
        this.betPlusButton = null;
        this.betMinusButton = null;
    }

    async init() {
        this.createBackground();
        this.createBalanceDisplay();
        this.createBetControls();
        this.createWinDisplay();
        this.createSpinButton();
        this.createPaylineInfo();
    }

    createBackground() {
        // Создаем градиентный фон
        const bg = new Graphics();
        
        // Создаем радиальный градиент
        const steps = 30;
        const centerX = 175;
        const centerY = 200;
        const maxRadius = 250;
        
        for (let i = steps; i >= 0; i--) {
            const radius = (i / steps) * maxRadius;
            const t = i / steps;
            
            // Цвета градиента от темно-синего к фиолетовому
            const color1 = 0x1a1a2e;
            const color2 = 0x16213e;
            
            const r1 = (color1 >> 16) & 0xff;
            const g1 = (color1 >> 8) & 0xff;
            const b1 = color1 & 0xff;
            
            const r2 = (color2 >> 16) & 0xff;
            const g2 = (color2 >> 8) & 0xff;
            const b2 = color2 & 0xff;
            
            const r = Math.round(r1 + (r2 - r1) * t);
            const g = Math.round(g1 + (g2 - g1) * t);
            const b = Math.round(b1 + (b2 - b1) * t);
            
            const lerpColor = (r << 16) | (g << 8) | b;
            
            bg.beginFill(lerpColor, 0.9);
            bg.drawCircle(centerX, centerY, radius);
            bg.endFill();
        }
        
        // Обрезаем по форме панели
        const mask = new Graphics();
        mask.beginFill(0xffffff);
        mask.drawRoundedRect(0, 0, 350, 400, 10);
        mask.endFill();
        
        bg.mask = mask;
        this.addChild(mask);
        this.addChild(bg);
        
        // Добавляем светящуюся рамку
        const border = new Graphics();
        border.lineStyle(3, GAME_CONFIG.COLORS.PRIMARY, 0.8);
        border.drawRoundedRect(0, 0, 350, 400, 10);
        
        border.lineStyle(1, 0x00ffff, 0.6);
        border.drawRoundedRect(2, 2, 346, 396, 8);
        
        this.addChild(border);
        
        // Добавляем декоративные элементы
        this.addDecorations();
    }

    addDecorations() {
        // Добавляем звездочки в углах
        const corners = [
            { x: 20, y: 20 },
            { x: 330, y: 20 },
            { x: 20, y: 380 },
            { x: 330, y: 380 }
        ];
        
        corners.forEach(corner => {
            const star = new Graphics();
            star.beginFill(0xffd700, 0.7);
            this.drawStar(star, corner.x, corner.y, 4, 8, 4);
            star.endFill();
            this.addChild(star);
        });
        
        // Добавляем плавающие частицы
        this.createFloatingParticles();
    }

    createFloatingParticles() {
        this.particles = [];
        
        for (let i = 0; i < 8; i++) {
            const particle = new Graphics();
            particle.beginFill(0x00ffff, 0.3);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            
            particle.x = Math.random() * 350;
            particle.y = Math.random() * 400;
            particle.vx = (Math.random() - 0.5) * 0.5;
            particle.vy = (Math.random() - 0.5) * 0.5;
            
            this.particles.push(particle);
            this.addChild(particle);
        }
        
        // Анимация частиц
        this.particleAnimation = setInterval(() => {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Отскок от границ
                if (particle.x <= 0 || particle.x >= 350) particle.vx *= -1;
                if (particle.y <= 0 || particle.y >= 400) particle.vy *= -1;
                
                // Плавное изменение прозрачности
                particle.alpha = 0.3 + Math.sin(Date.now() * 0.002 + particle.x) * 0.2;
            });
        }, 50);
    }

    createBalanceDisplay() {
        // Заголовок
        const balanceLabel = new Text('БАЛАНС', {
            fontSize: 18,
            fill: GAME_CONFIG.COLORS.TEXT,
            fontWeight: 'bold'
        });
        balanceLabel.x = 20;
        balanceLabel.y = 20;
        this.addChild(balanceLabel);
        
        // Значение баланса
        this.balanceText = new Text(`${this.game.balance}₽`, {
            fontSize: 24,
            fill: GAME_CONFIG.COLORS.SECONDARY,
            fontWeight: 'bold'
        });
        this.balanceText.x = 20;
        this.balanceText.y = 45;
        this.addChild(this.balanceText);
    }

    createBetControls() {
        // Заголовок ставки
        const betLabel = new Text('СТАВКА', {
            fontSize: 18,
            fill: GAME_CONFIG.COLORS.TEXT,
            fontWeight: 'bold'
        });
        betLabel.x = 20;
        betLabel.y = 90;
        this.addChild(betLabel);
        
        // Кнопка уменьшения ставки
        this.betMinusButton = this.createButton('-', 20, 120, 40, 40);
        this.betMinusButton.on('pointerdown', () => this.game.decreaseBet());
        this.addChild(this.betMinusButton);
        
        // Текст ставки
        this.betText = new Text(`${this.game.currentBet}₽`, {
            fontSize: 20,
            fill: GAME_CONFIG.COLORS.TEXT,
            fontWeight: 'bold',
            align: 'center'
        });
        this.betText.anchor.set(0.5);
        this.betText.x = 110;
        this.betText.y = 140;
        this.addChild(this.betText);
        
        // Кнопка увеличения ставки
        this.betPlusButton = this.createButton('+', 160, 120, 40, 40);
        this.betPlusButton.on('pointerdown', () => this.game.increaseBet());
        this.addChild(this.betPlusButton);
    }

    createWinDisplay() {
        // Заголовок выигрыша
        const winLabel = new Text('ВЫИГРЫШ', {
            fontSize: 18,
            fill: GAME_CONFIG.COLORS.TEXT,
            fontWeight: 'bold'
        });
        winLabel.x = 20;
        winLabel.y = 180;
        this.addChild(winLabel);
        
        // Значение выигрыша
        this.winText = new Text('0₽', {
            fontSize: 24,
            fill: GAME_CONFIG.COLORS.WARNING,
            fontWeight: 'bold'
        });
        this.winText.x = 20;
        this.winText.y = 205;
        this.addChild(this.winText);
    }

    createSpinButton() {
        this.spinButton = this.createButton('КРУТИТЬ', 50, 260, 250, 60, GAME_CONFIG.COLORS.PRIMARY);
        this.spinButton.on('pointerdown', () => {
            if (!this.game.isSpinning) {
                this.game.spin();
            }
        });
        this.addChild(this.spinButton);
        
        // Текст на кнопке
        const spinText = new Text('КРУТИТЬ', {
            fontSize: 24,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        spinText.anchor.set(0.5);
        spinText.x = 175;
        spinText.y = 290;
        this.addChild(spinText);
    }

    createPaylineInfo() {
        const paylineLabel = new Text(`ЛИНИЙ: ${GAME_CONFIG.PAYLINES.length}`, {
            fontSize: 16,
            fill: GAME_CONFIG.COLORS.TEXT
        });
        paylineLabel.x = 20;
        paylineLabel.y = 340;
        this.addChild(paylineLabel);
        
        const totalBetLabel = new Text(`ОБЩАЯ СТАВКА: ${this.game.currentBet * GAME_CONFIG.PAYLINES.length}₽`, {
            fontSize: 14,
            fill: GAME_CONFIG.COLORS.TEXT
        });
        totalBetLabel.x = 20;
        totalBetLabel.y = 360;
        this.addChild(totalBetLabel);
        
        this.totalBetLabel = totalBetLabel;
    }

    createButton(text, x, y, width, height, color = 0x555555) {
        const button = new Graphics();
        
        // Создаем градиентный фон кнопки
        const steps = 15;
        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const currentColor = this.lerpColor(color, this.darkenColor(color, 0.3), t);
            const yPos = (height / steps) * i;
            const segmentHeight = height / steps + 1;
            
            button.beginFill(currentColor);
            button.drawRoundedRect(0, yPos, width, segmentHeight, i === 0 ? 8 : 0);
            button.endFill();
        }
        
        // Добавляем внутреннее свечение
        button.lineStyle(2, this.lightenColor(color, 0.5), 0.6);
        button.drawRoundedRect(2, 2, width - 4, height - 4, 6);
        
        // Внешняя рамка
        button.lineStyle(2, 0xffffff, 0.8);
        button.drawRoundedRect(0, 0, width, height, 8);
        
        button.x = x;
        button.y = y;
        button.eventMode = 'static';
        button.cursor = 'pointer';
        
        // Эффекты при наведении
        button.originalScale = 1;
        button.on('pointerover', () => {
            button.scale.set(1.05);
            // Добавляем эффект свечения
            button.filters = [this.createGlowFilter(color)];
        });
        
        button.on('pointerout', () => {
            button.scale.set(1);
            button.filters = [];
        });
        
        button.on('pointerdown', () => {
            button.scale.set(0.95);
        });
        
        button.on('pointerup', () => {
            button.scale.set(1.05);
        });
        
        // Текст кнопки
        if (text !== 'КРУТИТЬ') {
            const buttonText = new Text(text, {
                fontSize: text === '+' || text === '-' ? 24 : 16,
                fill: 0xffffff,
                fontWeight: 'bold',
                stroke: 0x000000,
                strokeThickness: 2,
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowBlur: 2,
                dropShadowDistance: 1
            });
            buttonText.anchor.set(0.5);
            buttonText.x = width / 2;
            buttonText.y = height / 2;
            button.addChild(buttonText);
        }
        
        return button;
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

    darkenColor(color, amount) {
        const r = Math.max(0, ((color >> 16) & 0xff) * (1 - amount));
        const g = Math.max(0, ((color >> 8) & 0xff) * (1 - amount));
        const b = Math.max(0, (color & 0xff) * (1 - amount));
        
        return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
    }

    lightenColor(color, amount) {
        const r = Math.min(255, ((color >> 16) & 0xff) + 255 * amount);
        const g = Math.min(255, ((color >> 8) & 0xff) + 255 * amount);
        const b = Math.min(255, (color & 0xff) + 255 * amount);
        
        return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
    }

    createGlowFilter(color) {
        // Простая имитация свечения через тень
        return {
            blur: 10,
            color: color,
            alpha: 0.6,
            distance: 0
        };
    }

    updateBalance(balance) {
        this.balanceText.text = `${balance}₽`;
        
        // Анимация изменения баланса
        this.balanceText.tint = balance > this.game.balance ? GAME_CONFIG.COLORS.SECONDARY : GAME_CONFIG.COLORS.DANGER;
        
        setTimeout(() => {
            this.balanceText.tint = GAME_CONFIG.COLORS.SECONDARY;
        }, 500);
    }

    updateBet(bet) {
        this.betText.text = `${bet}₽`;
        if (this.totalBetLabel) {
            this.totalBetLabel.text = `ОБЩАЯ СТАВКА: ${bet * GAME_CONFIG.PAYLINES.length}₽`;
        }
    }

    updateWin(winAmount) {
        this.winText.text = `${winAmount}₽`;
        
        if (winAmount > 0) {
            // Радужная анимация выигрыша
            const colors = [0xff0080, 0x00ff80, 0x8000ff, 0xffff00, 0xff8000];
            let colorIndex = 0;
            
            const colorCycle = setInterval(() => {
                this.winText.tint = colors[colorIndex % colors.length];
                colorIndex++;
            }, 200);
            
            // Останавливаем цветовую анимацию через 3 секунды
            setTimeout(() => {
                clearInterval(colorCycle);
                this.winText.tint = GAME_CONFIG.COLORS.SECONDARY;
            }, 3000);
            
            // Эффект увеличения с отскоком
            let scale = 1;
            let growing = true;
            const pulseInterval = setInterval(() => {
                if (growing) {
                    scale += 0.08;
                    if (scale >= 1.5) {
                        growing = false;
                    }
                } else {
                    scale -= 0.05;
                    if (scale <= 1.1) {
                        growing = true;
                    }
                }
                this.winText.scale.set(scale);
            }, 50);
            
            // Останавливаем анимацию размера через 3 секунды
            setTimeout(() => {
                clearInterval(pulseInterval);
                this.winText.scale.set(1);
            }, 3000);
            
            // Создаем звездочки вокруг текста выигрыша
            this.createWinStars();
            
        } else {
            this.winText.tint = GAME_CONFIG.COLORS.WARNING;
        }
    }

    createWinStars() {
        const starCount = 8;
        const stars = [];
        
        for (let i = 0; i < starCount; i++) {
            const star = new Graphics();
            star.beginFill(0xffd700, 0.8);
            this.drawStar(star, 0, 0, 5, 8, 4);
            star.endFill();
            
            const angle = (i / starCount) * Math.PI * 2;
            const radius = 60;
            
            star.x = this.winText.x + Math.cos(angle) * radius;
            star.y = this.winText.y + Math.sin(angle) * radius;
            star.rotation = angle;
            
            stars.push(star);
            this.addChild(star);
        }
        
        // Анимация вращения звезд
        let rotationTimer = 0;
        const rotateStars = setInterval(() => {
            rotationTimer += 0.1;
            
            stars.forEach((star, index) => {
                const angle = (index / starCount) * Math.PI * 2 + rotationTimer;
                const radius = 60 + Math.sin(rotationTimer * 2) * 10;
                
                star.x = this.winText.x + Math.cos(angle) * radius;
                star.y = this.winText.y + Math.sin(angle) * radius;
                star.rotation += 0.1;
                star.alpha = 0.8 + Math.sin(rotationTimer * 3) * 0.2;
            });
        }, 50);
        
        // Убираем звезды через 3 секунды
        setTimeout(() => {
            clearInterval(rotateStars);
            stars.forEach(star => {
                this.removeChild(star);
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

    setSpinButtonEnabled(enabled) {
        this.spinButton.eventMode = enabled ? 'static' : 'none';
        this.spinButton.alpha = enabled ? 1 : 0.5;
    }
}