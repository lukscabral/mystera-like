export default class CombatSystem {
    static meleeattack(attacker, damage) {

        const { x, y } = attacker.currentTile;

        let targetX = x;
        let targetY = y;

        switch (attacker.facing) {
            case "right": targetX += 1; break;
            case "left": targetX -= 1; break;
            case "up": targetY -= 1; break;
            case "down": targetY += 1; break;
        }

        const key = `${targetX}, ${targetY}`;
        const target = attacker.scene.grid.occupied.get(key);

        if (target && target !== attacker) {
            target.takeDamage(damage);
        }
    }
}