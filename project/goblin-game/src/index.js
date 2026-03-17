import './styles.css';
import goblinImg from '../assets/goblin.svg';
import hammerCursor from '../assets/hammer.svg';

class GameState {
  constructor() {
    this.score = 0;
    this.misses = 0;
    this.isPlaying = false;
    this.currentGoblinCell = null;
    this.goblinTimeout = null;
  }

  reset() {
    this.score = 0;
    this.misses = 0;
    this.isPlaying = false;
    this.currentGoblinCell = null;
    if (this.goblinTimeout) {
      clearTimeout(this.goblinTimeout);
    }
  }

  addScore() {
    this.score++;
  }

  addMiss() {
    this.misses++;
  }

  isGameOver() {
    return this.misses >= 5;
  }
}

class GameBoard {
  constructor(containerId, positions) {
    this.container = document.getElementById(containerId);
    this.positions = positions;
    this.cells = [];
    this.goblinImg = goblinImg;
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.cells = [];
    
    this.positions.forEach((pos, index) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.left = pos.x + 'px';
      cell.style.top = pos.y + 'px';
      cell.dataset.index = index;
      this.container.append(cell);
      this.cells.push(cell);
    });
  }

  showGoblin(index) {
    this.hideGoblin();
    const cell = this.cells[index];
    if (cell) {
      cell.classList.add('has-goblin');
      cell.style.backgroundImage = `url(${this.goblinImg})`;
      return true;
    }
    return false;
  }

  hideGoblin() {
    this.cells.forEach(cell => {
      cell.classList.remove('has-goblin');
      cell.style.backgroundImage = '';
    });
  }

  setClickHandler(handler) {
    this.cells.forEach(cell => {
      cell.addEventListener('click', () => handler(cell));
    });
  }
}

class GoblinGame {
  constructor() {
    this.state = new GameState();
    this.positions = [
      { x: 50, y: 50 },
      { x: 200, y: 50 },
      { x: 350, y: 50 },
      { x: 50, y: 200 },
      { x: 200, y: 200 },
      { x: 350, y: 200 },
      { x: 50, y: 350 },
      { x: 200, y: 350 },
      { x: 350, y: 350 }
    ];
    this.board = new GameBoard('gameBoard', this.positions);
    this.scoreElement = document.getElementById('score');
    this.missesElement = document.getElementById('misses');
    this.startBtn = document.getElementById('startBtn');
    this.gameContainer = document.querySelector('.game-container');
    
    this.init();
  }

  init() {
    this.setHammerCursor();
    this.board.setClickHandler((cell) => this.handleCellClick(cell));
    this.startBtn.addEventListener('click', () => this.startGame());
  }

  setHammerCursor() {
    this.gameContainer.style.cursor = `url(${hammerCursor}), auto`;
    const style = document.createElement('style');
    style.textContent = `
      .game-board, .cell {
        cursor: url(${hammerCursor}), pointer;
      }
    `;
    document.head.append(style);
  }

  startGame() {
    this.state.reset();
    this.state.isPlaying = true;
    this.updateUI();
    this.startBtn.disabled = true;
    this.startBtn.textContent = 'Игра идёт...';
    this.spawnGoblin();
  }

  spawnGoblin() {
    if (!this.state.isPlaying) return;

    const randomIndex = Math.floor(Math.random() * this.positions.length);
    this.state.currentGoblinCell = randomIndex;
    
    const shown = this.board.showGoblin(randomIndex);
    
    if (shown) {
      this.state.goblinTimeout = setTimeout(() => {
        if (this.state.isPlaying && this.state.currentGoblinCell === randomIndex) {
          this.state.addMiss();
          this.updateUI();
          
          if (this.state.isGameOver()) {
            this.endGame();
          } else {
            this.spawnGoblin();
          }
        }
      }, 1000);
    }
  }

  handleCellClick(cell) {
    if (!this.state.isPlaying) return;

    const index = parseInt(cell.dataset.index);
    
    if (index === this.state.currentGoblinCell) {
      this.state.addScore();
      this.state.currentGoblinCell = null;
      clearTimeout(this.state.goblinTimeout);
      this.board.hideGoblin();
      this.updateUI();
      this.spawnGoblin();
    }
  }

  updateUI() {
    this.scoreElement.textContent = this.state.score;
    this.missesElement.textContent = this.state.misses;
  }

  endGame() {
    this.state.isPlaying = false;
    this.board.hideGoblin();
    this.startBtn.disabled = false;
    this.startBtn.textContent = 'Начать заново';
    alert(`Игра окончена! Ваш счёт: ${this.state.score}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GoblinGame();
});
