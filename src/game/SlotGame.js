import { Container, Graphics, Text } from 'pixi.js';
import { Reel } from './Reel.js';
import { GameUI } from '../ui/GameUI.js';
import { PaylineManager } from './PaylineManager.js';
import { SoundManager } from '../utils/SoundManager.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class SlotGame {
    constructor(app) {
        this.app = app;
        this.container = new Container();
        this.app.stage.addChild(this.container);
        
        this.reels = [];
        this.isSpinning = false;
        this.balance = 1000;
        this.currentBet = GAME_CONFIG.DEFAULT_BET;
        this.winAmount = 0;
        
        this.soundManager = new SoundManager();
        this.paylineManager = new PaylineManager();
    }

    async init() {
        await this.createBackground();
        await this.createReels();
        await this.createUI();
        await this.soundManager.init();
        
        console.log('Игра инициализирована');
    }

    async createBackground() {
        // Создаем анимированный звездный фон
        this.createStarField();
        
        // Создаем главный фон для игрового поля с градиентом
        const bg = new Graphics();
        
        // Радиальный градиент для фона
        const steps = 25;
        const centerX = 400;
        const centerY = 250;
        const maxRadius = 400;
        
        for (let i = steps; i >= 0; i--) {
            const radius = (i / steps) * maxRadius;
            const t = i / steps;
            
            // Градиент от темно-фиолетового к черному
            const color1 = 0x2c1810;
            const color2 = 0x0f0f23;
            
            const lerpColor = this.lerpColor(color1, color2, t);
            
            bg.beginFill(lerpColor, 0.9);
            bg.drawCircle(centerX, centerY, radius);
            bg.endFill();
        }
        
        // Обрезаем по форме игрового поля
        const mask = new Graphics();
        mask.beginFill(0xffffff);
        mask.drawRoundedRect(50, 50, 700, 400, 15);
        mask.endFill();
        
        bg.mask = mask;
        this.container.addChild(mask);
        this.container.addChild(bg);
        
        // Создаем светящуюся многослойную рамку
        this.createGlowingBorder();
        
        // Добавляем декоративные элементы
        this.createDecorations();
    }

    createStarField() {
        this.stars = [];
        const starCount = 50;
        
        for (let i = 0; i < starCount; i++) {
            const star = new Graphics();
            const brightness = Math.random();
            const size = 1 + brightness * 2;
            
            // Создаем звезду вручную
            star.beginFill(0xffffff, brightness);
            this.drawStar(star, 0, 0, 4, size, size * 0.5);
            star.endFill();
            
            star.x = Math.random() * 1200;
            star.y = Math.random() * 800;
            star.twinkleSpeed = 0.02 + Math.random() * 0.03;
            star.twinkleTimer = Math.random() * Math.PI * 2;
            
            this.stars.push(star);
            this.container.addChild(star);
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

    createGlowingBorder() {
        const border = new Graphics();
        
        // Внешнее свечение
        border.lineStyle(8, 0x4169e1, 0.3);
        border.drawRoundedRect(46, 46, 708, 408, 18);
        
        // Основная рамка
        border.lineStyle(4, 0x00bfff, 0.8);
        border.drawRoundedRect(48, 48, 704, 404, 16);
        
        // Внутренняя рамка
        border.lineStyle(2, 0xffffff, 0.9);
        border.drawRoundedRect(50, 50, 700, 400, 15);
        
        this.container.addChild(border);
    }

    createDecorations() {
        // Добавляем угловые украшения
        const corners = [
            { x: 70, y: 70, rotation: 0 },
            { x: 730, y: 70, rotation: Math.PI / 2 },
            { x: 730, y: 430, rotation: Math.PI },
            { x: 70, y: 430, rotation: -Math.PI / 2 }
        ];
        
        corners.forEach(corner => {
            const decoration = new Graphics();
            decoration.beginFill(0xffd700, 0.8);
            decoration.moveTo(0, 0);
            decoration.lineTo(20, 0);
            decoration.lineTo(15, 5);
            decoration.lineTo(25, 10);
            decoration.lineTo(10, 10);
            decoration.lineTo(5, 15);
            decoration.lineTo(0, 5);
            decoration.closePath();
            decoration.endFill();
            
            decoration.x = corner.x;
            decoration.y = corner.y;
            decoration.rotation = corner.rotation;
            
            this.container.addChild(decoration);
        });
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

    async createReels() {
        const startX = 70;
        const startY = 70;
        
        for (let i = 0; i < GAME_CONFIG.REELS_COUNT; i++) {
            const reel = new Reel(i);
            reel.x = startX + i * (GAME_CONFIG.SYMBOL_SIZE + GAME_CONFIG.REEL_SPACING);
            reel.y = startY;
            
            await reel.init();
            this.reels.push(reel);
            this.container.addChild(reel);
        }
    }

    async createUI() {
        this.ui = new GameUI(this);
        this.ui.x = 800;
        this.ui.y = 50;
        
        await this.ui.init();
        this.container.addChild(this.ui);
    }

    async spin() {
        if (this.isSpinning || this.balance < this.currentBet) {
            return;
        }

        this.isSpinning = true;
        this.balance -= this.currentBet;
        this.winAmount = 0;
        
        this.ui.updateBalance(this.balance);
        this.ui.updateWin(this.winAmount);
        
        // Звук вращения
        this.soundManager.play('SPIN');
        
        // Запускаем вращение барабанов с задержкой
        const spinPromises = this.reels.map((reel, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    reel.spin().then(() => {
                        // Звук остановки каждого барабана
                        this.soundManager.play('REEL_STOP');
                        resolve();
                    });
                }, index * GAME_CONFIG.REEL_DELAY);
            });
        });

        await Promise.all(spinPromises);
        
        // Проверяем выигрышные комбинации
        this.checkWins();
        
        this.isSpinning = false;
    }

    checkWins() {
        const reelResults = this.reels.map(reel => reel.getVisibleSymbols());
        const wins = this.paylineManager.checkPaylines(reelResults, this.currentBet);
        
        if (wins.length > 0) {
            this.winAmount = wins.reduce((total, win) => total + win.amount, 0);
            this.balance += this.winAmount;
            
            this.ui.updateBalance(this.balance);
            this.ui.updateWin(this.winAmount);
            
            // Показываем выигрышные линии и подсвечиваем символы
            this.showWinningLines(wins);
            this.highlightWinningSymbols(wins);
            
            // Создаем эффект конфетти для больших выигрышей
            if (this.winAmount > this.currentBet * 10) {
                this.createConfetti();
            }
            
            this.soundManager.play('WIN');
            
            // Звук большого выигрыша
            if (this.winAmount > this.currentBet * 20) {
                setTimeout(() => {
                    this.soundManager.playBigWin();
                }, 500);
            }
        }
    }

    highlightWinningSymbols(wins) {
        wins.forEach(win => {
            win.positions.forEach(pos => {
                const reel = this.reels[pos.reel];
                const symbols = reel.symbols.filter(symbol => 
                    symbol.y >= pos.row * GAME_CONFIG.SYMBOL_SIZE - 10 &&
                    symbol.y <= pos.row * GAME_CONFIG.SYMBOL_SIZE + 10
                );
                
                if (symbols.length > 0) {
                    symbols[0].highlight();
                }
            });
        });
    }

    createConfetti() {
        const confettiCount = 30;
        const confettiColors = [0xff0080, 0x00ff80, 0x8000ff, 0xffff00, 0xff8000];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = new Graphics();
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            
            confetti.beginFill(color);
            confetti.drawRect(0, 0, 8, 8);
            confetti.endFill();
            
            confetti.x = 400 + (Math.random() - 0.5) * 200;
            confetti.y = 100;
            confetti.vx = (Math.random() - 0.5) * 10;
            confetti.vy = Math.random() * 5 + 2;
            confetti.gravity = 0.3;
            confetti.rotation = Math.random() * Math.PI * 2;
            confetti.rotationSpeed = (Math.random() - 0.5) * 0.3;
            
            this.container.addChild(confetti);
            
            // Анимация конфетти
            const animateConfetti = () => {
                confetti.x += confetti.vx;
                confetti.y += confetti.vy;
                confetti.vy += confetti.gravity;
                confetti.rotation += confetti.rotationSpeed;
                
                // Удаляем когда упало
                if (confetti.y > 600) {
                    this.container.removeChild(confetti);
                }
            };
            
            const confettiInterval = setInterval(() => {
                animateConfetti();
                
                if (confetti.y > 600) {
                    clearInterval(confettiInterval);
                }
            }, 50);
        }
    }

    showWinningLines(wins) {
        // Анимация выигрышных линий
        wins.forEach((win, index) => {
            setTimeout(() => {
                this.highlightPayline(win.paylineIndex);
            }, index * 500);
        });
    }

    highlightPayline(paylineIndex) {
        const payline = GAME_CONFIG.PAYLINES[paylineIndex];
        const graphics = new Graphics();
        
        graphics.lineStyle(4, GAME_CONFIG.COLORS.SECONDARY);
        
        for (let i = 0; i < payline.length - 1; i++) {
            const x1 = 70 + i * (GAME_CONFIG.SYMBOL_SIZE + GAME_CONFIG.REEL_SPACING) + GAME_CONFIG.SYMBOL_SIZE / 2;
            const y1 = 70 + payline[i] * GAME_CONFIG.SYMBOL_SIZE + GAME_CONFIG.SYMBOL_SIZE / 2;
            const x2 = 70 + (i + 1) * (GAME_CONFIG.SYMBOL_SIZE + GAME_CONFIG.REEL_SPACING) + GAME_CONFIG.SYMBOL_SIZE / 2;
            const y2 = 70 + payline[i + 1] * GAME_CONFIG.SYMBOL_SIZE + GAME_CONFIG.SYMBOL_SIZE / 2;
            
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
        }
        
        this.container.addChild(graphics);
        
        // Удаляем линию через 2 секунды
        setTimeout(() => {
            this.container.removeChild(graphics);
        }, 2000);
    }

    increaseBet() {
        if (this.currentBet < GAME_CONFIG.MAX_BET) {
            this.currentBet += 1;
            this.ui.updateBet(this.currentBet);
        }
    }

    decreaseBet() {
        if (this.currentBet > GAME_CONFIG.MIN_BET) {
            this.currentBet -= 1;
            this.ui.updateBet(this.currentBet);
        }
    }

    update() {
        // Обновление анимаций
        this.reels.forEach(reel => reel.update());
        
        // Анимация звезд
        if (this.stars) {
            this.stars.forEach(star => {
                star.twinkleTimer += star.twinkleSpeed;
                star.alpha = 0.3 + Math.sin(star.twinkleTimer) * 0.4;
                
                // Медленное движение звезд
                star.x -= 0.1;
                if (star.x < -10) {
                    star.x = 1210;
                    star.y = Math.random() * 800;
                }
            });
        }
    }
}