Number.prototype.mod = function(n) { return ((this % n)+n)%n; };

var gof = null;

function start() {
  gof = gameOfLife();
  buildBoardTable(gof);
  run();
}

function buildBoardTable(gof) {
  var boardNode = document.getElementById('board');
  var boardTable = document.createElement('table');
  boardNode.innerHTML = "";
  boardNode.appendChild(boardTable);

  for(var i=0; i<gof.getBoard().length; i++) {
    var rowNode = document.createElement('tr');
    for(var j=0; j<gof.getBoard()[i].length; j++) {
      var cell = document.createElement('td');
      cell.id = "c"+i+j;
      var isAlive = gof.isCellAlive(i, j);
      cell.appendChild(document.createTextNode(isAlive ? '1' : '0'));
      cell.class = isAlive ? 'on' : 'off';
      rowNode.appendChild(cell);
    }
    boardTable.appendChild(rowNode);
  }
}

function stop() {
  gof.stop();
}

function run() {
  gof.boardInteractor = updateDisplay;
  gof.run();
}

function updateDisplay(board) {
  for(var i=0; i<board.length; i++) {
    for(var j=0; j<board[i].length; j++) {
      var element = document.getElementById("c"+i+j);
      element.innerHTML = board[i][j];
    }
  }
}

function gameOfLife() {
  var gof = {};
  var isStopped = false;
  var gofBoard = [];

  function initBoard(size) {
    for(var i=0; i<size; i++) {
      gofBoard[i] = [];
      for(var j=0; j<size; j++) {
        gofBoard[i][j] = Math.round(Math.random());
      }
    }
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

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function cloneBoard(board) {
    return JSON.parse(JSON.stringify(board));
  }


  gof.step = () => {
    var clone = cloneBoard(gofBoard);
    for(var i=0; i<gofBoard.length; i++) {
      for(var j=0; j<gofBoard[i].length; j++) {
        gofBoard[i][j] = willBeAlive(clone, i, j) ? 1 : 0;
      }
    }
  }

  gof.run = () => {
    gof.step();
    if(gof.boardInteractor) {
      gof.boardInteractor(gofBoard);
    }
    sleep(500).then(() => {
      if(!isStopped) {
        gof.run();
      }
    });
  }

  gof.setup = (size) => { initBoard(size); }
  gof.stop = () => { isStopped = true; }
  gof.start = () => { isStopped = false; }
  gof.getBoard = () => { return gofBoard; };
  gof.isCellAlive = (x, y) => { return gofBoard[x][y] == 1; };

  gof.setup(10);
  return gof;
}

