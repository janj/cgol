Number.prototype.mod = function(n) { return ((this % n)+n)%n; };

var fullStop = false;

function start() {
  var size = 10;
  var conwayBoard = [];
  var boardNode = document.getElementById('board');
  var boardTable = document.createElement('table');
  boardNode.innerHTML = "";
  boardNode.appendChild(boardTable);

  for(var i=0; i<size; i++) {
    var rowNode = document.createElement('tr');
    conwayBoard[i] = [];
    for(var j=0; j<size; j++) {
      conwayBoard[i][j] = Math.round(Math.random());
      var cell = document.createElement('td');
      cell.id = "c"+i+j;
      cell.appendChild(document.createTextNode(conwayBoard[i][j]));
      cell.class = conwayBoard[i][j] == 1 ? 'on' : 'off';
      rowNode.appendChild(cell);

    }
    boardTable.appendChild(rowNode);
  }
  run(conwayBoard);
}

function stop() {
  fullStop = true;
}

function run(board) {
  step(board);
  updateDisplay(board);
  sleep(500).then(() => {
    if(!fullStop) {
      run(board);
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function step(board) {
  var clone = cloneBoard(board);
  for(var i=0; i<board.length; i++) {
    for(var j=0; j<board[i].length; j++) {
      board[i][j] = willBeAlive(clone, i, j) ? 1 : 0;
    }
  }
}

function updateDisplay(board) {
  for(var i=0; i<board.length; i++) {
    for(var j=0; j<board[i].length; j++) {
      var element = document.getElementById("c"+i+j);
      element.innerHTML = board[i][j];
    }
  }
}

function cloneBoard(board) {
  return JSON.parse(JSON.stringify(board));
}

function willBeAlive(board, x, y) {
  var neighborCount = countNeighbors(board, x, y);
  var stayinAlive = board[x][y] == 1 && neighborCount == 2;
  var isAlive = neighborCount == 3;
  return stayinAlive || isAlive;
}

function countNeighbors(board, x, y) {
  var neighborCount = 0;
  for(i = x-1; i < x+2; i++) {
    for(j = y-1; j < y+2; j++) {
      if((i!=x || j!=y)) {
        var curX = i.mod(board.length);
        var curY = j.mod(board[curX].length)
        neighborCount += board[curX][curY];
      }
    }
  }
  return neighborCount;
}

function isValidCord(cord) {
  return cord >= 0 && cord < size;
}

function consolePrint(board) {
  for(i=0; i<size; i++) {
    console.log(board[i].join(' '));
  }
}
