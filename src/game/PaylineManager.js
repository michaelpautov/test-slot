import { GAME_CONFIG } from '../config/gameConfig.js';

export class PaylineManager {
    constructor() {
        this.paylines = GAME_CONFIG.PAYLINES;
    }

    checkPaylines(reelResults, bet) {
        const wins = [];
        
        this.paylines.forEach((payline, index) => {
            const win = this.checkPayline(payline, reelResults, bet, index);
            if (win) {
                wins.push(win);
            }
        });
        
        return wins;
    }

    checkPayline(payline, reelResults, bet, paylineIndex) {
        const symbols = [];
        
        // Получаем символы по линии выплат
        for (let i = 0; i < payline.length; i++) {
            const row = payline[i];
            const symbol = reelResults[i][row];
            symbols.push(symbol);
        }
        
        return this.calculateWin(symbols, bet, paylineIndex);
    }

    calculateWin(symbols, bet, paylineIndex) {
        // Проверяем выигрышные комбинации
        const firstSymbol = symbols[0];
        let matchCount = 1;
        let winSymbol = firstSymbol;
        
        // Подсчитываем одинаковые символы подряд
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === firstSymbol || symbols[i] === 'wild' || firstSymbol === 'wild') {
                matchCount++;
                if (firstSymbol === 'wild' && symbols[i] !== 'wild') {
                    winSymbol = symbols[i];
                }
            } else {
                break;
            }
        }
        
        // Минимум 3 символа для выигрыша
        if (matchCount >= 3) {
            const symbolData = GAME_CONFIG.SYMBOLS[winSymbol];
            const baseAmount = symbolData ? symbolData.value : 0;
            
            // Множители за количество символов
            const multipliers = {
                3: 1,
                4: 5,
                5: 25
            };
            
            const multiplier = multipliers[matchCount] || 1;
            const amount = baseAmount * multiplier * bet;
            
            return {
                paylineIndex,
                symbol: winSymbol,
                count: matchCount,
                amount,
                positions: this.getWinPositions(paylineIndex, matchCount)
            };
        }
        
        return null;
    }

    getWinPositions(paylineIndex, count) {
        const payline = this.paylines[paylineIndex];
        const positions = [];
        
        for (let i = 0; i < count; i++) {
            positions.push({
                reel: i,
                row: payline[i]
            });
        }
        
        return positions;
    }

    // Проверка специальных символов
    checkScatters(reelResults, bet) {
        let scatterCount = 0;
        const scatterPositions = [];
        
        reelResults.forEach((reel, reelIndex) => {
            reel.forEach((symbol, rowIndex) => {
                if (symbol === 'scatter') {
                    scatterCount++;
                    scatterPositions.push({ reel: reelIndex, row: rowIndex });
                }
            });
        });
        
        // 3 или больше скаттеров дают выигрыш
        if (scatterCount >= 3) {
            const scatterData = GAME_CONFIG.SYMBOLS.scatter;
            const multipliers = {
                3: 2,
                4: 10,
                5: 50
            };
            
            const multiplier = multipliers[scatterCount] || 1;
            const amount = scatterData.value * multiplier * bet;
            
            return {
                type: 'scatter',
                count: scatterCount,
                amount,
                positions: scatterPositions,
                triggersBonus: scatterCount >= 3 // Можно добавить бонусный раунд
            };
        }
        
        return null;
    }

    // Расчет общего выигрыша
    calculateTotalWin(wins, scatterWin) {
        let total = wins.reduce((sum, win) => sum + win.amount, 0);
        
        if (scatterWin) {
            total += scatterWin.amount;
        }
        
        return total;
    }
}