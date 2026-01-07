class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.player = null;
        this.levelManager = null;
        this.questionManager = null;
        this.ui = null;
        
        this.isPaused = false;
        this.isGameActive = false;
        this.score = 0;
        this.questionsSolved = 0;
        this.startTime = 0;
        this.currentLevel = 1;
        this.clock = new THREE.Clock();
        this.mixers = [];

        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('THREE is not defined!');
            this.showLoadError('Three.js failed to load.');
            return;
        }
        
        // Check if Cannon.js is loaded
        if (typeof CANNON === 'undefined') {
            console.error('CANNON is not defined!');
            this.showLoadError('Physics engine failed to load.');
            return;
        }
        
        this.init();
        
        // Debug info
        setTimeout(() => {
            console.log('=== GAME DEBUG INFO ===');
            console.log('Scene objects:', this.scene.children.length);
            console.log('Player exists:', !!this.player);
            console.log('Camera position:', this.camera.position);
        }, 2000);
    }

    showLoadError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9); color: white; padding: 30px;
            border-radius: 10px; z-index: 10000; text-align: center;
        `;
        errorDiv.innerHTML = `<h2>⚠️ Loading Error</h2><p>${message}</p><button onclick="window.location.reload()">Refresh Page</button>`;
        document.body.appendChild(errorDiv);
    }

    init() {
        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a2a);
        this.scene.fog = new THREE.Fog(0x0a0a2a, 10, 50);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.autoClear = true;

        this.precompileShaders();
        
        // Setup physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -20, 0); // Increased gravity for snappier jumping
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        
        // Initialize managers
        this.levelManager = new LevelManager();
        this.questionManager = new QuestionManager();
        this.ui = new UIManager(this);
        
        // Setup lighting
        this.setupLighting();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.animate();
    }

    precompileShaders() {
        const dummyScene = new THREE.Scene();
        const dummyCamera = new THREE.PerspectiveCamera();
        const dummyMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
        dummyScene.add(dummyMesh);
        this.renderer.render(dummyScene, dummyCamera);
        dummyMesh.geometry.dispose();
        dummyMesh.material.dispose();
    }
    
    setupLighting() {
        console.log('💡 Setting up lighting...');
        
        // 1. Ambient Light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);
        
        // 2. Main Directional Light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(20, 30, 10);
        directionalLight.castShadow = true;
        
        // Shadow config
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        
        this.scene.add(directionalLight);
        
        // 3. Fill Lights
        const fillLight = new THREE.DirectionalLight(0xaaaaff, 0.3);
        fillLight.position.set(-20, 20, -10);
        this.scene.add(fillLight);
        
        const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 30);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // UI Buttons
        const bindBtn = (id, fn) => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('click', fn.bind(this));
        };
        
        bindBtn('startButton', () => this.startGame());
        bindBtn('continueButton', () => this.continueGame());
        bindBtn('pauseButton', () => this.togglePause());
        bindBtn('resumeButton', () => this.togglePause());
        bindBtn('restartButton', () => this.restartLevel());
        bindBtn('mainMenuButton', () => this.showMainMenu());
        bindBtn('nextLevelButton', () => this.nextLevel());
        bindBtn('submitAnswer', () => this.submitAnswer());
        bindBtn('hintButton', () => this.showHint());
        
        const opts = document.getElementById('optionsContainer');
        if(opts) {
            opts.addEventListener('click', (e) => {
                if (e.target.classList.contains('option-button')) {
                    this.selectAnswer(parseInt(e.target.dataset.index));
                }
            });
        }
    }

    startGame(level = 1) {
        this.currentLevel = level;
        this.score = 0;
        this.questionsSolved = 0;
        this.startTime = Date.now();
        this.isGameActive = true;
        this.isPaused = false;
        this.questionManager.resetAskedFlags();
        this.loadLevel(level);
        this.ui.showGameUI();
        this.updateHUD();
    }

    continueGame() {
        const progress = this.levelManager.getLevelCompletion();
        this.startGame(progress.level);
    }

    loadLevel(level) {
        console.log('🚀 Loading level', level);
        
        // 1. Clear scene (removes old maze AND LIGHTS)
        while(this.scene.children.length > 0) { 
            const child = this.scene.children[0];
            if (child !== this.camera) {
                this.scene.remove(child);
            }
        }

        // 2. CRITICAL FIX: Restore Lights after clearing!
        this.setupLighting();
        
        // 3. Reset Physics
        if (this.world) {
            this.world = new CANNON.World();
            this.world.gravity.set(0, -20, 0); 
            this.world.broadphase = new CANNON.NaiveBroadphase();
        }
        
        // Get level data
        const levelData = this.levelManager.getCurrentLevel();
        
        // Create maze (Visuals + Physics)
        this.createMaze(levelData.maze);
        
        // Create Player
        // Note: Player constructor should handle its own physics body creation
        this.player = new Player(this, levelData.startPos);
        
        // 4. CRITICAL FIX: Camera Positioning
        // Map Grid Coordinates to World Coordinates:
        // Grid X -> World X
        // Grid Y -> World Z (Depth)
        // Grid Z -> World Y (Height/Layer)
        const pX = levelData.startPos.x;
        const pY = (levelData.startPos.z * 5); // Height based on layer
        const pZ = levelData.startPos.y;        // Depth based on grid row

        // Position camera: High up (Y+12) and pulled back (Z+10)
        this.camera.position.set(pX, pY + 12, pZ + 10);
        
        // Look at the player's ground position
        this.camera.lookAt(pX, pY, pZ);
        
        console.log(`📷 Camera set to: ${pX}, ${pY+12}, ${pZ+10}`);
        
        // Create other elements
        this.createQuestionGates(levelData.questionPositions);
        this.createEnemies(levelData.enemies);
        this.createCollectibles(levelData.collectibles);
        this.createExit(levelData.exitPos);
        
        this.ui.updateLevelDisplay(level, levelData.name);
        this.renderer.render(this.scene, this.camera);
    }

    createMaze(maze) {
        console.log('🔨 Creating maze...');
        this.mazeWalls = [];
        
        // Materials
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a8a, shininess: 30 });
        const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3a7a, side: THREE.DoubleSide });
        const pathMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a6a });
    
        const groundSize = Math.max(maze.length, maze[0].length);
        
        // 1. Visual Ground
        const groundGeometry = new THREE.PlaneGeometry(groundSize * 2, groundSize * 2);
        const ground = new THREE.Mesh(groundGeometry, floorMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // 2. CRITICAL FIX: Physics Ground (Infinite Plane)
        if (this.world) {
            const groundShape = new CANNON.Plane();
            const groundBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
            // Rotate to face up (CANNON planes face +Z, rotate -90 deg around X to face +Y)
            groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            groundBody.position.set(0, -0.5, 0); 
            groundBody.addShape(groundShape);
            this.world.addBody(groundBody);
        }
        
        // 3. Walls and Tiles
        for (let x = 0; x < maze.length; x++) {
            for (let z = 0; z < maze[x].length; z++) { // z corresponds to the 'y' index in grid
                const cell = maze[x][z];
                
                // We map Grid(x, z) -> World(x, z)
                // World Y is height
                
                if (cell.type === 'wall') {
                    const wallH = 3;
                    
                    // Visual Wall
                    const wallGeometry = new THREE.BoxGeometry(1, wallH, 1);
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, wallH / 2, z); 
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.mazeWalls.push(wall);
                    
                    // Physics Wall
                    if (this.world) {
                        const wallBody = new CANNON.Body({
                            mass: 0,
                            position: new CANNON.Vec3(x, wallH / 2, z)
                        });
                        const wallShape = new CANNON.Box(new CANNON.Vec3(0.5, wallH / 2, 0.5));
                        wallBody.addShape(wallShape);
                        this.world.addBody(wallBody);
                    }
                    
                } else {
                    // Path Tile
                    const pathGeometry = new THREE.BoxGeometry(0.95, 0.1, 0.95);
                    const path = new THREE.Mesh(pathGeometry, pathMaterial);
                    path.position.set(x, 0, z);
                    path.receiveShadow = true;
                    this.scene.add(path);
                }
            }
        }
        
        console.log(`✅ Created ${this.mazeWalls.length} walls`);
    }
    
    createQuestionGates(positions) {
        if(!positions) return;
        const gateGeometry = new THREE.BoxGeometry(0.8, 2, 0.1);
        
        positions.forEach((pos) => {
            const question = this.questionManager.getRandomQuestion(this.currentLevel);
            if (!question) return;
            
            const colors = [0x4CAF50, 0x2196F3, 0xFF9800, 0x9C27B0, 0xF44336];
            const gateMaterial = new THREE.MeshPhongMaterial({ 
                color: colors[this.currentLevel - 1],
                transparent: true, opacity: 0.8 
            });
            
            const gate = new THREE.Mesh(gateGeometry, gateMaterial);
            // Map position carefully: pos.y from JSON is usually Depth(Z), pos.z is Height(Y) or Layer
            // Assuming standard map: x->x, y->z, z->y
            gate.position.set(pos.x, (pos.z*2)+1, pos.y);
            
            gate.userData = {
                type: 'question',
                questionId: question.id,
                solved: false,
                bloomLevel: this.currentLevel
            };
            this.scene.add(gate);
            
            // Physics Trigger
            const triggerBody = new CANNON.Body({
                mass: 0,
                isTrigger: true,
                position: new CANNON.Vec3(pos.x, (pos.z*2)+1, pos.y)
            });
            triggerBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)));
            triggerBody.userData = gate.userData;
            this.world.addBody(triggerBody);
            
            this.animateGate(gate);
        });
    }

    animateGate(gate) {
        let time = 0;
        const startY = gate.position.y;
        const animate = () => {
            if (!gate.userData.solved && this.scene.getObjectById(gate.id)) {
                time += 0.05;
                gate.position.y = startY + Math.sin(time) * 0.1;
                gate.material.opacity = 0.7 + Math.sin(time) * 0.3;
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    createEnemies(enemies) {
        if(!enemies) return;
        enemies.forEach(enemyData => {
            let geometry, material;
            const color = 0xff9900;
            geometry = new THREE.SphereGeometry(0.3);
            material = new THREE.MeshPhongMaterial({ color: color });
            
            const enemy = new THREE.Mesh(geometry, material);
            // Map coords: x->x, y->z
            enemy.position.set(enemyData.x, 0.5, enemyData.y);
            enemy.castShadow = true;
            enemy.userData = { type: 'enemy', ...enemyData };
            this.scene.add(enemy);
            
            const enemyBody = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(enemyData.x, 0.5, enemyData.y)
            });
            enemyBody.addShape(new CANNON.Sphere(0.3));
            this.world.addBody(enemyBody);
        });
    }

    createCollectibles(collectibles) {
        if(!collectibles) return;
        collectibles.forEach(item => {
            const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const material = new THREE.MeshPhongMaterial({ color: 0xffd700 });
            
            const collectible = new THREE.Mesh(geometry, material);
            collectible.position.set(item.x, 1, item.y);
            collectible.castShadow = true;
            collectible.userData = { type: 'collectible', value: item.value || 100 };
            this.scene.add(collectible);
            
            const animate = () => {
                if (this.scene.getObjectById(collectible.id)) {
                    collectible.rotation.y += 0.02;
                    requestAnimationFrame(animate);
                }
            };
            animate();
        });
    }

    createExit(position) {
        if(!position) return;
        const exitGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const exitMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
        
        const exit = new THREE.Mesh(exitGeometry, exitMaterial);
        // Map coords: x->x, y->z
        exit.position.set(position.x, 0.05, position.y);
        exit.userData = { type: 'exit' };
        this.scene.add(exit);
    }

    checkQuestionGate(playerPosition) {
        const gates = this.scene.children.filter(child => child.userData && child.userData.type === 'question');
        for (const gate of gates) {
            if (gate.userData.solved) continue;
            if (playerPosition.distanceTo(gate.position) < 2) {
                this.showQuestion(gate.userData.bloomLevel);
                gate.userData.solved = true; // Mark as solving
                break;
            }
        }
    }

    showQuestion(bloomLevel) {
        const question = this.questionManager.getRandomQuestion(bloomLevel);
        if (question) {
            this.ui.showQuestion(question);
            this.isPaused = true;
        }
    }

    selectAnswer(index) { this.ui.selectAnswer(index); }

    submitAnswer() {
        const selected = this.ui.getSelectedAnswer();
        if (selected === null) return;
        
        const isCorrect = this.questionManager.checkAnswer(selected);
        const question = this.questionManager.getCurrentQuestion();
        
        if (isCorrect) {
            this.questionsSolved++;
            this.score += 100 * this.currentLevel;
            this.ui.showCorrectAnswer(question.explanation);
            this.openQuestionGate();
            
            setTimeout(() => {
                this.ui.hideQuestion();
                this.isPaused = false;
                if (this.questionsSolved >= this.levelManager.getCurrentLevel().questionsRequired) {
                    this.unlockExit();
                }
                this.updateHUD();
            }, 2000);
        } else {
            this.ui.showWrongAnswer(question.explanation);
            this.score -= 50;
            setTimeout(() => {
                this.ui.hideQuestion();
                this.isPaused = false;
                this.updateHUD();
            }, 2000);
        }
    }

    openQuestionGate() {
        const gates = this.scene.children.filter(c => c.userData && c.userData.type === 'question' && c.userData.solved);
        gates.forEach(gate => {
            gate.material.color.set(0x00ff00);
            gate.material.opacity = 0.3;
        });
    }

    unlockExit() {
        const exits = this.scene.children.filter(c => c.userData && c.userData.type === 'exit');
        exits.forEach(exit => {
            exit.material.color.set(0xffff00);
            exit.material.emissive.set(0xffaa00);
        });
    }

    showHint() {
        const q = this.questionManager.getCurrentQuestion();
        if (q && q.hint) this.ui.showHint(q.hint);
    }

    updateHUD() {
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.ui.updateHUD({
            score: this.score,
            level: this.currentLevel,
            questions: `${this.questionsSolved}/5`,
            time: `${Math.floor(currentTime/60)}:${(currentTime%60).toString().padStart(2,'0')}`,
            voltage: `${this.score}V`
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.ui.togglePauseMenu(this.isPaused);
    }

    restartLevel() { this.startGame(this.currentLevel); }
    showMainMenu() { this.isGameActive = false; this.ui.showMainMenu(); }
    
    nextLevel() {
        if (this.currentLevel < 5) {
            this.levelManager.saveProgress(this.score, this.questionsSolved);
            this.startGame(this.currentLevel + 1);
        } else {
            this.ui.showGameComplete(this.score, this.questionsSolved);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyDown(event) {
        if (!this.player) return;
        const key = event.key.toLowerCase();
        
        if (['w','a','s','d',' ','e','r'].includes(key)) event.preventDefault();
        
        switch(key) {
            case 'w': this.player.moveForward = true; break;
            case 's': this.player.moveBackward = true; break;
            case 'a': this.player.moveLeft = true; break;
            case 'd': this.player.moveRight = true; break;
            case ' ': this.player.jump(); break;
            case 'e': this.player.dig(); break;
            case 'r': this.checkQuestionGate(this.player.mesh.position); break;
            case 'escape': this.togglePause(); break;
        }
    }

    onKeyUp(event) {
        if (!this.player) return;
        switch(event.key.toLowerCase()) {
            case 'w': this.player.moveForward = false; break;
            case 's': this.player.moveBackward = false; break;
            case 'a': this.player.moveLeft = false; break;
            case 'd': this.player.moveRight = false; break;
        }
    }

    animate() {
        const fixedTimeStep = 1.0 / 60.0;
        requestAnimationFrame(() => this.animate());
        
        if (!this.isGameActive || this.isPaused) return;
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        
        if (this.world) {
            this.world.step(fixedTimeStep, deltaTime, 3);
        }
        
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        this.checkExitCollision();
        this.renderer.render(this.scene, this.camera);
    }
    
    checkExitCollision() {
        if(!this.player) return;
        const exits = this.scene.children.filter(c => c.userData && c.userData.type === 'exit');
        for (const exit of exits) {
            if (this.player.mesh.position.distanceTo(exit.position) < 1) {
                this.levelComplete();
                break;
            }
        }
    }
    
    levelComplete() {
        this.isPaused = true;
        this.levelManager.saveProgress(this.score, this.questionsSolved);
        this.ui.showLevelComplete(this.score, this.questionsSolved);
    }
}

// Initialize
window.addEventListener('load', () => {
    window.game = new Game();
});
