import { loadFile } from "../tools.ts";

const partOne = {
  /**
   * Counts the number of occurrences of the sequence ["X", "M", "A", "S"]
   * in all directions starting from each "X" character in a 2D grid.
   *
   * @param {string} data - The input data containing the 2D grid of characters.
   * @returns {number} The count of the sequence ["X", "M", "A", "S"] found in the grid.
   */
  countXMas(data: string): number {
    const grid = data.split("\n").map((l) => l.split(""));
    const target = "XMAS".split("");

    let count = 0;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const char = grid[row][col];
        if (char === "X") {
          count += this.checkDirections(grid, target, row, col);
        }
      }
    }
    return count;
  },
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
  checkDirections(
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
      if (this.checkGridLimit(grid, target.length - 1, row, col, dx, dy)) {
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
  },
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
  checkGridLimit(
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
  },
};

type DiagonalLimit = [[number, number], [number, number]];
const partTwo = {
  /**
   * Counts the number of occurrences of the sequence "MAS" or "SAM"
   * in a X shape starting from each "A" character in a 2D grid.
   *
   * @param {string} data - The input data containing the 2D grid of characters.
   * @returns {number} The count of the sequence "MAS" or "SAM" found in a X shape in the grid.
   */
  countMasXShape(data: string) {
    const grid = data.split("\n").map((l) => l.split(""));

    let count = 0;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const char = grid[row][col];
        if (char === "A") {
          count += +this.checkXShape(grid, row, col);
        }
      }
    }
    return count;
  },
  /**
   * Checks if the sequence "MAS" or "SAM" is found
   * in a X shape starting from the given position.
   *
   * @param {string[][]} grid - The 2D grid of characters.
   * @param {number} row - The starting row index.
   * @param {number} col - The starting column index.
   * @returns {boolean} true if the sequence is found, false otherwise.
   */
  checkXShape(grid: string[][], row: number, col: number): boolean {
    const leftUpToRightBottom: DiagonalLimit = [
      [-1, -1],
      [1, 1],
    ];
    const leftBottomToRightUp: DiagonalLimit = [
      [-1, 1],
      [1, -1],
    ];
    return [leftBottomToRightUp, leftUpToRightBottom].every((d) =>
      this.checkDiagonal(grid, row, col, d)
    );
  },
  /**
   * Checks if the sequence is found
   * in the specified diagonal direction.
   *
   * @param {string[][]} grid - The 2D grid of characters.
   * @param {number} row - The starting row index.
   * @param {number} col - The starting column index.
   * @param {DiagonalLimit} diagonal - The diagonal direction to check.
   * @returns {boolean} True if the sequence is found, false otherwise.
   */
  checkDiagonal(
    grid: string[][],
    row: number,
    col: number,
    diagonal: DiagonalLimit
  ): boolean {
    const [coords1, coords2] = diagonal;
    if (
      !grid[row - coords1[0]] ||
      !grid[row - coords1[0]][col - coords1[1]] ||
      !grid[row - coords2[0]] ||
      !grid[row - coords2[0]][col - coords2[1]]
    ) {
      return false;
    }
    const str =
      grid[row + coords1[0]][col + coords1[1]] +
      "A" +
      grid[row + coords2[0]][col + coords2[1]];
    return str === "MAS" || str === "SAM";
  },
};

export default async function main() {
  const data = await loadFile(4);
  console.log(`Total of "XMAS" word: ${partOne.countXMas(data)}`);
  console.log(
    `Total of "MAS" word as X-shape: ${partTwo.countMasXShape(data)}`
  );
  console.log("⭐⭐");
}
