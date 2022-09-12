
// Get our webassembly structs
import {Universe, Cell} from "life";
import {memory} from "life/life_bg";

//-------- Set up variables --------
const CELL_SIZE = 8; // px
const GRID_COLOR = "#cccccc";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#000000";

const body = document.querySelector("body");
const canvas = document.querySelector("#life-display");
const slider = document.querySelector("#speed-slider");
const pause = document.querySelector("#pause");
const clear = document.querySelector("#clear");

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

// Add 1 to CELL_SIZE to allow space for the boundaries between cells
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;
const ctx = canvas.getContext("2d");

let speed = slider.value;
let paused = false;


// Draw a grid on the canvas
const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }
  
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }
  ctx.stroke();
};

// Turn a 2d index into a linear index
const getIndex = (row, column) => {
  return row * width + column;
};

// Draw the cells onto the canvas
const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
  
  ctx.beginPath();
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      
      ctx.fillStyle = cells[idx] === Cell.Dead
        ? DEAD_COLOR
        : ALIVE_COLOR;
      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }
  ctx.stroke();
};

// Check if the the point is inside the square
const isInside = (point, square) => {
  return ((point.x >= square.x) && (point.x <= (square.x + CELL_SIZE)))
    && ((point.y >= square.y) && (point.y <= (square.y + CELL_SIZE)))
      ? true
      : false;
};

// Get the cursor's position within the canvas
const getCursor = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
};

// Clear the screen and refresh the canvas
const clearScrn = () => {
  universe.clear();
  drawGrid();
  drawCells();
};

// Toggle the paused/active state and change the button text to match
const pausePlay = () => {
  paused = !paused;
  pause.textContent == "Pause" ? pause.textContent = "Play" : pause.textContent = "Pause";
};


const renderLoop = () => {
  paused ? {} : universe.tick();
  drawGrid();
  drawCells();
  setTimeout(() => requestAnimationFrame(renderLoop), speed);
};

drawGrid();
drawCells();
requestAnimationFrame(renderLoop);


//-------- Add event handlers --------
canvas.addEventListener("click", (e) => {
  const [x, y] = getCursor(canvas, e);
  // Divide cursor coordinates by number of pixels in a square (8) plus
  // the border width to find which square was clicked
  const col = Math.floor(x/9);
  const row = Math.floor(y/9);
  universe.toggle(row, col);
  drawGrid();
  drawCells();
});

slider.addEventListener("input", () => {
  speed = slider.value;
});

clear.addEventListener("click", clearScrn);

pause.addEventListener("click", pausePlay);

body.addEventListener("keydown", (event) => {
  if (!event.isComposing) {
    if (event.key === "c" || event.key === "C") {
      clearScrn();
    } else if (event.key === " ") {
      pausePlay();
    }
  }
});


