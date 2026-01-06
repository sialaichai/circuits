// Audio Manager
class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isMuted = false;
        
        this.init();
    }
    
    init() {
        // Background music
        this.sounds.bgm = new Howl({
            src: ['assets/sounds/bgm.mp3'],
            loop: true,
            volume: this.musicVolume
        });
        
        // Sound effects
        this.sounds.jump = new Howl({ src: ['assets/sounds/jump.wav'], volume: this.sfxVolume });
        this.sounds.collect = new Howl({ src: ['assets/sounds/collect.wav'], volume: this.sfxVolume });
        this.sounds.question = new Howl({ src: ['assets/sounds/question.wav'], volume: this.sfxVolume });
        this.sounds.correct = new Howl({ src: ['assets/sounds/correct.wav'], volume: this.sfxVolume });
        this.sounds.wrong = new Howl({ src: ['assets/sounds/wrong.wav'], volume: this.sfxVolume });
        this.sounds.levelComplete = new Howl({ src: ['assets/sounds/level_complete.wav'], volume: this.sfxVolume });
    }
    
    play(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;
        this.sounds[soundName].play();
    }
    
    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].stop();
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.sounds.bgm) {
            this.sounds.bgm.volume(volume);
        }
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = volume;
        Object.values(this.sounds).forEach(sound => {
            if (sound !== this.sounds.bgm) {
                sound.volume(volume);
            }
        });
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        Howler.mute(this.isMuted);
    }
}

// Initialize audio manager
window.audioManager = new AudioManager();

// Utility functions
function getBloomColor(level) {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[level - 1] || colors[0];
}

function getBloomName(level) {
    const names = ['Remember', 'Understand', 'Apply', 'Analyze', 'Create'];
    return names[level - 1] || names[0];
}

// Prevent context menu on right-click in game
document.addEventListener('contextmenu', (e) => {
    if (document.getElementById('gameContainer').contains(e.target)) {
        e.preventDefault();
    }
});

// Fullscreen toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Add keyboard shortcut for fullscreen (F11)
document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Performance monitoring
if (typeof window.performance !== 'undefined') {
    const perfMonitor = {
        fps: 0,
        frameCount: 0,
        lastTime: performance.now(),
        
        update: function() {
            this.frameCount++;
            const currentTime = performance.now();
            if (currentTime >= this.lastTime + 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                // Optional: Display FPS in console
                if (window.debugMode) {
                    console.log(`FPS: ${this.fps}`);
                }
            }
        }
    };
    
    // Integrate with game loop
    const originalAnimate = window.game?.animate;
    if (originalAnimate) {
        window.game.animate = function() {
            perfMonitor.update();
            originalAnimate.call(this);
        };
    }
}

// Export for debugging
window.utils = {
    getBloomColor,
    getBloomName,
    toggleFullscreen
};
