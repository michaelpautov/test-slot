import { Container, Graphics } from 'pixi.js';
import { Symbol } from './Symbol.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class Reel extends Container {
    constructor(index) {
        super();
        this.index = index;
        this.symbols = [];
        this.symbolPool = [];
        this.isSpinning = false;
        this.spinSpeed = 0;
        this.targetSpeed = 20;
        this.spinDuration = GAME_CONFIG.SPIN_DURATION + (index * GAME_CONFIG.REEL_DELAY);
        this.spinTimer = 0;
        
        this.createSymbolPool();
    }

    async init() {
        this.createMask();
        this.createInitialSymbols();
    }

    createMask() {
        // Создаем маску для барабана
        const mask = new Graphics();
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, GAME_CONFIG.SYMBOL_SIZE, GAME_CONFIG.SYMBOL_SIZE * GAME_CONFIG.ROWS_COUNT);
        mask.endFill();
        
        this.addChild(mask);
        this.mask = mask;
    }

    createSymbolPool() {
        const symbols = Object.keys(GAME_CONFIG.SYMBOLS);
        this.symbolPool = [];
        
        // Создаем пул символов с учетом частоты
        symbols.forEach(symbolId => {
            const symbolData = GAME_CONFIG.SYMBOLS[symbolId];
            for (let i = 0; i < symbolData.frequency; i++) {
                this.symbolPool.push(symbolId);
            }
        });
    }

    createInitialSymbols() {
        // Создаем начальные символы (видимые + дополнительные для прокрутки)
        const totalSymbols = GAME_CONFIG.ROWS_COUNT + 5; // 5 дополнительных для плавной прокрутки
        
        for (let i = 0; i < totalSymbols; i++) {
            const symbolId = this.getRandomSymbol();
            const symbol = new Symbol(symbolId);
            symbol.y = i * GAME_CONFIG.SYMBOL_SIZE - (2 * GAME_CONFIG.SYMBOL_SIZE); // Начинаем выше видимой области
            
            this.symbols.push(symbol);
            this.addChild(symbol);
        }
    }

    getRandomSymbol() {
        const randomIndex = Math.floor(Math.random() * this.symbolPool.length);
        return this.symbolPool[randomIndex];
    }

    async spin() {
        return new Promise(resolve => {
            this.isSpinning = true;
            this.spinSpeed = this.targetSpeed;
            this.spinTimer = 0;
            
            // Добавляем новые символы для плавной прокрутки
            this.generateNewSymbols();
            
            const spinInterval = setInterval(() => {
                this.spinTimer += 16; // Примерно 60 FPS
                
                if (this.spinTimer >= this.spinDuration) {
                    this.stopSpin();
                    clearInterval(spinInterval);
                    resolve();
                }
            }, 16);
        });
    }

    generateNewSymbols() {
        // Генерируем новую последовательность символов
        const newSymbols = [];
        for (let i = 0; i < 10; i++) { // Генерируем больше символов для длинной прокрутки
            newSymbols.push(this.getRandomSymbol());
        }
        
        // Добавляем новые символы в начало массива
        for (let i = 0; i < newSymbols.length; i++) {
            const symbolId = newSymbols[i];
            const symbol = new Symbol(symbolId);
            symbol.y = this.symbols[0].y - GAME_CONFIG.SYMBOL_SIZE;
            
            this.symbols.unshift(symbol);
            this.addChild(symbol);
        }
    }

    stopSpin() {
        this.isSpinning = false;
        this.spinSpeed = 0;
        
        // Выравниваем символы по сетке
        this.alignSymbols();
        
        // Убираем лишние символы
        this.cleanupSymbols();
    }

    alignSymbols() {
        // Находим ближайшую позицию для выравнивания
        const firstVisibleSymbol = this.symbols.find(symbol => symbol.y >= -GAME_CONFIG.SYMBOL_SIZE);
        if (firstVisibleSymbol) {
            const offset = firstVisibleSymbol.y % GAME_CONFIG.SYMBOL_SIZE;
            
            // Сдвигаем все символы для выравнивания
            this.symbols.forEach(symbol => {
                symbol.y -= offset;
            });
        }
    }

    cleanupSymbols() {
        // Удаляем символы, которые слишком далеко от видимой области
        const symbolsToRemove = [];
        
        this.symbols.forEach(symbol => {
            if (symbol.y > GAME_CONFIG.SYMBOL_SIZE * (GAME_CONFIG.ROWS_COUNT + 2) || 
                symbol.y < -GAME_CONFIG.SYMBOL_SIZE * 3) {
                symbolsToRemove.push(symbol);
            }
        });
        
        symbolsToRemove.forEach(symbol => {
            const index = this.symbols.indexOf(symbol);
            if (index > -1) {
                this.symbols.splice(index, 1);
                this.removeChild(symbol);
            }
        });
    }

    update() {
        if (this.isSpinning) {
            // Двигаем все символы вниз
            this.symbols.forEach(symbol => {
                symbol.y += this.spinSpeed;
            });
            
            // Удаляем символы, которые ушли слишком далеко вниз
            const symbolsToRemove = this.symbols.filter(symbol => 
                symbol.y > GAME_CONFIG.SYMBOL_SIZE * (GAME_CONFIG.ROWS_COUNT + 3)
            );
            
            symbolsToRemove.forEach(symbol => {
                const index = this.symbols.indexOf(symbol);
                if (index > -1) {
                    this.symbols.splice(index, 1);
                    this.removeChild(symbol);
                }
            });
            
            // Добавляем новые символы сверху при необходимости
            const topSymbol = this.symbols[0];
            if (!topSymbol || topSymbol.y > -GAME_CONFIG.SYMBOL_SIZE * 2) {
                const symbolId = this.getRandomSymbol();
                const symbol = new Symbol(symbolId);
                symbol.y = (topSymbol ? topSymbol.y : 0) - GAME_CONFIG.SYMBOL_SIZE;
                
                this.symbols.unshift(symbol);
                this.addChild(symbol);
            }
        }
    }

    getVisibleSymbols() {
        // Возвращаем символы в видимой области (3 символа)
        const visibleSymbols = [];
        
        for (let row = 0; row < GAME_CONFIG.ROWS_COUNT; row++) {
            const targetY = row * GAME_CONFIG.SYMBOL_SIZE;
            let closestSymbol = null;
            let minDistance = Infinity;
            
            this.symbols.forEach(symbol => {
                const distance = Math.abs(symbol.y - targetY);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSymbol = symbol;
                }
            });
            
            if (closestSymbol) {
                visibleSymbols.push(closestSymbol.symbolId);
            }
        }
        
        return visibleSymbols;
    }
}