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
    style_rules.push('#gofBoard{ text-align:center; margin-top: 20px }');
    style_rules.push('td { width: 5px; height: 5px; }');
    style_rules.push("td.off { background-color: grey; }");
    style_rules.push("td.on1 { background-color: magenta; }");
    style_rules.push("td.on0 { background-color: blue; }");
    style_rules.push("table { border-collapse:collapse; margin: 20px auto 20px auto; }");
    var style = document.createElement('style');
    style.type = "text/css";
    style.innerHTML = style_rules.join("\n");
    document.head.appendChild(style);
  }

  let buildDisplay = (elementId) => {
    let boardNode = document.getElementById(elementId);
    boardNode.innerHTML = "";
    let container = document.createElement('div');
    container.appendChild(boardHeaderElement());
    container.appendChild(boardTableElement());
    container.appendChild(boardFooterElement());
    boardNode.appendChild(container);
    updateHeader();
  }

  let cellClass = (gof, x, y) => {
    var isAlive = gof.isCellAlive(x, y);
    let inhabitant = gof.inhabitantAt(x, y);
    return isAlive ? 'on' + inhabitant.type : 'off';
  }

  let boardTableElement = () => {
    let boardTable = document.createElement('table');
    for(var i=0; i<gof.getBoard().length; i++) {
      var rowNode = document.createElement('tr');
      for(var j=0; j<gof.getBoard()[i].length; j++) {
        var cell = document.createElement('td');
        cell.id = cellId(i, j);
        var isAlive = gof.isCellAlive(i, j);
        let inhabitant = gof.inhabitantAt(i, j);
        cell.className = cellClass(gof, i, j);
        rowNode.appendChild(cell);
      }
      boardTable.appendChild(rowNode);
    }
    return boardTable;
  }

  let boardFooterElement = () => {
    var boardFooter = document.createElement('div');
    boardFooter.className = 'btn-group';
    let buildButton = (text, fnct) => {
      var btn = document.createElement('button');
      btn.id = text;
      btn.className = 'btn btn-default';
      btn.appendChild(document.createTextNode(text));
      btn.onclick = fnct;
      return btn;
    }

    boardFooter.appendChild(buildButton('Start', () => { gof.start(); flipStartButton(); }));
    boardFooter.appendChild(buildButton('Reset', reset));
    boardFooter.appendChild(buildButton('Faster', () => { speedUp(true) }));
    boardFooter.appendChild(buildButton('Slower', () => { speedUp(false) }));
    return boardFooter;
  }

  let reset = () => {
    gof.resetBoard();
    gof.loopTracker = loopTracker();
    flipStartButton();
    updateDisplay();
  }

  let flipStartButton = () => {
    let btn = document.getElementById('Start');
    if(gof.isStopped()) {
      btn.innerHTML = 'Start';
      btn.onclick = () => { gof.start(); flipStartButton(); };
    } else {
      btn.innerHTML = 'Stop';
      btn.onclick = () => { gof.stop(); flipStartButton(); };
    }
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
    gof.loopTracker.didStep(gof);
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
        element.className = cellClass(gof, i, j);
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

function inhabitant() {
  let service = {};
  service.type = Math.round(Math.random());
  service.clone = () => Object.assign({}, service);
  return service;
}

function loopTracker() {
  let prog = {};
  let seenMap = {};
  var count = 0;
  var currentBoardKey;

  function boardKey(gof) {
    let board = gof.getBoard();
    let boardKey = "";
    for(var i=0; i<board.length; i++) {
      for(var j=0; j<board[i].length; j++) {
        boardKey += gof.isCellAlive(i, j) ? '1' : '0';
      }
    }
    return boardKey;
  }

  prog.stepCount = () => count;
  prog.foundLoop = () => count > 0 && !!seenMap[currentBoardKey];
  prog.didStep = (gof) => {
    let key = boardKey(gof);
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

  function initBoard(width, height) {
    for(var i=0; i<height; i++) {
      gofBoard[i] = [];
      for(var j=0; j<width; j++) {
        gofBoard[i][j] = Math.round(Math.random()) == 1 ? inhabitant() : null;
      }
    }
  }

  function inhabited(board, x, y) {
    return !!board[x][y];
  }

  function getNeighbors(board, x, y) {
    let neighbors = [];
    for(i = x-1; i < x+2; i++) {
      for(j = y-1; j < y+2; j++) {
        if((i!=x || j!=y)) {
          var curX = i.mod(board.length);
          var curY = j.mod(board[curX].length);
          if(inhabited(board, curX, curY)) {
            neighbors.push(board[curX][curY]);
          }
        }
      }
    }
    return neighbors;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function run() {
    gof.step();
    if(gof.boardInteractor) {
      gof.boardInteractor(gof);
    }
    sleep(gof.delay).then(() => { if(!isStopped) run(); });
  }

  function inhabitantForStep(board, x, y) {
    let neighbors = getNeighbors(board, x, y);
    let neighborCount = neighbors.length;
    var stayinAlive = inhabited(board, x, y) && neighborCount == 2;
    var isAlive = neighborCount == 3;
    if (inhabited(board, x, y)) {
      if (neighborCount == 2 || neighborCount == 3) {
        return board[x][y].clone();
      }
    }
    else if(neighborCount == 3) {
      let newInhabitant = inhabitant();
      let firstTwoTypesEqual = neighbors[0].type == neighbors[1].type;
      if(firstTwoTypesEqual) {
        newInhabitant.type = neighbors[0].type;
      } else {
        newInhabitant.type = neighbors[2].type;
      }
      return newInhabitant;
    }
    return null;
  }

  gof.step = () => {
    var nextBoard = [];
    for(var i=0; i<gofBoard.length; i++) {
      nextBoard[i] = [];
      for(var j=0; j<gofBoard[i].length; j++) {
        nextBoard[i][j] = inhabitantForStep(gofBoard, i, j);
      }
    }
    gofBoard = nextBoard;
  }

  gof.populationCount = () => {
    let add = (a, b) => a + b;
    let convertRow = (cell) => !!cell ? 1 : 0;
    return gofBoard.map((arr) => arr.map(convertRow).reduce(add, 0)).reduce(add, 0);
  }

  gof.resetBoard = () => {
    isStopped = true;
    for(var i=0; i<gofBoard.length; i++) {
      for(var j=0; j<gofBoard[i].length; j++) {
        gofBoard[i][j] = Math.round(Math.random()) == 1 ? inhabitant() : null;
      }
    }
  }

  gof.setup = (width, height) => { initBoard(width, height); }
  gof.stop = () => { isStopped = true; }
  gof.start = () => { isStopped = false; run(); }
  gof.isStopped = () => isStopped;
  gof.getBoard = () => gofBoard;
  gof.inhabitantAt = (x, y) => gofBoard[x][y];
  gof.isCellAlive = (x, y) => inhabited(gofBoard, x, y);
  gof.delay = 150;

  gof.setup(150, 75);
  return gof;
}

