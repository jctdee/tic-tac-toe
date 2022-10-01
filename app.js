'use strict';
const X_CLASS = 'x'
const CIRCLE_CLASS = 'circle';
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
let activeMode;
let cellElements;
let gameEnded = false;
// const cellElements = document.querySelectorAll('[data-cell]');

const playerOneMessage = document.getElementById('player-1-win');
const playerTwoMessage = document.getElementById('player-2-win');
const turnMessage = document.getElementById('turn-message');
const playAgainButton = document.getElementById('play-again');
const firstMode = document.getElementById('first-mode');
const secondMode = document.getElementById('second-mode');
const startButton = document.getElementById('start-button');

const board = document.getElementById('board');
const boardClone = board.cloneNode(true);
let circleTurn = null;

const gameBoard = (() => {
  const boardElements = [];

  const createBoard = (items) => {
    for(let i = 0; i < items; i++) {
      const boardItem = document.createElement('div');
      boardItem.classList.add('cell');
      boardItem.setAttribute('data-cell', '');
      boardItem.setAttribute('data-index', [i]);
      board.appendChild(boardItem);
      boardElements.push('');
    }
  }

  const setField = (index, sign) => {
    if(index > boardElements.length) return;
    boardElements[index] = sign;
  };

  const getField = (index) => {
    if (index > boardElements.length) return;
    return boardElements[index];
  }

  const getBoardElements = () => {
    return boardElements;
  }

  const reset = () => {
    for(let i = 0; i < boardElements.length; i++){
      boardElements[i];
    }
  }

  return {
    getBoardElements,
    createBoard,
    setField,
    getField, 
    reset
  };

})();

const Player = (() => {
  let playerName;
  const playerIndexes = [];

  const setName = name => {
    playerName = name;
  }

  const getName = () => {
    return playerName;
  }

  const setPlayerIndex = index => {
    playerIndexes.push(index);
  }

  const getPlayerIndex = index => {
    return playerIndexes[index];
  }

  const getPlayerIndexes = () => {
    return playerIndexes;
  }

  return {
    setName,
    getName,
    setPlayerIndex,
    getPlayerIndex,
    getPlayerIndexes
  }

});

const player1 = Player();
const player2 = Player();

const playerIndex = (() => {

  const addPlayerIndex = (player, sign) => {
    player.setPlayerIndex(sign);
  }

  return { addPlayerIndex };

})();

const winningMessage = (() => {

  const displayWinner = (sign) => {
    if(sign === X_CLASS) {
      playerOneMessage.style.visibility = 'visible';
    } else {
      playerTwoMessage.style.visibility = 'visible';
    }
  }

  return { displayWinner };

})();

firstMode.addEventListener('click', () => {
  secondMode.classList.remove('active-mode');
  firstMode.classList.add('active-mode');
  activeMode = 'pve';
  startButton.classList.remove('hidden');
})

secondMode.addEventListener('click', () => {
  firstMode.classList.remove('active-mode');
  secondMode.classList.add('active-mode');
  activeMode = 'pvp';
  startButton.classList.remove('hidden');
})




function startGame() {
  gameBoard.createBoard(9);
  setMode(activeMode);
  circleTurn = false;
  cellElements = document.querySelectorAll('[data-cell]');
  board.addEventListener('click', (e) => {
    if(e.target && e.target.nodeName === 'DIV' && e.target.className === 'cell') {
      // console.log(e);
      handleClick(e.target);
    }
  });
  setMessage(false);
  setBoardHoverClass();
}


function setMode(mode) {
  // DOM doesnt get default value of placeholder
  if(mode === 'pve') {
    if(document.getElementById('player-1-pve').value === '') {
      player1.setName('Player 1');
    } else {
      player1.setName(document.getElementById('player-1-pve').value);
    }
    player2.setName('AI');
  } else {
    if(document.getElementById('player-1-pvp').value === '') {
      player1.setName('Player 1');
    } else {
      player1.setName(document.getElementById('player-1-pvp').value);
    }
    if(document.getElementById('player-2-pvp').value === '') {
      player2.setName('Player 2');
    } else {
      player2.setName(document.getElementById('player-2-pvp').value);
    }
  }
  document.getElementById('player-1-name').innerHTML = player1.getName();
  document.getElementById('player-2-name').innerHTML = player2.getName();
}

function handleClick(e) {
  // const cell = e.target;
  const cell = e;
  // const ind = e.target.dataset.index;
  const ind = e.dataset.index;
  const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;
  // Place Mark
  placeMark(cell, currentClass);
  // gameBoard.setField(e.target.dataset.index, currentClass);
  gameBoard.setField(ind, currentClass)
  placeSign(ind);

  // Check for Win
  if (checkWin(currentClass)) {
    console.log('winner');
    winningMessage.displayWinner(currentClass);
    endGame(false);
  }
  


  // Check for Draw
  if(!gameEnded) {
    if(checkDraw()) {
      console.log('draw');
      endGame(true);
    }
  }

  // Switch Turns
  swapTurns();


  setMessage(circleTurn);
    //AI TURN
    disableUserInput();
    if(activeMode === 'pve' && circleTurn) {
    setTimeout(() => {
      aiTurn();
    }, "2000");
    }
    //AI TURN
  setBoardHoverClass();

  // console.log(document.querySelectorAll('.cell:not(.x):not(.circle)'));
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
  gameBoard.setField(cell.index, currentClass);
  
}

function placeSign(ind) {
  if(circleTurn) {
    playerIndex.addPlayerIndex(player2, ind);
  } else {
    playerIndex.addPlayerIndex(player1, ind);
  }
}

function setMessage(bool) {
  if(gameEnded) return;
  if(!bool) {
    turnMessage.innerHTML = `${player1.getName()}'s Turn`;
  } else {
    turnMessage.innerHTML = `${player2.getName()}'s Turn`;
  }
}

function swapTurns() {
  circleTurn = !circleTurn;
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(CIRCLE_CLASS);
  if(circleTurn) {
    board.classList.add(CIRCLE_CLASS);
  } else {
    board.classList.add(X_CLASS);
  }
}

function endGame(draw) {
  activeMode = 'end';
  if (draw) {
    turnMessage.innerHTML = "It's a draw";
  } else {
    // window.addEventListener('click', function(event) {
    //   event.stopImmediatePropagation();
    // }, true);
    board.addEventListener('click', function(event) {
      event.stopPropagation();
    }, true)
    cellElements.forEach(celem => {
      celem.classList.add('disabled-hover');
    });
    turnMessage.innerHTML = 'Game Ended';
  }
  playAgainButton.style.display = 'inline';
  gameEnded = true;
}

function checkWin(currentClass) {
  let currentPlayer;
  
  if(currentClass === X_CLASS) {
    currentPlayer = player1;
  } else {
    currentPlayer = player2;
  }

  return WINNING_COMBINATIONS.some(combination => {
    return combination.every(index => {
      return cellElements[index].classList.contains(currentClass);
    })
  })

}

function aiTurn() {
  const aiOptions = document.querySelectorAll('.cell:not(.x):not(.circle)');
  const aiChoices = [];
  aiOptions.forEach(opt => {
    aiChoices.push(opt.dataset.index);
  })

  const aiPick = randomizer(aiChoices.length);
  handleClick(aiOptions[aiPick]);
  enableUserInput();

  function randomizer(length) {
    return Math.floor(Math.random() * length);
  }
}

// firstMode.addEventListener('click', () => {
//   firstMode.classList.add('active-mode');
// })


// START SCREEN FUNCTIONS HERE
startButton.addEventListener('click', () => {
  const hiddenElements = document.getElementsByClassName('hidden');
  Array.from(hiddenElements).forEach(elem => {
    elem.classList.remove('hidden');
  })
  document.getElementById('mode-modal').classList.add('not-displayed');
  document.getElementsByClassName('game')[0].classList.remove('blurry');
  startGame();
})

playAgainButton.addEventListener('click', () => {
  window.location = window.location;
})

function checkDraw() {
  return gameBoard.getBoardElements().every(elem => elem !== '');
}

function disableUserInput() {
  board.classList.remove('x');
  board.classList.remove('circle');
  board.classList.add('disabled-hover');
}

function enableUserInput() {
  board.classList.remove('disabled-hover');
}