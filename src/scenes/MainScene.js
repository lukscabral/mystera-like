import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import PlayerHealthBar from '../ui/PlayerHealthBar.js';
import GridManager from '../systems/GridManager.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');    
  }
  
  preload() {
    this.load.image('player', './assets/player.png');
    this.load.image('enemy', './assets/enemy.png');
  }

  create() {
    
    //configuraçao do mundo
    this.tileSize = 32;
    this.mapWidth = 22;
    this.mapHeight = 22;

    this.worldWidth = this.mapWidth * this.tileSize;
    this.worldHeight = this.mapHeight * this.tileSize;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

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

    this.grid = new GridManager(this);

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

    this.entities = [];
    const tileX = 3;
    const tileY = 3;

    const worldX = tileX * this.tileSize + this.tileSize / 2;
    const worldY = tileY * this.tileSize + this.tileSize / 2;
    
    //player
    this.player = new Player(this, worldX, worldY);
    this.playerHealthBar = new PlayerHealthBar(this, this.player);
    //enemy
    this.enemy = new Enemy(this, 200, 200, this.player);
 
    this.entities.push(this.player);
    this.entities.push(this.enemy);

    this.physics.add.overlap(
      this.player.sprite,
      this.enemy.sprite,
      this.handlePlayerEnemyCollision,
      null,
      this
    );

    //camera
    this.cameras.main.setBounds(0,0, this.worldWidth,this.worldHeight);//camera recebe tamanho do mundo
    this.cameras.main.startFollow(this.player.sprite);//centraliza a camera no player
  

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


  }

  update(time, delta) {

    if (!this.player.isDead){
      this.player.update(time, delta);
    }
      this.enemy.update(time, delta);

      this.playerHealthBar.update();
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

  handlePlayerEnemyCollision(playerSprite, enemySprite) {
    this.player.takeDamage(10);
  }

  getEntityAtTile(tileX, tileY) {
    return this.occupiedTiles.get(`${tileX}, ${tileY}`) || null;
  }
}
