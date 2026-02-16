import Player from '../entities/Player.js';


export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');    
  }
  
  preload() {
    this.load.image('player', './assets/player.png');
  }

  create() {
    
    
    //configuraçao do mundo
    this.tileSize = 32;
    this.mapWidth = 50;
    this.mapHeight = 50;

    this.worldWidth = this.mapWidth * this.tileSize;
    this.worldHeight = this.mapHeight * this.tileSize;

    //mapa gerado aleatoriamente
    const mapData = [];
    
    for (let y = 0; y < this.mapHeight; y++){
        const row = [];
        for (let x = 0; x < this.mapWidth; x++){
          if(
            x === 0 ||
            y === 0 ||
            x === this.mapWidth - 1 ||
            y === this.mapHeight -1
          ) {
            row.push(1);
          } else if (Math.random() < 0.08){
            row.push(1);
          } else {
            row.push(0);
          }
          
        }
        mapData.push(row);
    }

    this.map = this.make.tilemap({
        data: mapData,
        tileWidth: this.tileSize,
        tileHeight: this.tileSize,
        width: this.mapWidth,
        height: this.mapHeight
    });

    //tileset procedural
    const graphics = this.make.graphics({ x: 0,y: 0, add: false});
    graphics.fillStyle(0x2d6a4f, 1);
    graphics.fillRect(0, 0, 32, 32);

    graphics.fillStyle(0x6c757d, 1);
    graphics.fillRect(32, 0, 32, 32);

    graphics.generateTexture('tiles', 64, 32);
    graphics.destroy();
    
    const tileset = this.map.addTilesetImage('tiles');
    this.layer = this.map.createLayer(0, tileset, 0, 0);
    this.layer.setDepth(0);//ordem z-index
    this.layer.setCollision([1]);  //parede = tile 1

    //player
    this.player = new Player(this, 100, 100);
    

    //camera
    this.cameras.main.setBounds(0,0, this.worldWidth,this.worldHeight);//camera recebe tamanho do mundo
    this.cameras.main.startFollow(this.player.sprite);//centraliza a camera no player
    // this.facing = 'down'; //inicia o personagem olhando pra baixo - tem no entity

    // controles
    this.speed = 150;// velocidade

    this.cursors = this.input.keyboard.createCursorKeys();//setas

    this.keys = this.input.keyboard.addKeys({ //wasd
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D
    });
    //controle de movimento
    this.isMoving = false;
    this.moveDirection = null;
    //animaçao(placeholder)
    this.anims.create({
      key: 'walk-down',
      frames: [{ key: 'player'}],
      frameRate: 8,
      repeat: -1
    });

    //move por tile

    this.moveTarget = new Phaser.Math.Vector2();

    //força o player a alinhar ao grid
    this.player.sprite.x = Math.round(this.player.sprite.x / this.tileSize) * this.tileSize + this.tileSize / 2;
    this.player.sprite.y = Math.round(this.player.sprite.y / this.tileSize) * this.tileSize + this.tileSize / 2;

  }

  update(time, delta) {

    this.player.update(time, delta);

    //teste espaço tira vida
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.player.takeDamage(10);
    }
  }
  
  isTileBlocked(tileX, tileY) {
    if (
      tileX < 0 ||
      tileY < 0 ||
      tileX >= this.mapWidth ||
      tileY >= this.mapHeight
    ) return true;

    const tile = this.layer.getTileAt(tileX, tileY);
    return tile && tile.index === 1;
  }
}
