import { loadFile } from "../tools.ts";

type Point = { x: number; y: number };

/**
 * Parses the input data to extract the map, start, and end points.
 *
 * @param data - The input data as a string.
 * @returns An object containing the map as a 2D array of strings, the start point, and the end point.
 */
function parse(data: string): {
  maze: string[][];
  start: Point;
  end: Point;
} {
  let end: Point = { x: -1, y: -1 };
  let start: Point = { x: -1, y: -1 };
  const maze = data
    .trim()
    .split("\n")
    .map((line) => line.split(""));
  maze.forEach((line, y) => {
    line.forEach((cell, x) => {
      if (cell === "S") {
        start = { x, y };
      }
      if (cell === "E") {
        end = { x, y };
      }
    });
  });

  return { maze, start, end };
}

/**
 * Performs a breadth-first search (BFS) to calculate the shortest distance from the start point to all other points in the maze.
 *
 * @param maze - The maze represented as a 2D array of strings.
 * @param start - The starting point in the maze.
 * @returns A 2D array of numbers representing the shortest distance from the start point to each point in the maze.
 *          Cells with walls ('#') are marked with -1, and unreachable cells are marked with Infinity.
 */
function bfs(maze: string[][], start: Point): number[][] {
  const distanceGrid = maze.map((row) =>
    row.map((cell) => (cell === "#" ? -1 : Infinity))
  );

  const queue = [start];
  distanceGrid[start.y][start.x] = 0;

  while (queue.length) {
    const { x, y } = queue.shift()!;

    const neighbours: Point[] = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    const currentValue = distanceGrid[y][x];

    for (const neighbor of neighbours) {
      const neighborValue = distanceGrid[neighbor.y]?.[neighbor.x];
      if (neighborValue === -1 || neighborValue < currentValue + 1) {
        continue;
      }

      distanceGrid[neighbor.y][neighbor.x] = currentValue + 1;
      queue.push(neighbor);
    }
  }

  return distanceGrid;
}

/**
 * Counts the number of cheats that save at least a minimum amount of time.
 *
 * @param distanceGrid - A 2D array of numbers representing the shortest distance from the start point to each point in the maze.
 * @param maxCheats - The maximum number of cheats allowed.
 * @param minimumTimeSaved - The minimum amount of time that must be saved for a cheat to be counted.
 * @returns The total number of cheats that save at least the minimum amount of time.
 */
function countFilteredCheats(
  distanceGrid: number[][],
  maxCheats: number,
  minimumTimeSaved: number
): number {
  let sum = 0;

  for (let y1 = 1; y1 < distanceGrid.length - 1; ++y1) {
    for (let x1 = 1; x1 < distanceGrid[y1].length - 1; ++x1) {
      if (distanceGrid[y1][x1] === -1) {
        continue;
      }

      for (let y2 = 1; y2 < distanceGrid.length - 1; ++y2) {
        for (let x2 = 1; x2 < distanceGrid[y2].length - 1; ++x2) {
          const distance = Math.abs(y2 - y1) + Math.abs(x2 - x1);

          if (
            distance <= maxCheats &&
            distanceGrid[y2][x2] - distanceGrid[y1][x1] - distance >=
              minimumTimeSaved
          ) {
            ++sum;
          }
        }
      }
    }
  }

  return sum;
}

export default async function main() {
  const data = await loadFile(20);

  const { maze: maze, start: start } = parse(data);
  const distances = bfs(maze, start);

  console.log(
    `Number of cheats that save 100 picoseconds (max 2 cheats): ${countFilteredCheats(
      distances,
      2,
      100
    )}`
  );
  console.log(
    `Number of cheats that save 100 picoseconds (max 20 cheats): ${countFilteredCheats(
      distances,
      20,
      100
    )}`
  );

  console.log("⭐⭐");
}
