class MemoryGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // 8 Pairs = 16 Cards
    this.icons = ["🍎", "🍌", "🍒", "🍕", "🍔", "🍩", "🍦", "🚀"];
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.timeSeconds = 0;
    this.timer = null;
    this.isBoardLocked = false;

    this.initDOM();
    this.bindEvents();
    this.resetGame();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="memgame-wrapper">
        <div class="memgame-stats">
          <div class="memgame-stat-box">
            <span>MOVES</span>
            <span class="memgame-stat-value" id="memgame-moves">0</span>
          </div>
          <div class="memgame-stat-box">
            <span>PAIRS</span>
            <span class="memgame-stat-value" id="memgame-pairs">0 / 8</span>
          </div>
          <div class="memgame-stat-box">
            <span>TIME</span>
            <span class="memgame-stat-value" id="memgame-time">00:00</span>
          </div>
        </div>

        <div class="memgame-board" id="memgame-board"></div>

        <button class="memgame-restart-btn" id="memgame-restart">Restart Game</button>
      </div>
    `;

    this.boardEl = this.container.querySelector("#memgame-board");
    this.movesEl = this.container.querySelector("#memgame-moves");
    this.pairsEl = this.container.querySelector("#memgame-pairs");
    this.timeEl = this.container.querySelector("#memgame-time");
  }

  bindEvents() {
    this.container.querySelector("#memgame-restart").addEventListener("click", () => this.resetGame());
  }

  resetGame() {
    // Reset timer & state
    clearInterval(this.timer);
    this.timer = null;
    this.timeSeconds = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.flippedCards = [];
    this.isBoardLocked = false;

    this.movesEl.textContent = "0";
    this.pairsEl.textContent = "0 / 8";
    this.timeEl.textContent = "00:00";

    // Generate duplicate pairs & shuffle
    const cardDeck = [...this.icons, ...this.icons];
    this.shuffle(cardDeck);

    // Render cards
    this.boardEl.innerHTML = cardDeck
      .map((icon, index) => `
        <div class="memgame-card" data-icon="${icon}" data-index="${index}">
          <div class="memgame-card-inner">
            <div class="memgame-card-back">?</div>
            <div class="memgame-card-front">${icon}</div>
          </div>
        </div>
      `).join("");

    this.cards = this.boardEl.querySelectorAll(".memgame-card");
    this.cards.forEach(card => {
      card.addEventListener("click", (e) => this.handleCardClick(card));
    });
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.timeSeconds++;
      const mins = String(Math.floor(this.timeSeconds / 60)).padStart(2, "0");
      const secs = String(this.timeSeconds % 60).padStart(2, "0");
      this.timeEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  handleCardClick(card) {
    if (
      this.isBoardLocked ||
      card.classList.contains("flipped") ||
      card.classList.contains("matched")
    ) return;

    this.startTimer();

    card.classList.add("flipped");
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.movesEl.textContent = this.moves;
      this.checkMatch();
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    const isMatch = card1.getAttribute("data-icon") === card2.getAttribute("data-icon");

    if (isMatch) {
      card1.classList.add("matched");
      card2.classList.add("matched");
      this.matchedPairs++;
      this.pairsEl.textContent = `${this.matchedPairs} / 8`;
      this.flippedCards = [];

      if (this.matchedPairs === 8) {
        clearInterval(this.timer);
        setTimeout(() => {
          alert(`🎉 You Won in ${this.moves} moves and ${this.timeEl.textContent}!`);
        }, 500);
      }
    } else {
      this.isBoardLocked = true;
      setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        this.flippedCards = [];
        this.isBoardLocked = false;
      }, 900);
    }
  }
}

// Auto-initialize when container with id "memorygame-container" exists
window.loadMemoryGame = function(parent){

    parent.innerHTML = `
        <div id="memorygame-container"></div>
    `;

    new MemoryGame("memorygame-container");

};