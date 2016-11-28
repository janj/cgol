Number.prototype.mod = function(n) { return ((this % n)+n)%n; };

function gofUI(elementId) {
  var gof = null;

  let init = (elementId) => {
    gof = gameOfLife();
    gof.loopTracker = loopTracker();
    gof.boardInteractor = doForEachStep;
    styleInit();
    buildDisplay(elementId);
  }

  let styleInit = () => {
    var style_rules = [];
    style_rules.push('td { width: 10px; height: 10px; }')
    style_rules.push("td.off { background-color: grey; }");
    style_rules.push("td.on { background-color: magenta; }");
    style_rules.push("table { border-collapse: collapse }");
    var style = document.createElement('style');
    style.type = "text/css";
    style.innerHTML = style_rules.join("\n");
    document.head.appendChild(style);
  }

  let buildDisplay = (elementId) => {
    var boardNode = document.getElementById(elementId);
    boardNode.innerHTML = "";
    var container = document.createElement('div');
    container.appendChild(boardHeaderElement());
    container.appendChild(boardTableElement());
    container.appendChild(boardFooterElement());
    boardNode.appendChild(container);
    updateHeader();
  }

  let boardTableElement = () => {
    var boardTable = document.createElement('table');
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
    return boardTable;
  }

  let boardFooterElement = () => {
    var boardFooter = document.createElement('div');
    var startButton = document.createElement('button');
    startButton.appendChild(document.createTextNode('Start'));
    boardFooter.appendChild(startButton);
    startButton.onclick = gof.start;

    var stopButton = document.createElement('button');
    stopButton.appendChild(document.createTextNode('Stop'));
    boardFooter.appendChild(stopButton);
    stopButton.onclick = gof.stop;

    var fasterButton = document.createElement('button');
    fasterButton.appendChild(document.createTextNode('Faster'));
    boardFooter.appendChild(fasterButton);
    fasterButton.onclick = () => { speedUp(true) };

    var slowerButton = document.createElement('button');
    slowerButton.appendChild(document.createTextNode('Slower'));
    boardFooter.appendChild(slowerButton);
    slowerButton.onclick = () => { speedUp(false) };

    return boardFooter;
  }

  let boardHeaderElement = () => {
    let boardHeader = document.createElement('div');
    let stepContainer = document.createElement('div');
    let stepCount = document.createElement('span');
    stepCount.id = 'stepCount';
    stepContainer.appendChild(stepCount);
    stepContainer.appendChild(document.createTextNode(' '));
    let popCount = document.createElement('span');
    popCount.id = 'populationCount';
    stepContainer.appendChild(popCount);

    boardHeader.appendChild(stepContainer);
    let loopDisplay = document.createElement('div');
    loopDisplay.id = 'loopDisplay';
    boardHeader.appendChild(loopDisplay);
    return boardHeader;
  }

  let speedUp = (faster) => {
    var change = 25;
    if(faster) { gof.delay -= change; }
    else { gof.delay += change; }
  }

  let doForEachStep = () => {
    gof.loopTracker.didStep(gof.getBoard());
    updateDisplay(gof);
    if(gof.loopTracker.foundLoop()) {
      gof.stop();
    }
  }

  let updateDisplay = () => {
    updateHeader();
    updateBoard();
  }

  let updateBoard = () => {
    for(var i=0; i<gof.getBoard().length; i++) {
      for(var j=0; j<gof.getBoard()[i].length; j++) {
        var element = document.getElementById(cellId(i, j));
        element.className = gof.isCellAlive(i, j) ? 'on' : 'off';
      }
    }
  }

  let updateHeader = () => {
    let setText = (elementId, text) => {
      let elm = document.getElementById(elementId);
      if(!!elm) {
        elm.innerHTML = text;
      }
    }
    setText('stepCount', 'Step: ' + gof.loopTracker.stepCount());
    setText('populationCount', 'Population: ' + gof.populationCount());
    if(gof.loopTracker.foundLoop()) {
      setText('loopDisplay', 'found loop of length ' + gof.loopTracker.loopLength());
    }
  }

  let cellId = (x, y) => "c."+x+"."+y;

  init(elementId);
}

function loopTracker() {
  let prog = {};
  let seenMap = {};
  var count = 0;
  var currentBoardKey;

  function boardKey(board) {
    return board.map((a) => a.join('')).join('');
  }

  prog.stepCount = () => count;
  prog.foundLoop = () => count > 0 && !!seenMap[currentBoardKey];
  prog.didStep = (board) => {
    let key = boardKey(board);
    if(!prog.foundLoop()) {
      if(!!currentBoardKey) {
        seenMap[currentBoardKey] = count;
      }
      currentBoardKey = key;
      count += 1;
    }
  }
  prog.loopLength = () => {
    var loopLength = 0;
    if(prog.foundLoop()) {
      loopLength = count - seenMap[currentBoardKey] - 1;
    }
    return loopLength;
  }
  return prog;
}

function gameOfLife() {
  let gof = {};
  var isStopped = false;
  let gofBoard = [];

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

  function run() {
    gof.step();
    if(gof.boardInteractor) {
      gof.boardInteractor(gof);
    }
    sleep(gof.delay).then(() => {
      if(!isStopped) {
        run();
      }
    });
  }

  gof.step = () => {
    var clone = cloneBoard(gofBoard);
    for(var i=0; i<gofBoard.length; i++) {
      for(var j=0; j<gofBoard[i].length; j++) {
        gofBoard[i][j] = willBeAlive(clone, i, j) ? 1 : 0;
      }
    }
  }

  gof.populationCount = () => {
    let add = (a, b) => a + b;
    return gofBoard.map((arr) => arr.reduce(add, 0)).reduce(add, 0);
  }

  gof.setup = (size) => { initBoard(size); }
  gof.stop = () => { isStopped = true; }
  gof.start = () => { isStopped = false; run(); }
  gof.getBoard = () => gofBoard;
  gof.isCellAlive = (x, y) => gofBoard[x][y] == 1;
  gof.delay = 500;

  gof.setup(20);
  return gof;
}

