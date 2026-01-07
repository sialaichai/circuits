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
            console.error('THREE is not defined! Check script loading order.');
            console.log('Three.js should load BEFORE game.js');
            
            // Show error message
            this.showLoadError('Three.js physics engine failed to load. Please refresh the page.');
            return;
        }
        
        // Check if Cannon.js is loaded
        if (typeof CANNON === 'undefined') {
            console.error('CANNON is not defined!');
            this.showLoadError('Physics engine failed to load. Please refresh.');
            return;
        }
        
        this.init();
    }
        showLoadError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        `;
        errorDiv.innerHTML = `
            <h2>⚠️ Loading Error</h2>
            <p>${message}</p>
            <p style="font-size: 14px; margin-top: 20px;">
                <strong>Debug Info:</strong><br>
                THREE: ${typeof THREE}<br>
                CANNON: ${typeof CANNON}<br>
                Howler: ${typeof Howler}
            </p>
            <button onclick="window.location.reload()" 
                    style="margin-top: 20px; padding: 10px 20px; background: white; color: red; border: none; border-radius: 5px; cursor: pointer;">
                ↻ Refresh Page
            </button>
        `;
        document.body.appendChild(errorDiv);
    }

    init() {
        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a2a);
        this.scene.fog = new THREE.Fog(0x0a0a2a, 10, 50);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Setup physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
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

    setupLighting() {
    console.log('Setting up lighting...');
    
    // 1. Ambient Light (fills all shadows)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8); // Increased intensity
    this.scene.add(ambientLight);
    
    // 2. Main Directional Light (like sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    
    this.scene.add(directionalLight);
    
    // 3. Fill Light (from opposite side)
    const fillLight = new THREE.DirectionalLight(0xaaaaff, 0.3);
    fillLight.position.set(-20, 20, -10);
    this.scene.add(fillLight);
    
    // 4. Point Lights for special effects
    const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 30);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 0.3, 30);
    pointLight2.position.set(-10, 5, -10);
    this.scene.add(pointLight2);
    
    // 5. Hemisphere Light (sky/ground lighting)
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.6);
    this.scene.add(hemisphereLight);
    
    console.log('Lighting setup complete');
}

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // UI button events
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('continueButton').addEventListener('click', () => this.continueGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeButton').addEventListener('click', () => this.togglePause());
        document.getElementById('restartButton').addEventListener('click', () => this.restartLevel());
        document.getElementById('mainMenuButton').addEventListener('click', () => this.showMainMenu());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('submitAnswer').addEventListener('click', () => this.submitAnswer());
        document.getElementById('hintButton').addEventListener('click', () => this.showHint());
        
        // Option buttons
        document.getElementById('optionsContainer').addEventListener('click', (e) => {
            if (e.target.classList.contains('option-button')) {
                const index = parseInt(e.target.dataset.index);
                this.selectAnswer(index);
            }
        });
    }

    startGame(level = 1) {
        this.currentLevel = level;
        this.score = 0;
        this.questionsSolved = 0;
        this.startTime = Date.now();
        this.isGameActive = true;
        this.isPaused = false;
        
        // Reset question flags
        this.questionManager.resetAskedFlags();
        
        // Load level
        this.loadLevel(level);
        
        // Show game UI
        this.ui.showGameUI();
        
        // Update HUD
        this.updateHUD();
    }

    continueGame() {
        const progress = this.levelManager.getLevelCompletion();
        this.startGame(progress.level);
    }

loadLevel(level) {
    console.log('Loading level', level);
    
    // Clear existing scene
    while(this.scene.children.length > 0){ 
        const child = this.scene.children[0];
        if (child !== this.camera && child !== this.testCube) { // Keep camera and test cube
            this.scene.remove(child); 
        }
    }
    
    // Reset physics world if it exists
    if (this.world) {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
    }
    
    // Re-add lighting
    this.setupLighting();
    
    // Get level data
    const levelData = this.levelManager.getCurrentLevel();
    console.log('Level data:', levelData);
    
    // Create maze
    this.createMaze(levelData.maze);
    
    // Create player at START position (not inside walls!)
    this.player = new Player(this, levelData.startPos);
    
    // Position camera ABOVE and BEHIND player
    const startPos = levelData.startPos;
    this.camera.position.set(
        startPos.x - 5,  // 5 units to the left
        startPos.y + 10, // 10 units above
        startPos.z + 5   // 5 units behind
    );
    
    // Make camera look at player start position
    this.camera.lookAt(
        startPos.x,
        startPos.y + 1,  // Look at player's height
        startPos.z
    );
    
    console.log('Camera positioned at:', this.camera.position);
    console.log('Camera looking at:', startPos);
    
    // Create other level elements
    this.createQuestionGates(levelData.questionPositions);
    this.createEnemies(levelData.enemies);
    this.createCollectibles(levelData.collectibles);
    this.createExit(levelData.exitPos);
    
    // Add a test object to verify visibility
    this.addTestMarker(startPos);
    
    // Update UI
    this.ui.updateLevelDisplay(level, levelData.name);
    
    // Force render
    this.renderer.render(this.scene, this.camera);
}

// Add this helper method
addTestMarker(position) {
    // Add a visible marker at player start position
    const markerGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.7
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(position.x, position.y + 2, position.z);
    this.scene.add(marker);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (this.scene && marker.parent === this.scene) {
            this.scene.remove(marker);
        }
    }, 3000);
    
    console.log('Added yellow marker at start position');
}

    createMaze(maze) {
        console.log('Creating maze...');
        
        // Store maze reference for debugging
        this.currentMaze = maze;
        
        const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3a3a6a,
            emissive: 0x1a1a4a,
            emissiveIntensity: 0.3
        });
        
        const floorGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        const floorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2a2a5a,
            emissive: 0x1a1a3a,
            emissiveIntensity: 0.2
        });
        
        // Count walls for debugging
        let wallCount = 0;
        let floorCount = 0;
        
        for (let x = 0; x < maze.length; x++) {
            for (let y = 0; y < maze[x].length; y++) {
                const cell = maze[x][y];
                
                if (cell.type === 'wall') {
                    // Create wall
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 1, y); // Center at y=1 (height 2)
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    wallCount++;
                } else {
                    // Create floor
                    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                    floor.position.set(x, -0.45, y);
                    floor.receiveShadow = true;
                    this.scene.add(floor);
                    floorCount++;
                }
            }
        }
        
        console.log(`Created ${wallCount} walls and ${floorCount} floor tiles`);
        
        // Add a large ground plane under everything
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a3a,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        this.scene.add(ground);
    }

    createQuestionGates(positions) {
        const gateGeometry = new THREE.BoxGeometry(0.8, 2, 0.1);
        
        positions.forEach((pos, index) => {
            const question = this.questionManager.getRandomQuestion(this.currentLevel);
            if (!question) return;
            
            // Create gate material based on Bloom's level
            const colors = [0x4CAF50, 0x2196F3, 0xFF9800, 0x9C27B0, 0xF44336];
            const gateMaterial = new THREE.MeshPhongMaterial({ 
                color: colors[this.currentLevel - 1],
                emissive: colors[this.currentLevel - 1],
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8
            });
            
            const gate = new THREE.Mesh(gateGeometry, gateMaterial);
            gate.position.set(pos.x, pos.y, pos.z);
            gate.userData = {
                type: 'question',
                questionId: question.id,
                solved: false,
                bloomLevel: this.currentLevel
            };
            this.scene.add(gate);
            
            // Add pulsing animation
            this.animateGate(gate);
            
            // Add physics trigger
            const triggerBody = new CANNON.Body({
                mass: 0,
                isTrigger: true,
                position: new CANNON.Vec3(pos.x, pos.y, pos.z)
            });
            const triggerShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
            triggerBody.addShape(triggerShape);
            triggerBody.userData = gate.userData;
            this.world.addBody(triggerBody);
        });
    }

    animateGate(gate) {
        let time = 0;
        const animate = () => {
            if (!gate.userData.solved) {
                time += 0.05;
                gate.position.y = gate.position.y + Math.sin(time) * 0.01;
                gate.material.opacity = 0.7 + Math.sin(time) * 0.3;
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    createEnemies(enemies) {
        enemies.forEach(enemyData => {
            // Create enemy based on type
            let geometry, material;
            
            switch(enemyData.type) {
                case 'resistor':
                    geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
                    material = new THREE.MeshPhongMaterial({ color: 0xff9900 });
                    break;
                case 'capacitor':
                    geometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
                    material = new THREE.MeshPhongMaterial({ color: 0x00aaff });
                    break;
                case 'inductor':
                    geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
                    material = new THREE.MeshPhongMaterial({ color: 0xaa00ff });
                    break;
                case 'transistor':
                    geometry = new THREE.ConeGeometry(0.3, 0.6, 4);
                    material = new THREE.MeshPhongMaterial({ color: 0xff5500 });
                    break;
                case 'ic':
                    geometry = new THREE.BoxGeometry(0.5, 0.2, 0.5);
                    material = new THREE.MeshPhongMaterial({ color: 0x333333 });
                    break;
            }
            
            const enemy = new THREE.Mesh(geometry, material);
            enemy.position.set(enemyData.x, 0.5, enemyData.y);
            enemy.castShadow = true;
            enemy.userData = {
                type: 'enemy',
                speed: enemyData.speed,
                pattern: enemyData.pattern || 'patrol',
                direction: new THREE.Vector3(1, 0, 0)
            };
            this.scene.add(enemy);
            
            // Add physics body
            const enemyBody = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(enemyData.x, 0.5, enemyData.y)
            });
            const enemyShape = new CANNON.Sphere(0.3);
            enemyBody.addShape(enemyShape);
            this.world.addBody(enemyBody);
        });
    }

    createCollectibles(collectibles) {
        collectibles.forEach(item => {
            let geometry, material;
            
            switch(item.type) {
                case 'battery':
                    geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8);
                    material = new THREE.MeshPhongMaterial({ 
                        color: 0xff0000,
                        emissive: 0xff0000,
                        emissiveIntensity: 0.5
                    });
                    break;
                case 'wire':
                    geometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16);
                    material = new THREE.MeshPhongMaterial({ 
                        color: 0xffff00,
                        emissive: 0xffff00,
                        emissiveIntensity: 0.3
                    });
                    break;
                case 'multimeter':
                    geometry = new THREE.BoxGeometry(0.3, 0.1, 0.4);
                    material = new THREE.MeshPhongMaterial({ 
                        color: 0x00ffff,
                        emissive: 0x00aaaa,
                        emissiveIntensity: 0.4
                    });
                    break;
                case 'oscilloscope':
                    geometry = new THREE.BoxGeometry(0.4, 0.2, 0.3);
                    material = new THREE.MeshPhongMaterial({ 
                        color: 0xff00ff,
                        emissive: 0xaa00aa,
                        emissiveIntensity: 0.4
                    });
                    break;
                case 'gold_wire':
                    geometry = new THREE.TorusKnotGeometry(0.2, 0.05, 64, 8);
                    material = new THREE.MeshPhongMaterial({ 
                        color: 0xffd700,
                        emissive: 0xffaa00,
                        emissiveIntensity: 0.6
                    });
                    break;
                case 'diamond_chip':
                    geometry = new THREE.OctahedronGeometry(0.3);
                    material = new THREE.MeshPhongMaterial({ 
                        color: 0xffffff,
                        emissive: 0xffffff,
                        emissiveIntensity: 0.8,
                        transparent: true,
                        opacity: 0.9
                    });
                    break;
            }
            
            const collectible = new THREE.Mesh(geometry, material);
            collectible.position.set(item.x, 1, item.y);
            collectible.castShadow = true;
            collectible.userData = {
                type: 'collectible',
                value: item.value,
                collected: false
            };
            this.scene.add(collectible);
            
            // Add rotation animation
            this.animateCollectible(collectible);
        });
    }

    animateCollectible(collectible) {
        const animate = () => {
            if (!collectible.userData.collected) {
                collectible.rotation.y += 0.02;
                collectible.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.2;
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    createExit(position) {
        const exitGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const exitMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x00aa00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const exit = new THREE.Mesh(exitGeometry, exitMaterial);
        exit.position.set(position.x, 0, position.z);
        exit.userData = { type: 'exit' };
        this.scene.add(exit);
        
        // Add pulsing animation
        const animateExit = () => {
            exit.scale.x = 1 + Math.sin(Date.now() * 0.002) * 0.2;
            exit.scale.z = 1 + Math.sin(Date.now() * 0.002) * 0.2;
            requestAnimationFrame(animateExit);
        };
        animateExit();
    }

    checkQuestionGate(playerPosition) {
        // Simple proximity check for question gates
        const gates = this.scene.children.filter(child => 
            child.userData && child.userData.type === 'question'
        );
        
        for (const gate of gates) {
            if (gate.userData.solved) continue;
            
            const distance = playerPosition.distanceTo(gate.position);
            if (distance < 2) {
                this.showQuestion(gate.userData.bloomLevel);
                gate.userData.solved = true;
                break;
            }
        }
    }

    showQuestion(bloomLevel) {
        const question = this.questionManager.getRandomQuestion(bloomLevel);
        if (!question) return;
        
        this.ui.showQuestion(question);
        this.isPaused = true;
    }

    selectAnswer(index) {
        this.ui.selectAnswer(index);
    }

    submitAnswer() {
        const selected = this.ui.getSelectedAnswer();
        if (selected === null) return;
        
        const isCorrect = this.questionManager.checkAnswer(selected);
        const question = this.questionManager.getCurrentQuestion();
        
        if (isCorrect) {
            this.questionsSolved++;
            this.score += 100 * this.currentLevel;
            this.ui.showCorrectAnswer(question.explanation);
            
            // Open gate in game world
            this.openQuestionGate();
            
            setTimeout(() => {
                this.ui.hideQuestion();
                this.isPaused = false;
                
                // Check if level complete
                const levelData = this.levelManager.getCurrentLevel();
                if (this.questionsSolved >= levelData.questionsRequired) {
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
        // Find and remove/change the solved gate
        const gates = this.scene.children.filter(child => 
            child.userData && child.userData.type === 'question' && child.userData.solved
        );
        
        gates.forEach(gate => {
            gate.material.color.set(0x00ff00);
            gate.material.emissive.set(0x00aa00);
            gate.material.opacity = 0.3;
        });
    }

    unlockExit() {
        const exits = this.scene.children.filter(child => 
            child.userData && child.userData.type === 'exit'
        );
        
        exits.forEach(exit => {
            exit.material.color.set(0xffff00);
            exit.material.emissive.set(0xffaa00);
            exit.material.emissiveIntensity = 1;
        });
    }

    showHint() {
        const question = this.questionManager.getCurrentQuestion();
        if (question && question.hint) {
            this.ui.showHint(question.hint);
        }
    }

    updateHUD() {
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const seconds = (currentTime % 60).toString().padStart(2, '0');
        
        this.ui.updateHUD({
            score: this.score,
            level: this.currentLevel,
            questions: `${this.questionsSolved}/5`,
            time: `${minutes}:${seconds}`,
            voltage: `${this.score}V`
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.ui.togglePauseMenu(this.isPaused);
    }

    restartLevel() {
        this.startGame(this.currentLevel);
    }

    showMainMenu() {
        this.isGameActive = false;
        this.ui.showMainMenu();
    }

    nextLevel() {
        if (this.currentLevel < 5) {
            this.levelManager.saveProgress(this.score, this.questionsSolved);
            this.currentLevel++;
            this.startGame(this.currentLevel);
        } else {
            this.completeGame();
        }
    }

    completeGame() {
        // Game completion logic
        this.ui.showGameComplete(this.score, this.questionsSolved);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyDown(event) {
        if (!this.player) return;
        
        switch(event.key.toLowerCase()) {
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
        requestAnimationFrame(() => this.animate());
        
        if (!this.isGameActive || this.isPaused) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Update physics
        if (this.world) {
            this.world.step(1/60, deltaTime, 3);
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
            
            // Get player position
            const playerPos = this.player.mesh.position;
            
            // Calculate camera position (third-person view)
            const cameraDistance = 8;
            const cameraHeight = 5;
            
            // Smooth camera follow
            const targetCameraPos = new THREE.Vector3(
                playerPos.x - cameraDistance,
                playerPos.y + cameraHeight,
                playerPos.z
            );
            
            // Use lerp for smooth movement
            this.camera.position.lerp(targetCameraPos, 0.1);
            
            // Make camera look slightly above player
            const lookAtPos = new THREE.Vector3(
                playerPos.x,
                playerPos.y + 2,
                playerPos.z
            );
            this.camera.lookAt(lookAtPos);
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update mixers (animations)
        this.mixers.forEach(mixer => mixer.update(deltaTime));
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Update HUD timer
        this.updateHUD();
    }

    updateEnemies(deltaTime) {
        const enemies = this.scene.children.filter(child => 
            child.userData && child.userData.type === 'enemy'
        );
        
        enemies.forEach(enemy => {
            // Simple patrol pattern
            enemy.position.x += enemy.userData.direction.x * enemy.userData.speed * deltaTime;
            enemy.position.z += enemy.userData.direction.z * enemy.userData.speed * deltaTime;
            
            // Change direction occasionally
            if (Math.random() < 0.01) {
                enemy.userData.direction.set(
                    Math.random() * 2 - 1,
                    0,
                    Math.random() * 2 - 1
                ).normalize();
            }
            
            // Check collision with player
            if (this.player && enemy.position.distanceTo(this.player.mesh.position) < 1) {
                this.playerHit();
            }
        });
    }

    checkExit(playerPosition) {
        const exits = this.scene.children.filter(child => 
            child.userData && child.userData.type === 'exit'
        );
        
        for (const exit of exits) {
            const distance = playerPosition.distanceTo(exit.position);
            if (distance < 1) {
                this.levelComplete();
                break;
            }
        }
    }

    playerHit() {
        this.score = Math.max(0, this.score - 100);
        // Add visual feedback for hit
        if (this.player) {
            this.player.mesh.material.emissive.set(0xff0000);
            setTimeout(() => {
                if (this.player) {
                    this.player.mesh.material.emissive.set(0x000000);
                }
            }, 500);
        }
        this.updateHUD();
    }

    levelComplete() {
        this.isPaused = true;
        this.levelManager.saveProgress(this.score, this.questionsSolved);
        this.ui.showLevelComplete(this.score, this.questionsSolved);
    }


    debugSceneAndCamera() {
    console.log('=== SCENE & CAMERA DEBUG ===');
    
    // 1. Check scene contents
    console.log('Scene has', this.scene.children.length, 'children:');
    this.scene.children.forEach((child, i) => {
        console.log(`  ${i}: ${child.type || child.constructor.name} at`, child.position);
    });
    
    // 2. Check camera
    console.log('Camera position:', this.camera.position);
    console.log('Camera rotation:', this.camera.rotation);
    
    // 3. Add debug objects to understand positions
    this.addDebugHelpers();
}

    addDebugHelpers() {
        // Add axes helper at origin
        const axesHelper = new THREE.AxesHelper(5);
        axesHelper.position.set(0, 0, 0);
        this.scene.add(axesHelper);
        
        // Add grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x444444);
        gridHelper.position.y = -0.5;
        this.scene.add(gridHelper);
        
        // Add camera helper
        const cameraHelper = new THREE.CameraHelper(this.camera);
        this.scene.add(cameraHelper);
        
        console.log('Added debug helpers: axes, grid, camera helper');
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    window.game = new Game();
});
