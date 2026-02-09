class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // nada por enquanto
  }

  create() {

    //tilesets / tamanho do mundo
    this.tileSize = 32;
    this.mapWidth = 50;
    this.mapHeight = 50;

    this.worldWidth = this.mapWidth * this.tileSize;
    this.worldHeight = this.mapHeight * this.tileSize;

    //mapa
    const mapData = [];

    for (let y = 0; y < this.mapHeight; y++){
        const row = [];
        for (let x = 0; x < this.mapWidth; x++){
            row.push((x+y) % 2); //padrao quadrado
        }
        mapData.push(row);
    }

    this.map = this.make.tilemap({
        data: mapData,
        tileWidth: this.tileSize,
        tileHeight: this.tileSize
    });

    const graphics = this.make.graphics({ x: 0,y: 0, add: false});
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 0, 32, 32);

    graphics.fillStyle(0x444444, 1);
    graphics.fillRect(32, 0, 32, 32);

    graphics.generateTexture('tiles', 64, 32);
    graphics.destroy();
    
    const tileset = this.map.addTilesetImage('tiles');
    this.layer = this.map.createLayer(0, tileset, 0, 0);

    // cria o player (posiçao x,y / dimensao do player / cor do player)
    this.player = this.add.rectangle(100, 100, 20, 20, 0x00ff00);
    this.cameras.main.setBounds(0,0, this.worldWidth,this.worldHeight);//camera recebe tamanho do mundo
    this.cameras.main.startFollow(this.player);
    // this.cameras.main.setDeadzone(100,100); 

    // velocidade
    this.speed = 150;

    // teclado
    this.cursors = this.input.keyboard.createCursorKeys();//setas

    this.keys = this.input.keyboard.addKeys({ //wasd
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update(time, delta) {
    const dt = delta / 1000;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.keys.a.isDown) vx = -1;
    if (this.cursors.right.isDown || this.keys.d.isDown) vx = 1;
    if (this.cursors.up.isDown || this.keys.w.isDown) vy = -1;
    if (this.cursors.down.isDown || this.keys.s.isDown) vy = 1;

    //normaliza velocidade do vetor
    if(vx !== 0 || vy !== 0){
        const length = Math.sqrt(vx * vx + vy * vy);
        vx /= length;
        vy /= length;
    }
    this.player.x += vx * this.speed * dt;
    this.player.y += vy * this.speed * dt;

    const half = 10;//metade do tamanho do player

    // limite horizontal
    this.player.x = Phaser.Math.Clamp(
        this.player.x,
        half,
        this.worldWidth - half
    );
    //limite vertical
    this.player.y = Phaser.Math.Clamp(
        this.player.y,
        half,
        this.worldHeight - half
    );  
  }  
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: MainScene
};

new Phaser.Game(config);
