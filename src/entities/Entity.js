export default class Entity {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        
        //cria sprite com physics
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setOrigin(0.5);
        
        //stats base
        this.maxHp = 50;
        this.hp = this.maxHp;

        this.isDead = false;

        //propriedades comuns
        this.speed = 100;
        this.facing = 'down';
        this.isMoving = false;

        this.tileSize = scene.tileSize || 32;
        // renderizaçao padrao
        this.sprite.setDepth(10);
        
        //colisao, impede de sair do mapa
        // this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setImmovable(true);
        
        this.moveTarget = new Phaser.Math.Vector2();
        this.direction = new Phaser.Math.Vector2();

        this.sprite.body.setAllowGravity(false);

        this.alignToGrid();
    }

    //pegar posiçao
    get x() {
        return this.sprite.x;
    }

    get y() {
        return this.sprite.y;
    }

    set x(value) {
        this.sprite.x = value;
    }

    set y(value) {
        this.sprite.y = value;
    }

    //sistema de dano
    takeDamage(amount) {
        if (this.isDead || this.invulnerable) return;

        this.hp -= amount;//hp = hp - amount
        this.invulnerable = true;

        console.log("Dano:", amount, "HP:", this.hp);

        this.scene.tweens.add({ //feedback visual
            targets: this.sprite,
            alpha: 0.3,
            duration: 80,
            yoyo: true,
            repeat: 3
        });

        this.scene.time.delayedCall(1000, () => {
            this.invulnerable = false;
        });

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    heal(amount) {
        if (this.isDead) return;

        this.hp += amount;
        this.hp = Math.min(this.hp, this.maxHp);

        console.log("Cura:", amount, "HP:", this.hp);
    }

    tryMoveTile(dirX, dirY) {
        if (this.isMoving) return;

        const { x, y } = this.getTilePosition();

        const targetTileX = x + dirX;
        const targetTileY = y + dirY;
        
        if (this.scene.isTileBlocked(targetTileX, targetTileY)) return;

        //ocupado pela entidade atual
        if (this.scene.isTileOccupied?.(targetTileX, targetTileY, this)) return ;

        //reservado por alguem
        if (this.scene.isTileReserved?.(targetTileX, targetTileY)) return;

        //reserva o tile
        this.scene.reserveTile(targetTileX, targetTileY);

        this.targetTile = { x: targetTileX, y: targetTileY };

        this.moveTarget.set(
            targetTileX * this.tileSize + this.tileSize / 2,
            targetTileY * this.tileSize + this.tileSize / 2
        );

        this.isMoving = true;
    }

    updateMovement(dt) {
        if (!this.isMoving) return;

        const dx = this.moveTarget.x - this.x;
        const dy = this.moveTarget.y - this.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.speed * dt) {
            this.x = this.moveTarget.x;
            this.y = this.moveTarget.y;

            this.alignToGrid();
            this.isMoving = false;

            if (this.targetTile) {
                this.scene.releaseTile(this.targetTile.x, this.targetTile.y);
                this.targetTile = null;       
            }
            
            return;
        }
        
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
    }

    getTilePosition() {
        return {
            x: Math.floor((this.x - this.tileSize / 2) / this.tileSize),
            y: Math.floor((this.y - this.tileSize / 2) / this.tileSize)
        };
    }


    moveDirection(dirX, dirY) {
        if (this.isMoving) return;

        dirX = Math.sign(dirX);
        dirY = Math.sign(dirY);
       
        this.tryMoveTile( dirX,  dirY);
    }

    alignToGrid() {
        this.x = Math.round((this.x - this.tileSize / 2) / this.tileSize) * this.tileSize + this.tileSize / 2;
        this.y = Math.round((this.y - this.tileSize / 2) / this.tileSize) * this.tileSize + this.tileSize / 2;
    }

    die() {
        this.isDead = true;

        console.log("Entity morreu");
        
        //remove sprite
        this.sprite.setTint(0x555555);
        this.sprite.setVelocity(0, 0);
    }

    update(time, delta) {
        this.updateMovement(delta / 1000);
        // const { x, y } = this.getTilePosition();
        // console.log("tile:", x, y);
    }
}