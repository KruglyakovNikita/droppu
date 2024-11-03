"use client";

import Phaser from "phaser";

const PLAYER_SPEED = 200;
const LASER_GAP_MIN = 400;
const LASER_GAP_MAX = 650;

const MAX_ASCENT_SPEED = -300; // Максимальная скорость подъёма
const MAX_DESCENT_SPEED = 300; // Максимальная скорость падения
const ASCENT_ACCELERATION = -20; // Ускорение вверх при удержании
const DESCENT_ACCELERATION = 20; // Ускорение вниз при падении

class GameScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  lasers!: Phaser.Physics.Arcade.Group;
  cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  score!: number;
  scoreText!: Phaser.GameObjects.Text;
  lastPlatformX!: number;
  lastBoundsUpdateX: number = 0;

  PLAYER_SPEED = 200;
  LASER_GAP_MIN = 400;
  LASER_GAP_MAX = 650;

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

    this.physics.world.setBounds(0, 0, 2500, 400);
    this.player.setVelocityX(PLAYER_SPEED);

    // ---Blocks

    this.lasers = this.physics.add.group({
      allowGravity: false,
      immovable: true,
      // maxSize: 10,
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

    // this.time.addEvent({
    //   delay: Phaser.Math.Between(3000, 5000), // Задержка между лазерами в миллисекундах
    //   callback: this.addLaser,
    //   callbackScope: this,
    //   loop: true,
    // });
  }

  update() {
    //JetPack physic
    if (this.cursor.up.isDown || this.cursor.space.isDown) {
      // Ускоряем подъём при удержании кнопки
      this.player.setVelocityY(
        Phaser.Math.Clamp(
          this.player.body.velocity.y + ASCENT_ACCELERATION,
          MAX_ASCENT_SPEED,
          0
        )
      );
    } else {
      // Ускоряем падение, если кнопка не нажата
      this.player.setVelocityY(
        Phaser.Math.Clamp(
          this.player.body.velocity.y + DESCENT_ACCELERATION,
          0,
          MAX_DESCENT_SPEED
        )
      );
    }

    // ---Player

    const currentScore = Math.max(this.score, Math.floor(this.player.x - 20));
    if (currentScore !== this.score) {
      this.score = currentScore;
      this.scoreText.setText("Score: " + this.score);
    }

    // ---Blocks
    // console.log(this.player.x + "-" + this.lastPlatformX);

    if (this.player.x > this.lastPlatformX) {
      this.addLaser();
    }

    //Map

    if (this.lastBoundsUpdateX - this.player.x <= 1000) {
      const leftBound = this.player.x - 500;
      const rightBound = this.player.x + 1500;
      this.physics.world.setBounds(leftBound, 0, rightBound, 400);
      this.lastBoundsUpdateX = rightBound; // Обновляем позицию последнего обновления
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
    this.physics.pause();
    player.setTint(0xff0000);

    // Restart after a delay
    this.time.delayedCall(
      1000,
      () => {
        this.scene.restart();
      },
      [],
      this
    );
  }

  addLaser() {
    const laserGap = Phaser.Math.Between(LASER_GAP_MIN, LASER_GAP_MAX);
    const minY = 60;
    const maxY = 340;

    const x = this.lastPlatformX + laserGap;
    const y = Phaser.Math.Between(minY, maxY);

    this.createLaser(x, y);
    this.lastPlatformX += laserGap;
  }
}

export default GameScene;
