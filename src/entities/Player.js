import Entity from "./Entity.js";
import AttackHitbox from "./AttackHitbox.js";

export default class Player extends Entity {
    constructor(scene, x ,y) {
        super(scene, x, y, "player");
console.log("spawn sprite:", this.sprite.x, this.sprite.y);
console.log("tile calculado:", this.currentTile);
        this.speed = 150;//especifico do player

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.attackKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.attackCooldown = 0;
        this.attackRate = 300; //milisegundos / ms
        // this.invulnerable = false;
    }

    update(time, delta){
        if (this.isDead) return;

        this.attackCooldown -= delta;

        if (
            Phaser.Input.Keyboard.JustDown(this.attackKey) &&
            this.attackCooldown <= 0
        ) {
            this.attack();
            this.attackCooldown = this.attackRate;
        }

        this.handleInput();

        super.update(time, delta);
    }

    handleInput(){
        if (this.isMoving) return;

        if (this.cursors.left.isDown || this.keys.a.isDown) {
            this.facing = "left";
            this.tryMoveTile(-1, 0);

        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            this.facing = "right";
            this.tryMoveTile(1, 0);

        } else if (this.cursors.up.isDown || this.keys.w.isDown) {
            this.facing = "up";
            this.tryMoveTile(0, -1);

        } else if (this.cursors.down.isDown || this.keys.s.isDown) {
            this.facing = "down";
            this.tryMoveTile(0, 1);
        }

    }

    attack() {
        new AttackHitbox(
            this.scene,
            this.x,
            this.y,
            this.facing,
            this
        );

        this.playAttackAnimation();
    }

    playAttackAnimation() {
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 1.3,
            duration: 80,
            yoyo: true
        });
    }
}