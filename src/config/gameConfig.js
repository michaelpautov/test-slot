export const GAME_CONFIG = {
    // Размеры игрового поля
    REELS_COUNT: 5,
    ROWS_COUNT: 3,
    SYMBOL_SIZE: 120,
    REEL_SPACING: 10,
    
    // Символы и их значения
    SYMBOLS: {
        CHERRY: { id: 'cherry', value: 10, frequency: 25 },
        LEMON: { id: 'lemon', value: 15, frequency: 20 },
        ORANGE: { id: 'orange', value: 20, frequency: 18 },
        PLUM: { id: 'plum', value: 25, frequency: 15 },
        BELL: { id: 'bell', value: 50, frequency: 12 },
        BAR: { id: 'bar', value: 100, frequency: 8 },
        SEVEN: { id: 'seven', value: 200, frequency: 5 },
        WILD: { id: 'wild', value: 500, frequency: 3 },
        SCATTER: { id: 'scatter', value: 1000, frequency: 2 }
    },
    
    // Линии выплат (25 линий для 5x3 поля)
    PAYLINES: [
        [1,1,1,1,1], // средняя горизонтальная
        [0,0,0,0,0], // верхняя горизонтальная
        [2,2,2,2,2], // нижняя горизонтальная
        [0,1,2,1,0], // V-образная
        [2,1,0,1,2], // ^-образная
        [1,0,0,0,1], // диагональ вверх
        [1,2,2,2,1], // диагональ вниз
        [0,0,1,2,2], // зигзаг
        [2,2,1,0,0], // зигзаг обратный
        [1,1,0,1,1], // W-образная
        [1,1,2,1,1], // M-образная
        [0,1,1,1,0], // домик
        [2,1,1,1,2], // обратный домик
        [0,0,1,0,0], // пик вверх
        [2,2,1,2,2], // пик вниз
        [1,0,1,0,1], // зигзаг малый
        [1,2,1,2,1], // зигзаг малый обратный
        [0,1,0,1,0], // зубья вверх
        [2,1,2,1,2], // зубья вниз
        [0,2,0,2,0], // большие зубья
        [2,0,2,0,2], // большие зубья обратные
        [1,0,2,0,1], // X-образная
        [1,2,0,2,1], // X-образная обратная
        [0,1,2,0,1], // неправильный зигзаг
        [2,1,0,2,1]  // неправильный зигзаг обратный
    ],
    
    // Анимация
    SPIN_DURATION: 2000,
    REEL_DELAY: 200,
    SYMBOL_FALL_SPEED: 20,
    
    // Ставки
    MIN_BET: 1,
    MAX_BET: 100,
    DEFAULT_BET: 10,
    
    // Звуки
    SOUNDS: {
        SPIN: 'spin.mp3',
        WIN: 'win.mp3',
        REEL_STOP: 'reel_stop.mp3',
        BUTTON_CLICK: 'button_click.mp3'
    },
    
    // UI
    COLORS: {
        PRIMARY: 0x4a90e2,
        SECONDARY: 0x7ed321,
        DANGER: 0xd0021b,
        WARNING: 0xf5a623,
        BACKGROUND: 0x1a1a2e,
        TEXT: 0xffffff
    }
};