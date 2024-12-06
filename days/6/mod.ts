import { loadFile } from "../tools.ts";

type Direction = [number, number]
const directions: Direction[] = [
  [0, -1], // up
  [1, 0], // right
  [0, 1], // down 
  [-1, 0], // left
];

/**
 * Rotates the direction 90 degrees to the right.
 * 
 * @param direction - The current direction index (0 to 3).
 * @returns The new direction index after turning right.
 */
function turnRight(direction: number) {
  return (direction + 1) % 4
}

/**
 * Calculates the number of unique positions visited by a guard following
 * a strict patrol protocol based on the given grid.
 *
 * The guard starts at the position marked `^` and initially faces up.
 * The guard follows these rules:
 * - If the cell directly ahead is empty (.), the guard moves forward.
 * - If the cell directly ahead is an obstacle (#), the guard turns right.
 * - If the guard steps into a cell not yet visited, the cell is marked as visited (X).
 *
 * The guard stops patrolling when they leave the grid or encounter an invalid cell.
 *
 * @param data - A string representation of the grid
 * @returns The number of distinct cells visited by the guard.
 */
function countGuardVisitedCells(data: string): number {
  const grid = data.split("\n").map(l => l.split(""));
  let direction = 0;
  let visited = 0;

  const startRow = grid.findIndex((line) => line.includes("^"));
  const startCol = grid[startRow].findIndex((cell) => cell === "^");
  let [row, col] = [startRow, startCol];

  grid[row][col] = "X";
  visited++;

  const isWithinBounds = (row: number, col: number) =>
    row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;

  while (isWithinBounds(row, col)) {
    const [dx, dy] = directions[direction];
    const attemptCol = col + dx;
    const attemptRow = row + dy;
    const cell = grid[attemptRow]?.[attemptCol];

    if (!cell) {
      break;
    }

    if (cell === "#") {
      direction = turnRight(direction);
      continue;
    }

    if (cell !== "X") {
      grid[attemptRow][attemptCol] = "X";
      visited++;
    }
    [row, col] = [attemptRow, attemptCol];

  }

  return visited;
}


/**
 * Simulates the guard's movement to check if a loop occurs.
 * @param grid - The lab's grid with a potential new obstruction.
 * @param startRow - Starting row position of the guard.
 * @param startCol - Starting column position of the guard.
 * @param startDirection - Initial direction the guard is facing.
 * @returns `true` if the guard gets stuck in a loop, otherwise `false`.
 */
function isLoop(
  grid: string[][],
  startRow: number,
  startCol: number,
  startDirection: number
): boolean {
  const visitedStates = new Set<string>();
  let row = startRow;
  let col = startCol;
  let direction = startDirection;

  while (true) {
    const state = `${row},${col},${direction}`;
    if (visitedStates.has(state)) {
      return true;
    }
    visitedStates.add(state);

    const [dx, dy] = directions[direction];
    const nextRow = row + dy;
    const nextCol = col + dx;
    const cell = grid[nextRow]?.[nextCol];

    if (!cell) {
      break;
    }

    if (cell === "#") {
      direction = turnRight(direction);
      continue;
    }

    row = nextRow;
    col = nextCol;
  }

  return false;
}

/**
 * Determines the number of possible positions where an obstruction can be placed
 * to cause the guard to get stuck in a loop.
 * @param data - A string representation of the grid, with rows separated by newlines.
 * @returns The number of valid positions for a new obstruction.
 */
function countObstructionPositions(data: string): number {
  const grid = data.split("\n").map((line) => line.split(""));
  const startRow = grid.findIndex((line) => line.includes("^"));
  const startCol = grid[startRow].indexOf("^");

  let validPositions = 0;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (grid[row][col] === ".") {
        const testGrid = grid.map((line) => [...line]);
        testGrid[row][col] = "#";

        if (isLoop(testGrid, startRow, startCol, 0)) {
          validPositions++;
        }
      }
    }
  }

  return validPositions;
}

export default async function main() {
  const data = await loadFile(6);
  console.log(`Total of visited cells by the guard: ${countGuardVisitedCells(data)}`);
  console.log(`Total of valid positions for new obstruction: ${countObstructionPositions(data)}`);
  console.log("⭐⭐");
}