import {Universe, Cell} from "life";
import {memory} from "life/life_bg";

const CELL_SIZE = 8; // px
const GRID_COLOR = "#cccccc";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#000000";

const body = document.querySelector("body");

const canvas = document.querySelector("#life-display");
const universe = Universe.new();
const width = universe.width();
const height = universe.height();
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const slider = document.querySelector("#speed-slider");
let speed = slider.value;

const pause = document.querySelector("#pause");
const clear = document.querySelector("#clear");

const ctx = canvas.getContext("2d");

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

const getIndex = (row, column) => {
  return row * width + column;
};

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

const isInside = (point, square) => {
  return ((point.x >= square.x) && (point.x <= (square.x + CELL_SIZE)))
    && ((point.y >= square.y) && (point.y <= (square.y + CELL_SIZE)))
      ? true
      : false;
};

const getCursor = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
}

let paused = false;

const renderLoop = () => {
  paused ? {} : universe.tick();
  drawGrid();
  drawCells();
  setTimeout(() => requestAnimationFrame(renderLoop), speed);
};

drawGrid();
drawCells();
requestAnimationFrame(renderLoop);
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

const clearScrn = () => {
  universe.clear();
  drawGrid();
  drawCells();
};

const pausePlay = () => {
  paused = !paused;
  pause.textContent == "Pause" ? pause.textContent = "Play" : pause.textContent = "Pause";
};

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


