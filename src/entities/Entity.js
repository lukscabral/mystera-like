export default class Entity {
    constructor(scene, x, y, texture) {
        this.scene = scene;

        //cria sprite com physics
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setOrigin(0.5);
        
        //stats base
        this.maxHp = 100;
        this.hp = this.maxHp;

        this.isDead = false;

        //propriedades comuns
        // this.speed = 100;
        // this.facing = 'down';
        // this.isMoving = false;

        // renderizaçao padrao
        //this.sprite.setDepth(10);
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

    //sistema de vida
    takeDamage(amount) {
        if (this.isDead) return;

        this.hp -= amount;//hp = hp - amount

        console.log("Dano:", amount, "HP:", this.hp);

        this.scene.tweens.add({ //feedback visual
            targets: this.sprite,
            alpha: 0.3,
            duration: 80,
            yoyo: true
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

    die() {
        this.isDead = true;

        console.log("Entity morreu");

        //remove sprite
        this.sprite.destroy();
    }

    update(time, delta) {}
}