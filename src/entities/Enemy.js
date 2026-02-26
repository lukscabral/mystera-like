import Entity from "./Entity.js";
import HealthBar from "../ui/HealthBar.js";
import ItemFactory from "../systems/ItemFactory.js";
import ItemEntity from "./ItemEntity.js";


export default class Enemy extends Entity {
    constructor(scene, x, y, player) {
        super(scene, x, y, "enemy");

        this.player = player;

        this.maxHp = 20;
        this.hp = this.maxHp;
        this.healthBar = new HealthBar(scene, this);

        this.speed = 30;
        this.detectRange = 150;
        this.attackRange = 30;
        this.attackCooldown = 0;
        this.attackRate = 600;
        this.damage = 10;

        this.state = "idle";
        this.stateTimer = 0;

        this.direction = new Phaser.Math.Vector2(0, 0);

    }

    update(time, delta) {
        
        if (this.isDead) return;
        
        const dt = delta / 1000;
        this.stateTimer -= dt;

        this.attackCooldown -= delta;
        this.handleAI();
        super.update(time, delta);

        switch (this.state) {
            case "idle":
                this.updateIdle();
                break;

            case "wander":
                this.updateWander(dt);
                break;
            
            case "chase":
                this.updateChase(dt);
                break;
        }

        this.checkPlayerDistance();

        this.updateMovement(dt);

        this.healthBar.update();
    }

    updateIdle() {
        if (this.stateTimer <= 0){
            this.startWander();
        }
    }

    startWander() {
        this.state = "wander";
        this.stateTimer = Phaser.Math.Between(1, 3);

        this.direction.set(
            Phaser.Math.RND.pick([-1, 0, 1]),
            Phaser.Math.RND.pick([-1, 0, 1])
        );
    }

    updateWander(){

        if (this.isMoving) return;

        this.tryMoveTile(this.direction.x, this.direction.y);

        if (this.stateTimer <= 0) {
            this.state = "idle";
            this.stateTimer = Phaser.Math.Between(1, 2);
        }
    }

    updateChase(dt){ 

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dx) > Math.abs(dy)) {
            this.tryMoveTile(Math.sign(dx), 0);
        } else {
            this.tryMoveTile(0, Math.sign(dy));
        }

        if (dist === 0) return;

        if (dist > this.detectRange) {
            this.state = "idle";
            return;
        }


        if (!this.isMoving) {
            if (Math.abs(dx) > Math.abs(dy)) {
                this.moveDirection(Math.sign(dx), 0);
            } else {
                this.moveDirection(0, Math.sign(dy));
            }
        }
    
        //dano ao encostar
        if (dist < this.attackRange) {
            this.player.takeDamage(10);
        }
    }

    //detecçao
    checkPlayerDistance() {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.detectRange && this.state !== "chase") {
            this.state = "chase";
        }
    }

    die() {
        
        
        const drop = ItemFactory.create("small_potion", 1);

        if (drop) {
            new ItemEntity(
                this.scene,
                this.sprite.x,
                this.sprite.y,
                drop
            );
        }

        super.die();
 
        if (this.healthBar) {
            this.healthBar.destroy();
        }  
        
    }

    handleAI() {
        if (this.isMoving) return;

        const playerTile = this.scene.player.currentTile;
        const myTile = this.currentTile;

        const dx = playerTile.x - myTile.x;
        const dy = playerTile.y - myTile.y;

        const distance = Math.abs(dx) + Math.abs(dy);

        //encostou atacou
        if (distance === 1) {
            this.tryAttack();
            return;
        }

        //nao encostou tenta encostar indo em direçao ao player
        if (Math.abs(dx) > Math.abs(dy)) {
            this.tryMoveTile(Math.sign(dx), 0);
        } else {
            this.tryMoveTile(0, Math.sign(dy));
        }
    }

    tryAttack() {
        if (this.attackCooldown > 0) return;

        this.scene.player.takeDamage(this.damage);
        this.attackCooldown = this.attackRate;

        this.playAttackAnimation();
    }

    playAttackAnimation(){
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 1.2,
            duration: 80,
            yoyo: true
        });
    }
}
