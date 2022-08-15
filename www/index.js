import {Universe, Cell} from "life";
import {memory} from "life/life_bg";

const CELL_SIZE = 8; // px
const GRID_COLOR = "#cccccc";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#000000";

const canvas = document.querySelector("#life-display");
const universe = Universe.new();
const width = universe.width();
const height = universe.height();
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const slider = document.querySelector("#speed-slider");
let speed = slider.value;

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

const renderLoop = () => {
  universe.tick();
  drawGrid();
  drawCells();
  setTimeout(() => requestAnimationFrame(renderLoop), speed);
};

drawGrid();
drawCells();
requestAnimationFrame(renderLoop);
canvas.addEventListener("click", (e) => {
  console.log("canvas click");
  const pos = {
    x: e.clientX,
    y: e.clientY,
  };
});

slider.addEventListener("input", () => {
  speed = slider.value;
});
