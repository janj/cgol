Number.prototype.mod = function(n) { return ((this % n)+n)%n; };
var style_rules = [];
style_rules.push('td { width: 10px; height: 10px; }')
style_rules.push("td.off { background-color: grey; }");
style_rules.push("td.on { background-color: magenta; }");
style_rules.push("table { border-collapse: collapse }");
var style = document.createElement('style');
style.type = "text/css";
style.innerHTML = style_rules.join("\n");
document.head.appendChild(style);

var gof = null;

function start() {
  gof = gameOfLife();
  buildBoardTable(gof);
  run();
}

function cellId(x, y) { return "c."+x+"."+y; }

function buildBoardTable(gof) {
  var boardNode = document.getElementById('gofBoard');
  var boardTable = document.createElement('table');
  boardNode.innerHTML = "";
  boardNode.appendChild(boardTable);

  for(var i=0; i<gof.getBoard().length; i++) {
    var rowNode = document.createElement('tr');
    for(var j=0; j<gof.getBoard()[i].length; j++) {
      var cell = document.createElement('td');
      cell.id = cellId(i, j);
      var isAlive = gof.isCellAlive(i, j);
      cell.className = isAlive ? 'on' : 'off';
      rowNode.appendChild(cell);
    }
    boardTable.appendChild(rowNode);
  }
}

function speedUp(faster) {
  var change = 25;
  if(faster) { gof.delay -= change; }
  else { gof.delay += change; }
}

function stop() {
  gof.stop();
}

function run() {
  gof.boardInteractor = updateDisplay;
  gof.run();
}

function updateDisplay(gof) {
  for(var i=0; i<gof.getBoard().length; i++) {
    for(var j=0; j<gof.getBoard()[i].length; j++) {
      var element = document.getElementById(cellId(i, j));
      element.className = gof.isCellAlive(i, j) ? 'on' : 'off';
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
      gof.boardInteractor(gof);
    }
    sleep(gof.delay).then(() => {
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
  gof.delay = 500;

  gof.setup(50);
  return gof;
}

