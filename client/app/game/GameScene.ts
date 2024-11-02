class GameScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  lasers!: Phaser.Physics.Arcade.Group;
  cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  score!: number;
  scoreText!: Phaser.GameObjects.Text;
  lastPlatformX!: number;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("laser", "/blocks/laser.png");
    this.load.image("player", "/player/player.png");
  }

  create() {
    // ---User
    this.player = this.physics.add.sprite(20, 100, "player");
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setScrollFactor(1, 0);

    this.cursor = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as Phaser.Types.Input.Keyboard.CursorKeys;

    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      color: "#ffffff",
    });
    this.scoreText.setScrollFactor(0);

    this.cameras.main.setBounds(-Infinity, 0, Infinity, 400);
    this.cameras.main.startFollow(this.player);

    this.physics.world.setBounds(-Infinity, 0, this.player.x + 500, 400);
    this.player.setVelocityX(200);

    // ---Blocks

    this.lasers = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    const initialLasers = 1;
    let laserX = 500;

    for (let i = 0; i < initialLasers; i++) {
      const x = laserX;
      const y = Phaser.Math.Between(60, 340);

      this.createLaser(x, y);
      laserX += Phaser.Math.Between(300, 500);
    }

    this.lastPlatformX = laserX;
    this.physics.add.collider(
      this.player,
      this.lasers,
      this.playerTouchLaser,
      undefined,
      this
    );
  }

  update() {
    // ---Player
    if (this.cursor.up.isDown || this.cursor.space.isDown) {
      this.player.setVelocityY(-180);
    } else {
      this.player.setVelocityY(180);
    }

    const currentScore = Math.max(this.score, Math.floor(this.player.x - 20));
    if (currentScore !== this.score) {
      this.score = currentScore;
      this.scoreText.setText("Score: " + this.score);
    }

    // ---Blocks
    console.log(this.player.x + "-" + this.lastPlatformX);

    if (this.player.x > this.lastPlatformX) {
      this.addLaser(this.player.x);
    }
  }

  createLaser(x: number, y: number) {
    const laser = this.lasers.create(
      x,
      y,
      "laser"
    ) as Phaser.Physics.Arcade.Sprite;

    laser.body!.checkCollision.up = true;
    laser.body!.checkCollision.down = true;
    laser.body!.checkCollision.left = true;
    laser.body!.checkCollision.right = true;
    laser.setImmovable(true);
    laser.setBounce(0);
  }

  playerTouchLaser(player: any, laser: any) {
    console.log("Тронул");
    this.scene.restart();
  }

  addLaser(playerX: number) {
    const laserGap = Phaser.Math.Between(400, 650);
    const minY = 60;
    const maxY = 340;

    const x = playerX + laserGap;
    const y = Phaser.Math.Between(minY, maxY);

    this.createLaser(x, y);
    this.lastPlatformX += laserGap;
  }
}

export default GameScene;
