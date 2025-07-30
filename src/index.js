import { Application } from 'pixi.js';
import { SlotGame } from './game/SlotGame.js';

class Game {
    constructor() {
        this.app = new Application({
            width: 1200,
            height: 800,
            backgroundColor: 0x1a1a2e,
            antialias: true
        });
        
        document.getElementById('gameContainer').appendChild(this.app.view);
        
        this.initGame();
    }

    async initGame() {
        try {
            this.slotGame = new SlotGame(this.app);
            await this.slotGame.init();
            this.startGameLoop();
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
        }
    }

    startGameLoop() {
        this.app.ticker.add(() => {
            this.slotGame.update();
        });
    }
}

// Запуск игры
new Game();