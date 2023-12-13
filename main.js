const boardSize = 10; // Default border size

const boardContainer = document.getElementById('minesweeper-board');
let board;
const btnNewGame = document.getElementById('reset-button');
let gameOver = false;
let userName;
let mineCount; // Default mines
const settings = document.querySelector('.settings');
const returnBtn = document.querySelector('.return-btn');
function adjustDifficulty() {
  const difficultyInput = document.getElementById('difficulty');
  const diff = difficultyInput.value.toLowerCase();
  if (diff === 'medium') return (mineCount = 20);
  else if (diff === 'hard') return (mineCount = 30);
  else return (mineCount = 10);
}
// adjusting difficulty, calling event listener whenever user change value of <select>
const difficultyInput = document.getElementById('difficulty');
difficultyInput.addEventListener('change', adjustDifficulty);

function createBoard(size, mines) {
  const board = Array.from({ length: size }, () => Array(size).fill(0));
  boardContainer.innerHTML = '';
  // Add mines to the board randomly
  for (let i = 0; i < mines; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * size);
      col = Math.floor(Math.random() * size);
    } while (board[row][col] === 'mine');

    board[row][col] = 'mine';
  }

  return board;
}

function renderBoard() {
  boardContainer.innerHTML = ''; // Clear previous content

  settings.style.display = 'none';
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener('click', handleCellClick);

      boardContainer.appendChild(cell);
    }
  }
}

// Creating board after button pressed
btnNewGame.addEventListener('click', function () {
  userName = document.querySelector('.user-name').value;
  gameOver = false;
  board = createBoard(boardSize, adjustDifficulty());
  renderBoard();
  btnNewGame.textContent = 'Retry';
  returnBtn.style.display = 'block';
  console.log(board);
  console.log(adjustDifficulty());
});
function resetBoard() {
  boardContainer.innerHTML = ''; // Clear the board content
  board = []; // Reset the board array to an empty state
  cells = []; // Reset the cells array
  settings.style.display = 'block';
}

returnBtn.addEventListener('click', function () {
  resetBoard();
  btnNewGame.textContent = 'New Game';
  returnBtn.style.display = 'none';
});

function disableClicks() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    cell.removeEventListener('click', handleCellClick);
    cell.removeEventListener('contextmenu', addFlag);
  });
}

function handleCellClick(event) {
  const clickedCell = event.target;
  const row = parseInt(clickedCell.dataset.row);
  const col = parseInt(clickedCell.dataset.col);

  if (board[row][col] === 'mine') {
    revealAllMines(); // displaying all mines on the board
    gameOver = true; // game state
    disableClicks(); // disable clicking on cells
    showModal(
      `${userName}, sadly, you loose this game ): Try with another difficulty or think more carefully`
    ); // in case of loose, show modal window
  } else {
    revealCell(row, col); // recursively 'opening' empty cells, as well as first cell countering bomb from any side
    checkWin(); // if user win game, modal window appear with congratulations
  }

  // Remove the click event listener after revealing the cell
  clickedCell.removeEventListener('click', handleCellClick);
}
function gameStatus() {
  return gameOver;
}

function revealCell(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

  // Check if the cell is not already revealed
  if (!cell.classList.contains('revealed')) {
    const adjacentMines = countAdjacentMines(row, col);

    // If the cell has 0 adjacent mines, reveal all adjacent cells recursively
    if (adjacentMines === 0) {
      cell.classList.add('revealed', 'empty');

      for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
          if (i >= 0 && i < board.length && j >= 0 && j < board[row].length) {
            revealCell(i, j);
          }
        }
      }
    } else {
      cell.textContent = adjacentMines;
      if (adjacentMines > 3) cell.classList.add('revealed', `number-3`);
      else cell.classList.add('revealed', `number-${adjacentMines}`);
    }
  }
}

function countAdjacentMines(row, col) {
  let numMines = 0;

  // Check all 8 surrounding squares
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      // Skip the current cell
      if (i === row && j === col) continue;

      // Check boundaries to avoid out-of-bounds errors
      if (i >= 0 && i < board.length && j >= 0 && j < board[row].length) {
        if (board[i][j] === 'mine') {
          numMines++;
        }
      }
    }
  }

  // Return the number of adjacent mines
  return numMines;
}

function addFlag(e) {
  // Check if the left mouse button is clicked (button code 0)
  if (e.button === 2) {
    const clickedCell = e.target;
    const row = parseInt(clickedCell.dataset.row);
    const col = parseInt(clickedCell.dataset.col);

    // Check if the cell is not revealed already

    if (!clickedCell.classList.contains('revealed')) {
      // Add or remove the flag class
      clickedCell.classList.toggle('emoji-flag');

      // Prevent the default behavior (e.g., context menu)
      e.preventDefault();
    }
  }
}

boardContainer.addEventListener('contextmenu', addFlag);

function revealAllMines() {
  // Loop through the entire board and reveal all mines
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 'mine') {
        const mineCell = document.querySelector(
          `[data-row="${row}"][data-col="${col}"]`
        );
        mineCell.textContent = '💣';
      }
    }
  }
}
function showModal(message) {
  const modal = document.getElementById('myModal');
  const modalText = document.getElementById('modalText');
  modalText.innerText = message;
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
}

function checkWin() {
  const cells = document.querySelectorAll('.cell');
  const unrevealedCells = Array.from(cells).filter(
    (cell) => !cell.classList.contains('revealed')
  );

  const unrevealedMines = unrevealedCells.filter(
    (cell) => board[cell.dataset.row][cell.dataset.col] === 'mine'
  );

  if (unrevealedCells.length === unrevealedMines.length) {
    showModal('Congratulations! You won!');
  }
}
// Log the initial state of the board (for testing purposes)
