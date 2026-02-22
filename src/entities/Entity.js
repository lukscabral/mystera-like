export default class Entity {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        
        //cria sprite com physics
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setOrigin(0.5);
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setImmovable(true);

        
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
        
        this.moveTarget = new Phaser.Math.Vector2();
        this.direction = new Phaser.Math.Vector2();

        this.alignToGrid();

        this.currentTile = this.getTilePosition();
        this.previousTile = null;
        this.targetTile = null;
        
        
        this.scene.grid.place(this, this.currentTile.x, this.currentTile.y);
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

        // console.log("Dano:", amount, "HP:", this.hp);
        console.log("HP inimigo:", this.hp, "/", this.maxHp);
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
        if (dirX !== 0 && dirY !== 0) return;
        if (this.isMoving || this.isDead) return;
        // console.trace("TRY MOVE:");

        const { x, y } = this.currentTile;

        const targetX = x + dirX;
        const targetY = y + dirY;

        const canMove = this.scene.grid.tryMove(
            this,
            x,
            y,
            targetX,
            targetY
        );

        if (!canMove) return;

        this.previousTile = { x, y };
        this.targetTile = { x: targetX, y: targetY };

        this.moveTarget.set(
            targetX * this.tileSize + this.tileSize / 2,
            targetY * this.tileSize + this.tileSize / 2
        );

        this.isMoving = true;
        
    }

    updateMovement(dt) {
        if (!this.isMoving || this.isDead) return;

        const dx = this.moveTarget.x - this.sprite.x;
        const dy = this.moveTarget.y - this.sprite.y;//this.sprite.y??

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.speed * dt) {
            this.sprite.x = this.moveTarget.x;
            this.sprite.y = this.moveTarget.y;

            // this.alignToGrid();
            this.isMoving = false;

            // this.scene.grid.finishMove(this);

            // if (this.targetTile) {
                //libera tile antigo
                this.scene.grid.finishMove(this);

                // this.previousTile = this.targetTile;
                // this.targetTile = null;
            // }

            return;
        }
        
        this.sprite.x += (dx / dist) * this.speed * dt;
        this.sprite.y += (dy / dist) * this.speed * dt;
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
        if (this.isDead) return;

        this.isDead = true;
        this.isMoving = false;
        
        console.log("morreu");

        this.scene.grid.removeEntity(this);
        
        this.scene.entities = this.scene.entities.filter( // removendo entidade da lista
            e => e !== this
        );

        this.sprite.disableBody(true, true);
        this.sprite.destroy();
    }

    update(time, delta) {
        this.updateMovement(delta / 1000);
    }
}