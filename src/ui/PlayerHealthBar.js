export default class PlayerHealthBar {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.width = 200;
        this.height = 20;

        this.x = 20;// canto da tela
        this.y = 20;

        this.bar = scene.add.graphics();
        //fixa na camera hud
        this.bar.setScrollFactor(0);

        this.text = scene.add.text(this.x, this.y - 18, "HP", {
            fontSize: "16px",
            color: "#ffffff"
        });

        this.text.setScrollFactor(0);
        
        this.draw();
    }

    draw() {
        this.bar.clear();

        const hpPercent = Phaser.Math.Clamp(
            this.player.hp / this.player.maxHp,
            0, 
            1
        );

        //fundo
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        //vida
        this.bar.fillStyle(0x00ff00);
        this.bar.fillRect(
            this.x,
            this.y,
            this.width * hpPercent,
            this.height
        );
    }

    update() {
        this.draw();
    }
}