class Player {
    constructor(game, startPos) {
        this.game = game;
        this.speed = 8; // Increased for better movement
        this.jumpStrength = 12;
        this.canJump = true;
        
        // Movement flags
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Create player mesh
        this.createPlayerMesh();
        // CORRECT: Maps x->x, z->y (height), y->z
        // startPos.z comes from levels.js as the 'layer' (0, 1, 2 etc), so we use it for height
       // Grid X -> World X
        // Grid Z -> World Y (Height/Floor) -> 0 for level 1
        // Grid Y -> World Z (Depth)
        const worldX = startPos.x;
        const worldZ = startPos.y; // 'y' in level data is depth
        const worldY = 2;          // Force spawn at height 2 to drop onto floor
        
        // Set Mesh Position
        this.mesh.position.set(worldX, worldY, worldZ);
        
        // Set Physics Body Position
        this.body = new CANNON.Body({
            mass: 1,
            // Match mesh position
            position: new CANNON.Vec3(worldX, worldY, worldZ), 
            shape: new CANNON.Sphere(0.4),
            linearDamping: 0.3,
            angularDamping: 0.3
        });
        
        // Create physics body
        this.createPhysicsBody();
        
        // Add to scene
        this.game.scene.add(this.mesh);
        this.game.world.addBody(this.body);
    }
    
    createPlayerMesh() {
        // Create a simple player using basic geometries
        const group = new THREE.Group();
        
        // Body (cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00aaff,
            shininess: 20,
            emissive: 0x004488,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.35, 8, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0088ff 
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.6;
        head.castShadow = true;
        group.add(head);
        
        // Circuit ring
        const ringGeometry = new THREE.TorusGeometry(0.4, 0.05, 4, 16);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 0.1;
        group.add(ring);
        
        // Energy core
        const coreGeometry = new THREE.SphereGeometry(0.15, 6, 6);
        const coreMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 0.4;
        group.add(core);
        
        this.mesh = group;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
    
    createPhysicsBody() {
        // Create the physics body using the mesh's corrected position
        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(
                this.mesh.position.x, 
                this.mesh.position.y, 
                this.mesh.position.z
            ),
            shape: new CANNON.Sphere(0.4),
            linearDamping: 0.3,
            angularDamping: 0.3
        });
      
        // Allow some rotation for visual effect
        this.body.fixedRotation = false;
        
        // Listen for ground collisions to reset jump
        this.body.addEventListener('collide', (event) => {
            const contact = event.contact;
            // Check if the collision normal points up (Y-axis is up)
            if (contact.ni.y > 0.5) {
                this.canJump = true;
            }
        });
    }
    
    update(deltaTime) {
        // Simple movement system
        const moveForce = 50;
        
        // Reset horizontal forces
        this.body.force.x = 0;
        this.body.force.z = 0;
        
        // Apply movement forces
        if (this.moveForward) {
            this.body.force.z -= moveForce;
        }
        if (this.moveBackward) {
            this.body.force.z += moveForce;
        }
        if (this.moveLeft) {
            this.body.force.x -= moveForce;
        }
        if (this.moveRight) {
            this.body.force.x += moveForce;
        }
        
        // Limit horizontal velocity
        const maxSpeed = this.speed * 2;
        const vel = this.body.velocity;
        const horizontalSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
        
        if (horizontalSpeed > maxSpeed) {
            const scale = maxSpeed / horizontalSpeed;
            vel.x *= scale;
            vel.z *= scale;
            this.body.velocity = vel;
        }
        
        // Sync Three.js mesh with Cannon.js body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        
        // Bobbing animation
        if (this.canJump && (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight)) {
            const bob = Math.sin(Date.now() * 0.01) * 0.05;
            this.mesh.children.forEach(child => {
                if (child.type === 'Mesh') {
                    child.position.y += bob * 0.3;
                }
            });
        }
    }
    
    jump() {
        if (this.canJump) {
            // Apply jump impulse
            this.body.velocity.y = this.jumpStrength;
            this.canJump = false;
            
            // Jump effect
            const light = new THREE.PointLight(0x00ffff, 2, 3);
            light.position.copy(this.mesh.position);
            this.game.scene.add(light);
            
            // Remove light after delay
            setTimeout(() => {
                if (this.game && this.game.scene) {
                    this.game.scene.remove(light);
                }
            }, 300);
            
            // Play sound if available
            if (window.audioManager) {
                window.audioManager.play('jump');
            }
        }
    }
    
    dig() {
        // Digging effect
        const light = new THREE.PointLight(0xff9900, 3, 4);
        light.position.copy(this.mesh.position);
        light.position.y -= 0.3;
        this.game.scene.add(light);
        
        // Create temporary hole
        const holeGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 8);
        const holeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            transparent: true,
            opacity: 0.7
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.copy(this.mesh.position);
        hole.position.y = -0.1;
        this.game.scene.add(hole);
        
        // Remove after delay
        setTimeout(() => {
            if (this.game && this.game.scene) {
                this.game.scene.remove(light);
                this.game.scene.remove(hole);
            }
        }, 2000);
    }
    
    collectItem(item) {
        if (!item || !item.userData) return;
        
        // Add score
        this.game.score += item.userData.value || 100;
        
        // Remove item from scene
        if (item.parent) {
            item.parent.remove(item);
        }
        
        // Collection effect
        const light = new THREE.PointLight(0xffff00, 4, 5);
        light.position.copy(this.mesh.position);
        this.game.scene.add(light);
        
        setTimeout(() => {
            if (this.game && this.game.scene) {
                this.game.scene.remove(light);
            }
        }, 500);
        
        // Update HUD
        if (this.game.updateHUD) {
            this.game.updateHUD();
        }
    }
}
