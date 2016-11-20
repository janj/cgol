var size = 10;
var conwayBoard = [];

for(var i=0; i<size; i++) {
  conwayBoard[i] = [];
  for(var j=0; j<size; j++) {
    conwayBoard[i][j] = Math.round(Math.random());
  }
}

function step() {
  var clone = cloneBoard();
  for(var i=0; i<size; i++) {
    for(var j=0; j<size; j++) {
      conwayBoard[i][j] = willBeAlive(clone, i, j) ? 1 : 0;
    }
  }
}

function cloneBoard() {
  return JSON.parse(JSON.stringify(conwayBoard));
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
      if((i!=x || j!=y) && isValidCord(i) && isValidCord(j)) {
        neighborCount += board[i][j];
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
