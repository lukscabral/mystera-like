import Entity from "./Entity.js";

export default class Player extends Entity {
    constructor(scene, x ,y) {
        super(scene, x, y, "player");

        this.speed = 150;//especifico do player

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        //alinhar ao grid
        // this.alignToGrid();
        // this.invulnerable = false;
    }

    update(time, delta){
        if (this.isDead) return;

        // const dt = delta / 1000;

        // this.updateMovement(dt);

        // if (this.isMoving) return;    

        this.handleInput();
        super.update(time, delta);
    }

    handleInput(){
        if (this.isMoving) return;

        if (this.cursors.left.isDown || this.keys.a.isDown) {
            this.tryMoveTile(-1, 0);
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            this.tryMoveTile(1, 0);
        } else if (this.cursors.up.isDown || this.keys.w.isDown) {
            this.tryMoveTile(0, -1);
        } else if (this.cursors.down.isDown || this.keys.s.isDown) {
            this.tryMoveTile(0, 1);
        }

        // if (dirX === 0 && dirY === 0) return;

        // this.moveDirection(dirX, dirY);

    }

}