export default class HealthBar {
    constructor(scene, entity) {
        this.scene = scene;
        this.entity = entity;

        this.width = 32;
        this.height = 5;

        this.bar = scene.add.graphics();
        this.bar.setDepth(100);
    }

    update() {
        if (!this.entity || this.entity.isDead) {
            // this.bar.destroy();
            return;
        }

        const hpPercent = Phaser.Math.Clamp(
            this.entity.hp / this.entity.maxHp,
            0,
            1
        );

        const x = this.entity.x - this.width / 2;
        const y = this.entity.y - 25;

        this.bar.clear();

        //fundo
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(x, y, this.width, this.height);

        //vida
        this.bar.fillStyle(0xff0000);
        this.bar.fillRect(x, y, this.width * hpPercent, this.height);
    }

    destroy() {
        this.bar.destroy();
    }
}