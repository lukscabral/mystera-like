export default class AttackHitbox {
    constructor(scene, x, y, direction, owner) {
        this.scene = scene;
        this.owner = owner;

        const size = scene.tileSize;

        //cria hitbox invisivel
        this.sprite = scene.physics.add.sprite(x, y, null);
        this.sprite.setSize(size, size);
        this.sprite.setVisible(false);

        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setImmovable(true);

        //mover pra frente baseado na direçao
        this.offsetByDirection(direction, size);

        //detectar inimigo
        scene.physics.add.overlap(
            this.sprite,
            scene.enemy.sprite,
            () => {
                scene.enemy.takeDamage(10)
            }
        );

        //destruir depois de 150ms
        scene.time.delayedCall(150, () => this.destroy());

        //opcional debug visual
        if (scene.physics.world.drawDebug) {
            this.sprite.setVisible(true);
            this.sprite.setTint(0xff0000);
            this.sprite.setAlpha(0.3);
        }
    }

    offsetByDirection(direction, size) {
        if (direction === "left") this.sprite.x -= size;
        if (direction === "right") this.sprite.x += size;
        if (direction === "up") this.sprite.y -= size;
        if (direction === "down") this.sprite.y += size;
    }

    destroy() {
        this.sprite.destroy();
    }
}