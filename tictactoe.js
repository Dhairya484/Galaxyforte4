class TicTacToeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.boardState = Array(9).fill(null);
    this.currentPlayer = "X";
    this.gameActive = true;
    this.vsCPU = true;
    this.scores = { X: 0, O: 0, ties: 0 };

    this.winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    this.initDOM();
    this.bindEvents();
    this.updateStatus();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="ttt-wrapper">
        <div class="ttt-mode-select">
          <button class="ttt-mode-btn active" id="ttt-mode-cpu">vs CPU</button>
          <button class="ttt-mode-btn" id="ttt-mode-pvp">2 Player</button>
        </div>

        <div class="ttt-scoreboard">
          <div class="ttt-score-box"><span>Player (X)</span><span class="ttt-score-num" id="ttt-score-x">0</span></div>
          <div class="ttt-score-box"><span>Ties</span><span class="ttt-score-num" id="ttt-score-ties">0</span></div>
          <div class="ttt-score-box"><span id="ttt-label-o">CPU (O)</span><span class="ttt-score-num" id="ttt-score-o">0</span></div>
        </div>

        <div class="ttt-status" id="ttt-status"></div>

        <div class="ttt-board" id="ttt-board">
          ${Array(9).fill(0).map((_, i) => `<div class="ttt-cell" data-index="${i}"></div>`).join("")}
        </div>

        <button class="ttt-restart-btn" id="ttt-restart">Restart Game</button>
      </div>
    `;

    this.cells = this.container.querySelectorAll(".ttt-cell");
    this.statusEl = this.container.querySelector("#ttt-status");
    this.modeCpuBtn = this.container.querySelector("#ttt-mode-cpu");
    this.modePvpBtn = this.container.querySelector("#ttt-mode-pvp");
    this.labelO = this.container.querySelector("#ttt-label-o");
  }

  bindEvents() {
    this.cells.forEach(cell => {
      cell.addEventListener("click", (e) => this.handleCellClick(e));
    });

    this.container.querySelector("#ttt-restart").addEventListener("click", () => this.resetGame());

    this.modeCpuBtn.addEventListener("click", () => this.setMode(true));
    this.modePvpBtn.addEventListener("click", () => this.setMode(false));
  }

  setMode(vsCPU) {
    if (this.vsCPU === vsCPU) return;
    this.vsCPU = vsCPU;
    this.modeCpuBtn.classList.toggle("active", vsCPU);
    this.modePvpBtn.classList.toggle("active", !vsCPU);
    this.labelO.textContent = vsCPU ? "CPU (O)" : "Player (O)";
    this.scores = { X: 0, O: 0, ties: 0 };
    this.updateScores();
    this.resetGame();
  }

  handleCellClick(e) {
    const index = parseInt(e.target.getAttribute("data-index"));

    if (this.boardState[index] !== null || !this.gameActive) return;

    this.makeMove(index, this.currentPlayer);

    if (this.gameActive && this.vsCPU && this.currentPlayer === "O") {
      this.gameActive = false; // Temporarily lock board during CPU turn
      setTimeout(() => {
        this.cpuMove();
        if (this.checkGameState("O")) return;
        this.gameActive = true;
      }, 400);
    }
  }

  makeMove(index, player) {
    this.boardState[index] = player;
    const cell = this.cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());

    if (!this.checkGameState(player)) {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
      this.updateStatus();
    }
  }

  cpuMove() {
    // 1. Try to win or block player
    let bestMove = this.findSmartMove("O") ?? this.findSmartMove("X");

    // 2. Take center if available
    if (bestMove === null && this.boardState[4] === null) {
      bestMove = 4;
    }

    // 3. Take random empty spot
    if (bestMove === null) {
      const emptyIndices = this.boardState
        .map((val, idx) => (val === null ? idx : null))
        .filter(val => val !== null);
      bestMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (bestMove !== undefined && bestMove !== null) {
      this.makeMove(bestMove, "O");
    }
  }

  findSmartMove(player) {
    for (let combo of this.winningCombos) {
      const values = combo.map(i => this.boardState[i]);
      if (values.filter(v => v === player).length === 2 && values.includes(null)) {
        return combo[values.indexOf(null)];
      }
    }
    return null;
  }

  checkGameState(player) {
    let winCombo = null;

    for (let combo of this.winningCombos) {
      if (combo.every(i => this.boardState[i] === player)) {
        winCombo = combo;
        break;
      }
    }

    if (winCombo) {
      this.gameActive = false;
      winCombo.forEach(i => this.cells[i].classList.add("winner"));
      this.scores[player]++;
      this.updateScores();
      this.statusEl.textContent = `${player} Wins! 🎉`;
      return true;
    }

    if (!this.boardState.includes(null)) {
      this.gameActive = false;
      this.scores.ties++;
      this.updateScores();
      this.statusEl.textContent = "It's a Tie! 🤝";
      return true;
    }

    return false;
  }

  updateStatus() {
    this.statusEl.textContent = `Turn: ${this.currentPlayer}`;
  }

  updateScores() {
    this.container.querySelector("#ttt-score-x").textContent = this.scores.X;
    this.container.querySelector("#ttt-score-o").textContent = this.scores.O;
    this.container.querySelector("#ttt-score-ties").textContent = this.scores.ties;
  }

  resetGame() {
    this.boardState.fill(null);
    this.currentPlayer = "X";
    this.gameActive = true;
    this.cells.forEach(cell => {
      cell.textContent = "";
      cell.className = "ttt-cell";
    });
    this.updateStatus();
  }
}

// Auto-initialize when container with id "tictactoe-container" exists
window.loadTicTacToeGame = function(parent){

    parent.innerHTML = `
        <div id="tictactoe-container"></div>
    `;

    new TicTacToeGame("tictactoe-container");

};