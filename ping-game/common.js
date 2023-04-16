class Vec {

  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // геттер, который получает гипотенузу, которую проходит мяч
  get len () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  // метод, который ограничивает длину гипотенузы
  set len (value) {
    let convert	= value / this.len;
    this.x *= convert;
    this.y *= convert;
  }

}

class Rect {

  constructor (w, h) {
    this.pos = new Vec();
    this.size = new Vec(w, h);
  }

  // ниже пишем геттеры сторон мяча, далее будут использоваться в ф-ии отрисовки
  get left () {
    return this.pos.x - this.size.x / 2;
  }
  get right () {
    return this.pos.x + this.size.x / 2;
  }
  get top () {
    return this.pos.y - this.size.y / 2;
  }
  get bottom () {
    return this.pos.y + this.size.y / 2;
  }

}

class Ball extends Rect{

  constructor () {
    super(10, 10);
    this.vel = new Vec();
  }

}

class Player extends Rect {

  constructor () {
    super(20, 100);
    this.score = 0;
  }

}

class Game {

  constructor (canvas) {
    this._canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // фикс бага с пролетом мяча:
    this._timeSumm = 0;
    this.step = 1/120; // FPS

    this.ball = new Ball();
    // создание массива игроков
    this.players = [
      new Player,
      new Player
    ];
    this.resetBallPos();

    let lastCall;
    const callback = (time) => {
      if (lastCall) {
        this.update((time - lastCall) / 1000);
        this.draw();
      }
      lastCall = time;
      requestAnimationFrame(callback);
    }
    callback();

    // цифры для счетчика:
    this.numberSide = 10;
    this.numbers = [
      '111101101101111',
      '010010010010010',
      '111001111100111',
      '111001111001111',
      '101101111001001',
      '111100111001111',
      '111100111101111',
      '111001001001001',
      '111101111101111',
      '111101111001111'
    ].map(str => {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      context.fillStyle = '#fff';
      str.split('').forEach( (isOne, i) => {
        if (isOne === '1') {
          context.fillRect(
            (i % 3) * this.numberSide,
            (i / 3 | 0) * this.numberSide,
            this.numberSide, this.numberSide);
        }
      });
      return canvas;
    });

  }

  resetBallPos () {
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
  }

  startGame () {
    if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
      // получение скорости
      this.ball.vel.x = 300 * (Math.random() < .5 ? 1 : -1);
      this.ball.vel.y = 300 * (Math.random() * 2 - 1);
      this.ball.vel.len = 500;
    }
  }

  draw () {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawRect(this.ball)

    this.players[0].pos.x = 40;
    this.players[1].pos.x = this._canvas.width - 40;
    for (var i = 0; i < this.players.length; i++) {
      this.drawRect(this.players[i]);
    }
    this.players[1].pos.y = this.ball.pos.y;

    this.drawScore();
  }

  drawScore () {
    let numberWidth = this.numberSide * 4; // ширина одной цифры
    let align = this._canvas.width / 3;

    this.players.forEach( (player, index) => {
      let chars = player.score.toString().split('');
      let posX = align * (index + 1) - numberWidth * chars.length / 2;
      chars.forEach( (number, index) => {
        this.ctx.drawImage(this.numbers[number], posX + index * numberWidth, 20);
      });
    });
  }

  drawRect (el) {
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(el.left, el.top, el.size.x, el.size.y);
  }

  // ф-я отражения мяча от балок
  checkBounce (player, ball) {
    if (ball.left < player.right && ball.top < player.bottom &&
        ball.bottom > player.top && ball.right > player.left) {
      ball.vel.x *= -1;
      // каждый раз меняем ball.vel.y:
      ball.vel.y += 300 * (Math.random() - .5);
      // каждый раз при отбивании прибавляем скорость мячу
      // ball.vel.x *= 1.05;
      // вместо скорости каждый раз увеличиваем расстояние гипотенузы:
      ball.vel.len *= 1.05;
    }
  }

  simulate (td) {
    this.ball.pos.x += this.ball.vel.x * td;
    this.ball.pos.y += this.ball.vel.y * td;

    if (this.ball.left < 0 || this.ball.right > canvas.width) {
      // console.log(this.ball.vel);
      this.players[1].score++;
      this.resetBallPos();
    }
    if (this.ball.top < 0 || this.ball.bottom > canvas.height) {
      this.ball.vel.y *= -1;
    }

    for (var i = 0; i < this.players.length; i++) {
      this.checkBounce(this.players[i], this.ball);
    }
  }

  // добавляем ф-ю чтобы убрать баг пролета мяча за балку, когда скорость слишком высокая
  update (dt) {
    // каждый вызов прибавляем в этому св-ву значение параметра (времени)
    this._timeSumm += dt;
    while (this._timeSumm > this.step) {
      this.simulate(this.step);
      // перед тем как закончить выполнение ф-ии вычитаем из пер-ой накопления один шаг
      this._timeSumm -= this.step;
    }
  }
}

let canvas = document.getElementById('game');

let game = new Game(canvas);

canvas.addEventListener('mousemove', event => {
  let scale = event.offsetY / event.target.getBoundingClientRect().height;
  game.players[0].pos.y = canvas.height * scale;
})

canvas.addEventListener('click', () => {
  game.startGame();
});
