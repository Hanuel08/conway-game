const cellsWithLifeRandom = (array, percentageOfCells) => {
  const newArray = array;
  const max = array.length - 1;
  const times = Math.floor(
    (newArray.length * newArray.length * percentageOfCells) / 100
  );

  for (let i = 0; i < times; i++) {
    let randomX = Math.floor(Math.random() * max);
    let randomY = Math.floor(Math.random() * max);
    newArray[randomX][randomY].living = true;
  }
  return newArray;
};

const generateDOMCells = (x, y) => {
  let cellDOM = document.createElement("input");
  cellDOM.setAttribute("type", "checkbox");
  cellDOM.setAttribute("id", `C${x}-${y}`);
  cellDOM.classList.add("conway__grid__cell");
  return cellDOM;
};

const updateDOMCells = (array) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      let currentCell = document.querySelector(`#C${i}-${j}`);
      currentCell.checked = array[i][j].living ? true : false;
    }
  }
};

const cellNeighbors = (array) => {
  const newArray = array;
  for (let i = 0; i < newArray.length; i++) {
    for (let j = 0; j < newArray[i].length; j++) {
      let currentCell = newArray[i][j];
      let previousColumn = null;
      let nextColumn = null;

      currentCell.center = {};
      if (j !== 0) currentCell.center.left = newArray[i][j - 1].living;
      if (j < newArray[i].length - 1)
        currentCell.center.right = newArray[i][j + 1].living;

      if (i !== 0) {
        currentCell.top = {};
        previousColumn = i - 1;
      }

      if (i < newArray.length - 1) {
        currentCell.bottom = {};
        nextColumn = i + 1;
      }

      if (previousColumn || previousColumn == 0) {
        currentCell.top.middle = newArray[previousColumn][j].living;
        if (j !== 0)
          currentCell.top.left = newArray[previousColumn][j - 1].living;
        if (j < newArray[i].length - 1)
          currentCell.top.right = newArray[previousColumn][j + 1].living;
      }

      if (nextColumn) {
        currentCell.bottom.middle = newArray[nextColumn][j].living;
        if (j !== 0)
          currentCell.bottom.left = newArray[nextColumn][j - 1].living;
        if (j < newArray[i].length - 1)
          currentCell.bottom.right = newArray[nextColumn][j + 1].living;
      }
    }
  }
  return newArray;
};

const createCells = (rows, columns, grid) => {
  grid.style.display = "grid";
  grid.style.gridTemplateRows = `repeat(${parseInt(rows)}, 1fr)`;
  grid.style.gridTemplateColumns = `repeat(${parseInt(columns)}, 1fr)`;

  const fragment = document.createDocumentFragment();
  let cells = [];
  for (let i = 0; i < rows; i++) {
    let cellsRow = [];
    for (let j = 0; j < columns; j++) {
      cellsRow.push({
        position: {
          x: i,
          y: j,
        },
        living: false,
      });
      fragment.appendChild(generateDOMCells(i, j));
    }
    cells.push(cellsRow);
  }
  grid.appendChild(fragment);

  cells = cellsWithLifeRandom(cells, 40);
  updateDOMCells(cells);
  return cellNeighbors(cells);
};

const nextGeneration = (array) => {
  const newArray = array;

  for (let i = 0; i < newArray.length; i++) {
    for (let j = 0; j < newArray[i].length; j++) {
      let livingNeighbors = 0;
      let currentCell = newArray[i][j];

      let currentCellPropertys = Object.keys(currentCell);
      currentCellPropertys.forEach((direction) => {
        if (/^top|center|bottom$/.test(direction)) {
          /* Obtener vecinos */
          Object.values(currentCell[direction]).forEach((neighbor) => {
            if (neighbor) livingNeighbors += 1;
          });
        }
      });

      if (currentCell.living) {
        if (livingNeighbors < 2 || livingNeighbors > 3)
          currentCell.living = false;
        else continue;
      } else if (!currentCell.living && livingNeighbors === 3)
        currentCell.living = true;
    }
  }

  updateDOMCells(newArray);
  return cellNeighbors(newArray);
};

const checkCell = (array, event) => {
  const newArray = array;
  const cellPosition = /^C(\d{1,2})-(\d{1,2})$/.exec(
    event.target.getAttribute("id")
  );
  if (cellPosition) {
    let cellX = cellPosition[1];
    let cellY = cellPosition[2];
    newArray[cellX][cellY].living = event.target.checked;
  }
  return cellNeighbors(newArray);
};

let conwayGame = createCells(24, 24, document.querySelector(".conway__grid"));

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("conway__next"))
    conwayGame = nextGeneration(conwayGame);
  if (e.target.classList.contains("conway__grid__cell"))
    conwayGame = checkCell(conwayGame, e);
});