import Entity from "./Entity.js";
import AttackHitbox from "./AttackHitbox.js";
import CombatSystem from "../systems/CombatSystem.js";
import InventorySystem from "../systems/InventorySystem.js";

export default class Player extends Entity {
    constructor(scene, x ,y) {
        super(scene, x, y, "player");

        //progressao
        //========================
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.unspentPoints = 0;

        //atributos base

        this.baseAttributes = {
            strength: 5,
            dexterity: 5,
            vitality: 5,
            intelligence: 5
        };

        //bonus de equipamento
        this.bonusAttributes = {
            strength: 0,
            dexterity: 0,
            vitality: 0,
            intelligence: 0
        };

        //calculos finais
        this.finalAttributes = {};
        this.derivedStats = {};

        this.recalculateStats();

        //========================

        //equips
        this.equipment = {
            weapon: null,
            helmet: null,
            armor: null,
            boots: null,
            ring: null
        }

        this.inventory = new InventorySystem(this, 20);

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

        this.spawnSwordArc();

        this.scene.time.delayedCall(90, () => {
            // this.applyTileDamage();
            CombatSystem.meleeattack(this, 10);
        });

        this.playAttackAnimation();
    }

    spawnSwordArc() {
        const radius = 24;

        const sword = this.scene.add.sprite(
            this.sprite.x,
            this.sprite.y,
            "sword"
        );

        sword.setDepth(20);
        sword.setOrigin(0.5, 1)// base da espada no cabo

        let startAngle = 0;
        let endAngle = 0;

        switch (this.facing) {
            case "right":
                startAngle = -60;
                endAngle = 60;
                break;

            case "left":
                startAngle = 120;
                endAngle = 240;
                break;

            case "up":
                startAngle = 210;
                endAngle = 330;
                break;

            case "down":
                startAngle = 30;
                endAngle = 150;
                break;
        }

        sword.angle = startAngle;

        this.scene.tweens.add({
            targets: sword,
            angle: endAngle,
            duration: 180,
            ease: "Cubic.easeOut",
            onUpdate: () => {
                const rad = Phaser.Math.DegToRad(sword.angle);

                sword.x = this.sprite.x + Math.cos(rad) * radius;
                sword.y = this.sprite.y + Math.sin(rad) * radius;
            },
            onComplete: () => sword.destroy()
        });
    }

    applyTileDamage() {
        const { x, y } = this.currentTile;

        let targetX = x;
        let targetY = y;

        switch (this.facing) {
            case "right":
                targetX += 1;
                break;

            case "left":
                targetX -= 1;
                break;

            case "up":
                targetY -= 1;
                break;

            case "down":
                targetY += 1;
                break;
        }

        const enemy = this.scene.grid.occupied.get(`${targetX}, ${targetY}`);

        if (enemy && enemy !== this) {
            enemy.takeDamage(10);
        }
    }

    playAttackAnimation() {
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 1.3,
            duration: 80,
            yoyo: true
        });
    }

    gainXP(amount) {
        this.experience += amount;

        while (this.experience >= this.experienceToNextLevel) {
            this.experience -= this.experienceToNextLevel;
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.unspentPoints += 3;

        this.experienceToNextLevel = Math.floor(
            this.experienceToNextLevel * 1.25
        );

        this.recalculateStats();
    }

    addAttributePoint(attribute) {
        if (this.unspentPoints <= 0) return;
        if (!this.baseAttributes.hasOwnProperty(attribute)) return;

        this.baseAttributes[attribute]++;
        this.unspentPoints--;

        this.recalculateStats();
    }

    recalculateStats() {

        this.updateBonusAttributes();

        //base + bonus
        for (let key in this.baseAttributes) {
            this.finalAttributes[key] = this.baseAttributes[key] + this.bonusAttributes[key];
        }

        const str = this.finalAttributes.strength;
        const dex = this.finalAttributes.dexterity;
        const vit = this.finalAttributes.vitality;
        const int = this.finalAttributes.intelligence;

        //atributos derivados
        this.derivedStats.attack = str * 2;
        this.derivedStats.defense = vit * 1.5;
        this.derivedStats.MaxHealth = vit * 10;
        this.derivedStats.critChance = dex * 0.5;

        this.maxHp = this.derivedStats.MaxHealth;

        //atualiza vida se necessario
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    updateBonusAttributes() {
        //resetar bonus
        for (let key in this.bonusAttributes) {
            this.bonusAttributes[key] = 0;
        }

        //somar stats de cada equip
        for (let slot in this.equipment) {
            const item = this.equipment[slot];

            if (item && item.stats) {
                for (let stat in item.stats) {
                    if (this.bonusAttributes.hasOwnProperty(stat)) {
                        this.bonusAttributes[stat] += item.stats[stat];
                    }
                }
            }
        }
    }

    equipItem(item) {
        const slot = item.type;

        if (!this.equipment.hasOwnProperty(slot)) return;

        this.equipment[slot] = item;
        this.recalculateStats();
    }

    unequipItem(slot) {
        if (!this.equipment[slot]) return;

        this.equipment[slot] = null;

        this.recalculateStats();
    }
}