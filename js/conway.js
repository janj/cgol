Number.prototype.mod = function(n) { return ((this % n)+n)%n; };

let elementText = (elementId, text) => {
  let boardCord = document.getElementById(elementId);
  if(!!boardCord) {
    boardCord.innerHTML = text;
  }
};

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
    container.appendChild(patternElement());
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
    boardTable.onmouseout = () => elementText('boardCordPreview', '');
    for(var i=0; i<gof.getBoard().length; i++) {
      var rowNode = document.createElement('tr');
      for(var j=0; j<gof.getBoard()[i].length; j++) {
        var cell = document.createElement('td');
        cell.id = cellId(i, j);
        let x = j;
        let y = i;
        cell.onmouseover = () => elementText('boardCordPreview', x+', '+y);
        cell.onclick = () => boardCellClicked(x, y);
        cell.className = cellClass(gof, i, j);
        rowNode.appendChild(cell);
      }
      boardTable.appendChild(rowNode);
    }
    return boardTable;
  }

  let boardCellClicked = (x, y) => {
    elementText('boardCord', x + ', ' + y);
    let printer = patternPrinter(gof);
    printer.setOrigin(x, y);
    printer.printPattern();
    updateBoard();
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
    boardFooter.appendChild(buildButton('Clear', () => { gof.clearBoard(); updateDisplay(); }));
    boardFooter.appendChild(buildButton('Faster', () => { speedUp(true); }));
    boardFooter.appendChild(buildButton('Slower', () => { speedUp(false); }));
    return boardFooter;
  }

  let patternElement = () => {
    var container = document.createElement('div');
    var patternDivPrev = document.createElement('div');
    patternDivPrev.id = 'boardCordPreview';
    container.appendChild(patternDivPrev);
    var patternDiv = document.createElement('div');
    patternDiv.id = 'boardCord';
    container.appendChild(patternDiv);
    return container;
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
    gof.forTheseCells(0, gof.getBoard().length, 0, gof.getBoard()[0].length, (x, y) => {
      var element = document.getElementById(cellId(x, y));
      element.className = cellClass(gof, x, y);
    });
  }

  let updateHeader = () => {
    elementText('stepCount', 'Step: ' + gof.loopTracker.stepCount());
    elementText('populationCount', 'Population: ' + gof.populationCount());
    if(gof.loopTracker.foundLoop()) {
      elementText('loopDisplay', 'found loop of length ' + gof.loopTracker.loopLength());
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
    gof.forTheseCells(0, board.length, 0, board[0].length, (x, y) => boardKey += gof.isCellAlive(x, y) ? '1' : '0');
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

function patternPrinter(gof) {
  let gofBoard = gof;
  let origin = {x: 0, y: 0};
  let borderWidth = 2;

  let printer = {};

  printer.setOrigin = (x, y) => {
    origin.x = x;
    origin.y = y;
  }

  printer.printPattern = () => {
    let pattern = GOF_PATTERNS.gosperGliderGun;
    let extra = borderWidth * 2;
    gof.forTheseCells(origin.x, pattern.width, origin.y, pattern.height, (x, y) => {
      let point = x - origin.x + (y - origin.y) * pattern.width;
      gofBoard.setCell(y, x, pattern.points[point] == 1);
    })
  }
  return printer;
}

function gameOfLife() {
  let gof = {};
  var isStopped = false;
  let gofBoard = [];

  function initBoard(width, height) {
    forTheseCells(0, height, 0, 1, (x, y) => gofBoard[x] = []);
    forTheseCells(0, height, 0, width, (x, y) => gofBoard[x][y] = false);
  }

  function inhabited(board, x, y) {
    return !!board[x][y];
  }

  function getNeighbors(board, x, y) {
    let neighbors = [];
    let pushNeighbor = (i, j) => {
      if((i!=x || j!=y)) {
        var curX = i.mod(board.length);
        var curY = j.mod(board[curX].length);
        if(inhabited(board, curX, curY)) {
          neighbors.push(board[curX][curY]);
        }
      }
    }
    forTheseCells(x-1, 3, y-1, 3, pushNeighbor);
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
    let nextBoard = [];
    let setNext = (x, y) => nextBoard[x][y] = inhabitantForStep(gofBoard, x, y);
    forTheseCells(0, gofBoard.length, 0, 1, (x, y) => nextBoard[x] = []);
    forTheseCells(0, gofBoard.length, 0, gofBoard[0].length, setNext);
    gofBoard = nextBoard;
  }

  gof.populationCount = () => {
    let add = (a, b) => a + b;
    let convertRow = (cell) => !!cell ? 1 : 0;
    return gofBoard.map((arr) => arr.map(convertRow).reduce(add, 0)).reduce(add, 0);
  }

  let forTheseCells = (x, dx, y, dy, cellFunc) => {
    for(var i=y; i<y+dy; i++) {
      for(var j=x; j<x+dx; j++) {
        cellFunc(j, i);
      }
    }
  }

  let setEachCell = (cellFunc) => {
    forTheseCells(0, gofBoard.length, 0, gofBoard[0].length, (x, y) => gof.setCell(x, y, cellFunc()));
  }

  gof.clearBoard = () => {
    setEachCell(() => false);
  }

  gof.resetBoard = () => {
    isStopped = true;
    setEachCell(() => Math.random() > .8);
  }

  gof.setup = (width, height) => { initBoard(width, height); }
  gof.stop = () => { isStopped = true; }
  gof.start = () => { isStopped = false; run(); }
  gof.isStopped = () => isStopped;
  gof.getBoard = () => gofBoard;
  gof.inhabitantAt = (x, y) => gofBoard[x][y];
  gof.isCellAlive = (x, y) => inhabited(gofBoard, x, y);
  gof.setCell = (x, y, alive) => gofBoard[x][y] = alive ? inhabitant() : null;
  gof.forTheseCells = forTheseCells;
  gof.delay = 150;

  gof.setup(150, 75);
  return gof;
}


let GOF_PATTERNS = {
  glider: {
    height: 3,
    width: 3,
    points: [0, 1, 0, 0, 0, 1, 1, 1, 1]
  },
  gosperGliderGun: {
    width: 36,
    height: 9,
    points: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
             0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
             1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
             1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
             ]
  }
};

