// player.js - Updated version
class Player {
    constructor(game, startPos) {
        this.game = game;
        this.speed = 5;
        this.jumpStrength = 8;
        this.canJump = true;
        
        // Movement flags
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Create player mesh
        this.createPlayerMesh();
        this.mesh.position.set(startPos.x, startPos.y + 1, startPos.z);
        
        // Create physics body
        this.createPhysicsBody();
        
        // Add to scene
        this.game.scene.add(this.mesh);
        this.game.world.addBody(this.body);
    }
    
    createPlayerMesh() {
        // Create body using CylinderGeometry instead of CapsuleGeometry
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00aaff,
            shininess: 30
        });
        
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Create head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.35, 8, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00aaff 
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.7;
        this.mesh.add(head);
        
        // Add circuit-like details
        const wireGeometry = new THREE.TorusGeometry(0.4, 0.05, 4, 16);
        const wireMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.3
        });
        
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        wire.position.y = 0.2;
        this.mesh.add(wire);
        
        // Add glowing core
        const coreGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const coreMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 0.5;
        this.mesh.add(core);
        
        // Add arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaff });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.3, 0);
        leftArm.rotation.z = Math.PI / 4;
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.3, 0);
        rightArm.rotation.z = -Math.PI / 4;
        this.mesh.add(rightArm);
    }
    
    createPhysicsBody() {
        this.body = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(0, 2, 0),
            shape: new CANNON.Sphere(0.5),
            linearDamping: 0.9,
            angularDamping: 0.9
        });
        
        // Add ground contact material
        this.body.material = new CANNON.Material('playerMaterial');
        const groundMaterial = new CANNON.Material('groundMaterial');
        
        const contactMaterial = new CANNON.ContactMaterial(
            this.body.material,
            groundMaterial,
            {
                friction: 0.5,
                restitution: 0.3
            }
        );
        this.game.world.addContactMaterial(contactMaterial);
        
        // Listen for collisions to detect ground contact
        this.body.addEventListener('collide', (event) => {
            const contact = event.contact;
            
            // Check if collision is with ground
            if (contact.ni.y > 0.5) {
                this.canJump = true;
            }
        });
    }
    
    update(deltaTime) {
        // Update velocity based on input
        const velocity = new CANNON.Vec3(0, 0, 0);
        
        if (this.moveForward) velocity.z -= this.speed;
        if (this.moveBackward) velocity.z += this.speed;
        if (this.moveLeft) velocity.x -= this.speed;
        if (this.moveRight) velocity.x += this.speed;
        
        // Apply movement
        if (velocity.length() > 0) {
            velocity.normalize();
            velocity.scale(this.speed, velocity);
            
            // Convert to local space
            const quat = this.body.quaternion;
            const forward = new CANNON.Vec3(0, 0, -1);
            const right = new CANNON.Vec3(1, 0, 0);
            
            forward.vmult(velocity.z, forward);
            right.vmult(velocity.x, right);
            
            velocity.x = forward.x + right.x;
            velocity.z = forward.z + right.z;
            
            this.body.velocity.x = velocity.x;
            this.body.velocity.z = velocity.z;
        } else {
            // Apply damping when no input
            this.body.velocity.x *= 0.9;
            this.body.velocity.z *= 0.9;
        }
        
        // Sync Three.js mesh with Cannon.js body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        
        // Add bobbing animation when moving
        if (velocity.length() > 0 && this.canJump) {
            const bobAmount = Math.sin(Date.now() * 0.01) * 0.05;
            this.mesh.children.forEach(child => {
                if (child !== this.mesh) {
                    child.position.y += bobAmount * 0.5;
                }
            });
        }
    }
    
    jump() {
        if (this.canJump) {
            this.body.velocity.y = this.jumpStrength;
            this.canJump = false;
            
            // Add jump effect
            const jumpEffect = new THREE.PointLight(0x00ffff, 1, 2);
            jumpEffect.position.copy(this.mesh.position);
            this.game.scene.add(jumpEffect);
            
            setTimeout(() => {
                this.game.scene.remove(jumpEffect);
            }, 300);
        }
    }
    
    dig() {
        // Create digging effect
        const digEffect = new THREE.PointLight(0xff9900, 2, 3);
        digEffect.position.copy(this.mesh.position);
        digEffect.position.y -= 0.5;
        this.game.scene.add(digEffect);
        
        // Create hole geometry
        const holeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
        const holeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.copy(this.mesh.position);
        hole.position.y = -0.4;
        this.game.scene.add(hole);
        
        // Add physics body for hole (as trigger)
        const holeBody = new CANNON.Body({
            mass: 0,
            isTrigger: true,
            position: new CANNON.Vec3(
                this.mesh.position.x,
                -0.4,
                this.mesh.position.z
            )
        });
        holeBody.addShape(new CANNON.Cylinder(0.5, 0.5, 0.2, 8));
        holeBody.userData = { type: 'hole', timer: 300 }; // 5 seconds
        this.game.world.addBody(holeBody);
        
        // Remove hole after delay
        setTimeout(() => {
            this.game.scene.remove(hole);
            this.game.world.removeBody(holeBody);
        }, 5000);
        
        // Remove light effect
        setTimeout(() => {
            this.game.scene.remove(digEffect);
        }, 500);
    }
    
    collectItem(item) {
        this.game.score += item.userData.value;
        item.userData.collected = true;
        this.game.scene.remove(item);
        
        // Add collection effect
        const collectEffect = new THREE.PointLight(0xffff00, 3, 5);
        collectEffect.position.copy(this.mesh.position);
        this.game.scene.add(collectEffect);
        
        setTimeout(() => {
            this.game.scene.remove(collectEffect);
        }, 300);
        
        this.game.updateHUD();
    }
}
