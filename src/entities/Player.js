import Entity from "./Entity.js";

export default class Player extends Entity {
    constructor(scene, x ,y) {
        super(scene, x, y, "player");

        this.tileSize = scene.tileSize;
        this.speed = 150;//especifico do player

        //movimento tile
        this.isMoving = false;
        this.moveTarget = new Phaser.Math.Vector2();

        //input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        //alinhar ao grid
        this.alignToGrid();
    }

    alignToGrid() {
        this.sprite.x = Math.round(this.sprite.x / this.tileSize) * this.tileSize + this.tileSize / 2;

        this.sprite.y = Math.round(this.sprite.y / this.tileSize) * this.tileSize + this.tileSize / 2;
    }

    update(time, delta){
        const dt = delta / 1000;

        if (this.isMoving) { // se esta se movendo continua
            this.moveToTarget(dt);
            return;
        }

        this.handleInput();
    }

    handleInput(){
        let dirX = 0;
        let dirY = 0;

        if (this.cursors.left.isDown || this.keys.a.isDown) {
            dirX = -1;
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            dirX = 1;
        } else if (this.cursors.up.isDown || this.keys.w.isDown) {
            dirY = -1;
        } else if (this.cursors.down.isDown || this.keys.s.isDown) {
            dirY = 1;
        }

        if (dirX === 0 && dirY === 0) return;

        this.tryMove(dirX, dirY);
    }
    
    tryMove(dirX, dirY) {
        const scene = this.scene;

        const currentTileX = Math.floor(this.sprite.x / this.tileSize);
        const currentTileY = Math.floor(this.sprite.y / this.tileSize);

        const targetTileX = currentTileX + dirX;
        const targetTileY = currentTileY + dirY;

        //verifica colisao com mapa
        if (scene.isTileBlocked(targetTileX, targetTileY)) return;

        const targetX = targetTileX * this.tileSize + this.tileSize / 2;
        const targetY = targetTileY * this.tileSize + this.tileSize / 2;

        this.moveTarget.set(targetX, targetY);
        this.isMoving = true;
    }

    moveToTarget(dt) {
        const dx = this.moveTarget.x - this.sprite.x;
        const dy = this.moveTarget.y - this.sprite.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
            this.sprite.x = this.moveTarget.x;
            this.sprite.y = this.moveTarget.y;
            this.isMoving = false;
            return;
        }

        this.sprite.x += (dx / dist) * this.speed * dt;
        this.sprite.y += (dy / dist) * this.speed * dt;
    }
}