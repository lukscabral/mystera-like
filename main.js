class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('player', 'assets/player.png');
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
    
    this.layer.setCollision([1]);  //parede = tile 1

    
    // player 
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setOrigin(0.5, 0.5);


    //camera
    this.cameras.main.setBounds(0,0, this.worldWidth,this.worldHeight);//camera recebe tamanho do mundo
    this.cameras.main.startFollow(this.player);//centraliza a camera no player
    this.facing = 'down'; //inicia o personagem olhando pra baixo

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
    this.player.x = Math.round(this.player.x / this.tileSize) * this.tileSize + this.tileSize / 2;
    this.player.y = Math.round(this.player.y / this.tileSize) * this.tileSize + this.tileSize / 2;
  }

  update(time, delta) {
    const dt = delta / 1000;

    let vx = 0;
    let vy = 0;

    if (this.isMoving){
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      //chegou no destino
      if (dist < 2) {
        this.player.x = this.moveTarget.x;
        this.player.y = this.moveTarget.y;
        this.isMoving = false;
        return;
      }

      //move ate o alvo
      this.player.x += (dx / dist) * this.speed * dt;
      this.player.y += (dy / dist) * this.speed * dt;

      return;
    }

    let dirX = 0;
    let dirY = 0;

    if (this.cursors.left.isDown || this.keys.a.isDown){
      dirX = -1;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      dirX = 1;
    } else if (this.cursors.up.isDown || this.keys.w.isDown) {
      dirY = -1;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      dirY = 1;
    } 
    if (dirX === 0 && dirY === 0) return;

    //posiçao atual alinhada ao grid
    const currentTileX = Math.floor(this.player.x / this.tileSize);
    const currentTileY = Math.floor(this.player.y / this.tileSize);

    //proximo tile
    const targetTileX = currentTileX + dirX;
    const targetTileY = currentTileY + dirY;

    //converter para posiçao em pixel
    const targetX = targetTileX * this.tileSize + this.tileSize / 2;
    const targetY = targetTileY * this.tileSize + this.tileSize / 2;

    //limites do mundo
    if (
      targetX < 0 || 
      targetY < 0 ||
      targetX >= this.worldWidth ||
      targetY >= this.worldHeight
    ) return;

    //verifica colisao antes de andar
    if (this.isTileBlocked(targetTileX, targetTileY)){
      return;//parede -> nao anda
    } 
    //se nao for parede permite andar
    this.moveTarget.set(targetX, targetY);
    this.isMoving = true;
  }

  isTileBlocked(tileX, tileY) {
    //fora do mapa = bloqueado
    if (
      tileX < 0 ||
      tileY < 0 ||
      tileX >= this.mapWidth ||
      tileY >= this.mapHeight 
    ) return true;
    //pega tile na posiçao
    const tile = this.layer.getTileAt(tileX, tileY);

    //tile 1 = parede
    return tile && tile.index === 1;
  }

}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      debug: true //enxergar colisoes
    }
  },
  scene: MainScene
};

new Phaser.Game(config);
