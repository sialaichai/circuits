class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = {};
        this.initializeLevels();
    }

    initializeLevels() {
        // Level 1: Remember - Simple maze with basic questions
        this.levels[1] = {
            name: "Ohm's Foundation",
            theme: "Basic Circuits",
            color: "#4CAF50",
            bloomLevel: 1,
            questionsRequired: 3,
            maze: this.createMaze(10, 10, 1),
            startPos: { x: 1, y: 1, z: 0 },
            exitPos: { x: 9, y: 9, z: 0 },
            questionPositions: [
                { x: 3, y: 3, z: 0, questionId: null },
                { x: 6, y: 4, z: 0, questionId: null },
                { x: 4, y: 7, z: 0, questionId: null }
            ],
            enemies: [
                { type: "resistor", x: 5, y: 5, z: 0, speed: 1 },
                { type: "capacitor", x: 7, y: 2, z: 0, speed: 0.8 }
            ],
            collectibles: [
                { type: "battery", x: 2, y: 8, z: 0, value: 100 },
                { type: "wire", x: 8, y: 1, z: 0, value: 50 }
            ]
        };

        // Level 2: Understand - More complex maze
        this.levels[2] = {
            name: "Current Understanding",
            theme: "Series & Parallel",
            color: "#2196F3",
            bloomLevel: 2,
            questionsRequired: 4,
            maze: this.createMaze(12, 12, 2),
            startPos: { x: 0, y: 6, z: 0 },
            exitPos: { x: 11, y: 6, z: 0 },
            questionPositions: [
                { x: 2, y: 2, z: 0, questionId: null },
                { x: 9, y: 2, z: 0, questionId: null },
                { x: 2, y: 9, z: 0, questionId: null },
                { x: 9, y: 9, z: 0, questionId: null }
            ],
            enemies: [
                { type: "resistor", x: 4, y: 4, z: 0, speed: 1.2 },
                { type: "capacitor", x: 7, y: 4, z: 0, speed: 1 },
                { type: "inductor", x: 5, y: 7, z: 0, speed: 0.9 }
            ],
            collectibles: [
                { type: "battery", x: 1, y: 1, z: 0, value: 100 },
                { type: "battery", x: 10, y: 10, z: 0, value: 100 },
                { type: "wire", x: 5, y: 5, z: 0, value: 50 },
                { type: "wire", x: 6, y: 6, z: 0, value: 50 }
            ]
        };

        // Level 3: Apply - Multi-level maze
        this.levels[3] = {
            name: "Formula Application",
            theme: "Circuit Calculations",
            color: "#FF9800",
            bloomLevel: 3,
            questionsRequired: 4,
            maze: this.createMaze(15, 15, 3),
            startPos: { x: 0, y: 0, z: 0 },
            exitPos: { x: 14, y: 14, z: 1 },
            questionPositions: [
                { x: 3, y: 7, z: 0, questionId: null },
                { x: 7, y: 3, z: 0, questionId: null },
                { x: 11, y: 7, z: 0, questionId: null },
                { x: 7, y: 11, z: 1, questionId: null }
            ],
            enemies: [
                { type: "resistor", x: 2, y: 2, z: 0, speed: 1.5 },
                { type: "capacitor", x: 12, y: 2, z: 0, speed: 1.3 },
                { type: "inductor", x: 2, y: 12, z: 0, speed: 1.2 },
                { type: "transistor", x: 12, y: 12, z: 0, speed: 1 }
            ],
            collectibles: [
                { type: "battery", x: 7, y: 7, z: 0, value: 200 },
                { type: "multimeter", x: 4, y: 10, z: 0, value: 150 },
                { type: "oscilloscope", x: 10, y: 4, z: 0, value: 150 }
            ]
        };

        // Level 4: Analyze - Complex 3D maze
        this.levels[4] = {
            name: "Circuit Analysis",
            theme: "Complex Networks",
            color: "#9C27B0",
            bloomLevel: 4,
            questionsRequired: 5,
            maze: this.createMaze(18, 18, 4),
            startPos: { x: 0, y: 9, z: 0 },
            exitPos: { x: 17, y: 9, z: 2 },
            questionPositions: [
                { x: 4, y: 4, z: 0, questionId: null },
                { x: 13, y: 4, z: 0, questionId: null },
                { x: 4, y: 13, z: 1, questionId: null },
                { x: 13, y: 13, z: 1, questionId: null },
                { x: 8, y: 8, z: 2, questionId: null }
            ],
            enemies: [
                { type: "resistor", x: 3, y: 3, z: 0, speed: 1.8, pattern: "circle" },
                { type: "capacitor", x: 14, y: 3, z: 0, speed: 1.6, pattern: "patrol" },
                { type: "inductor", x: 3, y: 14, z: 1, speed: 1.4, pattern: "circle" },
                { type: "transistor", x: 14, y: 14, z: 1, speed: 1.2, pattern: "patrol" },
                { type: "ic", x: 8, y: 8, z: 0, speed: 2, pattern: "chase" }
            ],
            collectibles: [
                { type: "battery", x: 1, y: 1, z: 0, value: 250 },
                { type: "battery", x: 16, y: 1, z: 0, value: 250 },
                { type: "battery", x: 1, y: 16, z: 1, value: 250 },
                { type: "battery", x: 16, y: 16, z: 1, value: 250 },
                { type: "gold_wire", x: 8, y: 8, z: 2, value: 500 }
            ]
        };

        // Level 5: Create - Final challenge
        this.levels[5] = {
            name: "Circuit Creation",
            theme: "Design Challenges",
            color: "#F44336",
            bloomLevel: 5,
            questionsRequired: 5,
            maze: this.createMaze(20, 20, 5),
            startPos: { x: 0, y: 10, z: 0 },
            exitPos: { x: 19, y: 10, z: 3 },
            questionPositions: [
                { x: 5, y: 5, z: 0, questionId: null },
                { x: 14, y: 5, z: 1, questionId: null },
                { x: 5, y: 14, z: 1, questionId: null },
                { x: 14, y: 14, z: 2, questionId: null },
                { x: 9, y: 9, z: 3, questionId: null }
            ],
            enemies: [
                { type: "resistor", x: 2, y: 2, z: 0, speed: 2, pattern: "aggressive" },
                { type: "capacitor", x: 17, y: 2, z: 0, speed: 1.8, pattern: "aggressive" },
                { type: "inductor", x: 2, y: 17, z: 2, speed: 1.6, pattern: "aggressive" },
                { type: "transistor", x: 17, y: 17, z: 2, speed: 1.4, pattern: "aggressive" },
                { type: "ic", x: 9, y: 2, z: 1, speed: 2.2, pattern: "chase" },
                { type: "ic", x: 9, y: 17, z: 1, speed: 2.2, pattern: "chase" }
            ],
            collectibles: [
                { type: "battery", x: 10, y: 1, z: 0, value: 300 },
                { type: "battery", x: 1, y: 10, z: 1, value: 300 },
                { type: "battery", x: 18, y: 10, z: 1, value: 300 },
                { type: "battery", x: 10, y: 18, z: 2, value: 300 },
                { type: "diamond_chip", x: 10, y: 10, z: 3, value: 1000 }
            ]
        };
    }

    createMaze(width, height, level) {
        // Create a simple maze algorithm
        const maze = [];
        for (let x = 0; x < width; x++) {
            maze[x] = [];
            for (let y = 0; y < height; y++) {
                // Create walls around edges
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    maze[x][y] = { type: 'wall', height: 2 };
                } else {
                    // Random walls based on level difficulty
                    const wallChance = 0.3 + (level * 0.05);
                    maze[x][y] = {
                        type: Math.random() < wallChance ? 'wall' : 'path',
                        height: Math.random() < 0.1 ? 1 : 0 // Some raised platforms
                    };
                }
            }
        }
        
        // Ensure path from start to exit
        this.carvePath(maze, this.levels[level].startPos, this.levels[level].exitPos);
        
        return maze;
    }

    carvePath(maze, start, end) {
        // Simple path carving algorithm
        let x = start.x;
        let y = start.y;
        
        while (x !== end.x || y !== end.y) {
            maze[x][y].type = 'path';
            
            if (x < end.x) x++;
            else if (x > end.x) x--;
            
            if (y < end.y) y++;
            else if (y > end.y) y--;
            
            maze[x][y].type = 'path';
        }
        
        // Carve some extra paths for variety
        for (let i = 0; i < 20; i++) {
            const randX = Math.floor(Math.random() * maze.length);
            const randY = Math.floor(Math.random() * maze[0].length);
            if (maze[randX][randY].type === 'wall') {
                maze[randX][randY].type = 'path';
            }
        }
    }

    getCurrentLevel() {
        return this.levels[this.currentLevel];
    }

    nextLevel() {
        if (this.currentLevel < 5) {
            this.currentLevel++;
            return true;
        }
        return false;
    }

    setLevel(level) {
        if (level >= 1 && level <= 5) {
            this.currentLevel = level;
        }
    }

    getLevelCompletion() {
        const saved = localStorage.getItem('circuitRunnerProgress');
        return saved ? JSON.parse(saved) : { level: 1, scores: {} };
    }

    saveProgress(score, questionsSolved) {
        const progress = this.getLevelCompletion();
        progress.level = Math.max(progress.level, this.currentLevel + 1);
        progress.scores[this.currentLevel] = {
            score: score,
            questions: questionsSolved,
            time: Date.now()
        };
        localStorage.setItem('circuitRunnerProgress', JSON.stringify(progress));
    }
}
