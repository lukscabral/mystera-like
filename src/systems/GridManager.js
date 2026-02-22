export default class GridManager {
    constructor(scene) {
        this.scene = scene;

        //x,y entity
        this.occupied = new Map();

        //tile reservado durante movimento
        this.reserved = new Set();
    }

    key(x, y) {
        return `${x}, ${y}`;
    }

    //verifica se tile é valido
    isBlocked(x, y) {
        return this.scene.isTileBlocked(x, y);
    }

    //tile ocupado por entidade viva
    isOccupied(x, y) {
        return this.occupied.has(this.key(x, y));
    }

    //tile reservado
    isReserved(x, y) {
        return this.reserved.has(this.key(x, y));
    }

    //coloca entidade no tile
    place(entity, x, y) {
        this.occupied.set(this.key(x, y), entity);
    }

    //remove entidade do tile
    remove(x, y) {
        this.occupied.delete(this.key(x, y));
    }

    reserve(x, y) {
        this.reserved.add(this.key(x, y));
    }

    release(x, y) {
        this.reserved.delete(this.key(x, y));
    }

    //tentar mover entidade
    tryMove(entity, fromX, fromY, toX, toY) {
        if (this.isBlocked(toX, toY)) return false;
        if (this.isOccupied(toX, toY)) return false;
        if (this.isReserved(toX, toY)) return false;

        this.reserve(toX, toY);

        // entity.previousTile = { x: fromX, y: fromY };
        // entity.targetTile = { x: toX, y: toY };

        return true;
    }

    //finalizar movimento
    finishMove(entity) {

        if (entity.isDead) return;

        const old = entity.previousTile;
        const target = entity.targetTile;

        if (old) this.remove(old.x, old.y);

        if (target) {
            this.place(entity, target.x, target.y);
            this.release(target.x, target.y);

            entity.currentTile = { x: target.x, y: target.y };
        }

        entity.previousTile = null;
        entity.targetTile = null;
    }

    //remover entidade completamente(kill)
    removeEntity(entity) {

        // if (entity.previousTile) {
        //     this.remove(entity.previousTile.x, entity.previousTile.y);
        // } else { 
        //     const { x, y } = entity.getTilePosition();
        //     this.remove(x, y);
        // }

        const { x, y } = entity.currentTile;

        this.remove(x, y);
        
        if (entity.targetTile) {
            this.release(entity.targetTile.x, entity.targetTile.y);
        }


    }
}