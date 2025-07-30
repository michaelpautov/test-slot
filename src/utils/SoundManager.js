import { GAME_CONFIG } from '../config/gameConfig.js';

export class SoundManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.soundsEnabled = true;
    }

    async init() {
        // Инициализируем Web Audio API
        if (typeof AudioContext !== 'undefined') {
            this.audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            this.audioContext = new webkitAudioContext();
        }
        
        // Создаем синтетические звуки
        this.createSyntheticSounds();
    }

    createSyntheticSounds() {
        // Создаем простые синтетические звуки без загрузки файлов
        this.sounds = {
            'SPIN': this.createSpinSound.bind(this),
            'WIN': this.createWinSound.bind(this),
            'REEL_STOP': this.createReelStopSound.bind(this),
            'BUTTON_CLICK': this.createButtonClickSound.bind(this)
        };
    }

    createSpinSound() {
        if (!this.audioContext || !this.soundsEnabled) return;

        // Создаем более реалистичный звук вращения с несколькими компонентами
        this.createMechanicalSpinSound();
    }

    createMechanicalSpinSound() {
        const duration = 3.0; // Длительность звука
        
        // Основной звук вращения (высокочастотный компонент)
        this.createSpinComponent('square', 200, 150, 0.15, duration);
        
        // Средний компонент (механический шум)
        this.createSpinComponent('sawtooth', 120, 80, 0.1, duration);
        
        // Низкочастотный гул
        this.createSpinComponent('triangle', 60, 40, 0.08, duration);
        
        // Добавляем ритмичные клики (имитация зубчиков)
        this.createSpinClicks(duration);
    }

    createSpinComponent(type, startFreq, endFreq, volume, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Настройка фильтра для более мягкого звука
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration * 0.7);
        
        // Плавное нарастание и затухание
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(this.masterVolume * volume, this.audioContext.currentTime + duration * 0.8);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createSpinClicks(duration) {
        // Создаем ритмичные клики для имитации механизма
        const clickInterval = 0.08; // Интервал между кликами
        const clickCount = Math.floor(duration / clickInterval);
        
        for (let i = 0; i < clickCount; i++) {
            const time = this.audioContext.currentTime + (i * clickInterval);
            this.createSingleClick(time, i, clickCount);
        }
    }

    createSingleClick(time, index, totalClicks) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Случайная частота для каждого клика
        const frequency = 800 + Math.random() * 400;
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, time);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, time + 0.02);
        
        // Убывающая громкость по мере замедления
        const volumeFactor = 1 - (index / totalClicks) * 0.5;
        const clickVolume = this.masterVolume * 0.05 * volumeFactor;
        
        gainNode.gain.setValueAtTime(clickVolume, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.02);
        
        oscillator.start(time);
        oscillator.stop(time + 0.02);
    }

    createWinSound() {
        if (!this.audioContext || !this.soundsEnabled) return;

        // Последовательность нот для мелодии выигрыша
        const notes = [262, 330, 392, 523]; // C, E, G, C
        let time = this.audioContext.currentTime;
        
        notes.forEach((frequency, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(frequency, time);
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, time + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            oscillator.start(time);
            oscillator.stop(time + 0.3);
            
            time += 0.2;
        });
    }

    createReelStopSound() {
        if (!this.audioContext || !this.soundsEnabled) return;

        // Звук остановки барабана - более реалистичный
        this.createStopThud();
        this.createStopClick();
    }

    createStopThud() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Фильтр для глухого звука
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    createStopClick() {
        // Добавляем четкий клик фиксации
        setTimeout(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.03);
            
            gainNode.gain.setValueAtTime(this.masterVolume * 0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.03);
        }, 50);
    }

    createButtonClickSound() {
        if (!this.audioContext || !this.soundsEnabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Короткий клик
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    play(soundName) {
        if (this.sounds[soundName] && this.soundsEnabled) {
            try {
                // Возобновляем AudioContext если он приостановлен
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                this.sounds[soundName]();
            } catch (error) {
                console.warn('Ошибка воспроизведения звука:', error);
            }
        }
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggleSounds() {
        this.soundsEnabled = !this.soundsEnabled;
        return this.soundsEnabled;
    }

    // Создание более сложных звуковых эффектов
    createChordSound(frequencies, duration = 0.5) {
        if (!this.audioContext || !this.soundsEnabled) return;

        frequencies.forEach(frequency => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        });
    }

    // Звук большого выигрыша
    playBigWin() {
        // Играем аккорд
        this.createChordSound([262, 330, 392, 523], 1.5);
        
        // Добавляем арпеджио
        setTimeout(() => {
            const notes = [523, 659, 784, 1047]; // C, E, G, C октавой выше
            let time = this.audioContext.currentTime;
            
            notes.forEach((frequency, index) => {
                setTimeout(() => {
                    this.createChordSound([frequency], 0.3);
                }, index * 100);
            });
        }, 200);
    }
}