import { loadFile } from "../tools.ts";

/**
 * Counts the number of occurrences of the sequence ["X", "M", "A", "S"]
 * in all directions starting from each "X" character in a 2D grid.
 *
 * @param {string} data - The input data containing the 2D grid of characters.
 * @returns {number} The count of the sequence ["X", "M", "A", "S"] found in the grid.
 */
function countXMas(data: string): number {
  const grid = data.split("\n").map((l) => l.split(""));
  const target = "XMAS".split("");

  let count = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const char = grid[row][col];
      if (char === "X") {
        count += checkDirections(grid, target, row, col);
      }
    }
  }
  return count;
}

/**
 * Checks all directions from a given starting point in the grid
 * to find the sequence passed in params.
 *
 * @param {string[][]} grid - The 2D grid of characters.
 * @param {string[]} target - The target sequence to find.
 * @param {number} row - The starting row index.
 * @param {number} col - The starting column index.
 * @returns {number} The count of the sequence found starting from the given point.
 */
function checkDirections(
  grid: string[][],
  target: string[],
  row: number,
  col: number
) {
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  let count = 0;
  for (const [dx, dy] of directions) {
    if (checkGridLimit(grid, target.length - 1, row, col, dx, dy)) {
      continue;
    }

    let found = true;
    for (let i = 0; i < target.length; i++) {
      const rowIndex = row + i * dx;
      const colIndex = col + i * dy;
      if (grid[rowIndex][colIndex] !== target[i]) {
        found = false;
        break;
      }
    }
    if (found) {
      count++;
    }
  }
  return count;
}

/**
 * Checks if the target sequence can fit within the grid boundaries
 * starting from the given position and moving in the specified direction.
 *
 * @param {string[][]} grid - The 2D grid of characters.
 * @param {number} targetLength - The length of the target sequence.
 * @param {number} row - The starting row index.
 * @param {number} col - The starting column index.
 * @param {number} dx - The row direction increment.
 * @param {number} dy - The column direction increment.
 * @returns {boolean} True if the target sequence exceeds the grid boundaries, false otherwise.
 */
function checkGridLimit(
  grid: string[][],
  targetLength: number,
  row: number,
  col: number,
  dx: number,
  dy: number
) {
  const maxRowIndex = row + targetLength * dx;
  const maxColIndex = col + targetLength * dy;
  return (
    maxRowIndex < 0 ||
    maxRowIndex >= grid.length ||
    maxColIndex < 0 ||
    maxColIndex >= grid[row].length
  );
}

export default async function main() {
  const data = await loadFile(4);
  console.log(`Total of "XMAS" word: ${countXMas(data)}`);
  console.log("⭐");
}
