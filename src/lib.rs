mod utils;

use std::fmt;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// A Cell which can be either Dead or Alive
#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

/// A Universe for Conway's game of life. This implementation wraps around on the edges
#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl Universe {
    /// turn two-dimensional index into one-dimensional index
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    /// Get the number of live neighbors a cell has so we know
    /// whether it should be alive or not in the next generation
    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }
}

#[wasm_bindgen]
impl Universe {
    /// Access the cells from a pointer. Mostly useful for reading them
    /// in Javascript.
    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    /// Clear the screen (sets all the cells to Cell::Dead)
    pub fn clear(&mut self) {
        self.cells = vec![Cell::Dead; self.width() as usize * self.height() as usize];
    }

    /// Get screen height
    pub fn height(&self) -> u32 {
        self.height
    }

    /// Create a new Universe
    pub fn new() -> Universe {
        let width = 64;
        let height = 64;

        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();
        Universe {
            width,
            height,
            cells,
        }
    }

    /// Turn the Universe into a String. Useful for quick demos, but
    /// using a canvas gives more control
    pub fn render(&self) -> String {
        self.to_string()
    }

    /// Advance the Universe by one generation
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);
                let next_cell = match (cell, live_neighbors) {
                    (Cell::Alive, x) if x < 2 => Cell::Dead,
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    (Cell::Alive, x) if x > 3 => Cell::Dead,
                    (Cell::Dead, 3) => Cell::Alive,
                    (otherwise, _) => otherwise,
                };
                next[idx] = next_cell;
            }
        }
        self.cells = next;
    }

    /// Toggle the cell at the given index
    pub fn toggle(&mut self, row: u32, column: u32) {
        let cell_idx = self.get_index(row, column);
        self.cells[cell_idx] = match self.cells[cell_idx] {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        };
    }

    /// Get screen width
    pub fn width(&self) -> u32 {
        self.width
    }
}

/// This gives a Display impl for Universe that returns a block of cells.
/// Could be useful for quick and dirty examples, but on the web a canvas works
/// much better
impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            writeln!(f)?;
        }
        Ok(())
    }
}
