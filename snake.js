class SnakeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.gridSize = 20;
    this.tileCount = 20;
    this.canvasSize = 400;

    this.initDOM();
    this.resetGame();
    this.bindEvents();

    this.gameLoop = setInterval(() => this.update(), 120);
  }

  // Inject Canvas & Mobile Controls into target container
  initDOM() {
    this.container.innerHTML = `
      <div class="snake-game-wrapper">
        <div class="snake-score">Score: <span id="snake-score-val">0</span></div>
        <canvas id="snake-canvas" width="${this.canvasSize}" height="${this.canvasSize}"></canvas>
        <div class="controls-container">
          <button class="btn-control btn-up" id="btn-up">▲</button>
          <button class="btn-control btn-left" id="btn-left">◄</button>
          <button class="btn-control btn-right" id="btn-right">►</button>
          <button class="btn-control btn-down" id="btn-down">▼</button>
        </div>
      </div>
    `;
    this.canvas = document.getElementById("snake-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.scoreEl = document.getElementById("snake-score-val");
  }

  resetGame() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    this.dx = 0;
    this.dy = -1;
    this.nextDx = 0;
    this.nextDy = -1;
    this.score = 0;
    this.gameOver = false;
    this.spawnFood();
    this.scoreEl.textContent = this.score;
  }

  spawnFood() {
    this.food = {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount)
    };
    for (let part of this.snake) {
      if (part.x === this.food.x && part.y === this.food.y) {
        this.spawnFood();
        break;
      }
    }
  }

  bindEvents() {
    // Keyboard Controls
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    // Mobile D-Pad Buttons
    document.getElementById("btn-up").addEventListener("click", () => this.setDirection(0, -1));
    document.getElementById("btn-down").addEventListener("click", () => this.setDirection(0, 1));
    document.getElementById("btn-left").addEventListener("click", () => this.setDirection(-1, 0));
    document.getElementById("btn-right").addEventListener("click", () => this.setDirection(1, 0));

    // Touch Swipe Controls on Canvas
    let touchStartX = 0, touchStartY = 0;
    this.canvas.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.canvas.addEventListener("touchend", (e) => {
      let diffX = e.changedTouches[0].clientX - touchStartX;
      let diffY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) this.setDirection(1, 0);
        else if (diffX < -30) this.setDirection(-1, 0);
      } else {
        if (diffY > 30) this.setDirection(0, 1);
        else if (diffY < -30) this.setDirection(0, -1);
      }
    }, { passive: true });
  }

  setDirection(dx, dy) {
    if (dx !== 0 && this.dx !== -dx) {
      this.nextDx = dx;
      this.nextDy = 0;
    }
    if (dy !== 0 && this.dy !== -dy) {
      this.nextDx = 0;
      this.nextDy = dy;
    }
  }

  handleKeyPress(e) {
    switch (e.key) {
      case "ArrowUp": case "w": case "W": this.setDirection(0, -1); break;
      case "ArrowDown": case "s": case "S": this.setDirection(0, 1); break;
      case "ArrowLeft": case "a": case "A": this.setDirection(-1, 0); break;
      case "ArrowRight": case "d": case "D": this.setDirection(1, 0); break;
    }
  }

  update() {
    if (this.gameOver) return;

    this.dx = this.nextDx;
    this.dy = this.nextDy;

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Wall Collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.triggerGameOver();
      return;
    }

    // Self Collision
    for (let part of this.snake) {
      if (head.x === part.x && head.y === part.y) {
        this.triggerGameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // Food Collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.scoreEl.textContent = this.score;
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  triggerGameOver() {
    this.gameOver = true;
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#fff";
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 2 - 10);
    this.ctx.font = "16px Arial";
    this.ctx.fillText("Tap screen to restart", this.canvas.width / 2, this.canvas.height / 2 + 20);

    const restart = () => {
      this.resetGame();
      window.removeEventListener("keydown", restart);
      this.canvas.removeEventListener("click", restart);
      this.canvas.removeEventListener("touchstart", restart);
    };

    setTimeout(() => {
      window.addEventListener("keydown", restart, { once: true });
      this.canvas.addEventListener("click", restart, { once: true });
      this.canvas.addEventListener("touchstart", restart, { once: true });
    }, 300);
  }

  draw() {
    // Clear background
    this.ctx.fillStyle = "#181818";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Food
    this.ctx.fillStyle = "#e74c3c";
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw Snake
    this.snake.forEach((part, index) => {
      this.ctx.fillStyle = index === 0 ? "#2ecc71" : "#27ae60";
      this.ctx.fillRect(
        part.x * this.gridSize + 1,
        part.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });
  }
}

// Auto-initialize when container with id "snake-container" exists
window.loadSnakeGame = function(container){

    container.innerHTML = `
        <div id="snake-container"></div>
    `;

    new SnakeGame("snake-container");

};