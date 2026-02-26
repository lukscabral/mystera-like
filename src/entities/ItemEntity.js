export default class ItemEntity {

    constructor(scene, x, y, itemData){
        this.scene = scene;
        this.itemData = itemData;

        this.sprite = scene.physics.add.sprite(x, y,itemData.sprite).setDepth(1);

        this.sprite.setData("itemEntity", this);

        //nao colide
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setImmovable(true);

        //add em lista propria
        scene.itemsGroup.add(this.sprite);
    }

    destroy() {
        this.sprite.destroy();
        this.scene.items = this.scene.items.filter(i => i !== this);
    }
}