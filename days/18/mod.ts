import { loadFile } from "../tools.ts";

type Point = { x: number; y: number };
const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

/**
 * Converts a Point object to a string representation.
 * @param p - The point to convert.
 * @returns The string representation of the point.
 */
function toString(p: Point): string {
  return `${p.x},${p.y}`;
}

/**
 * Finds a path through a maze using the Breadth-First Search (BFS) algorithm.
 * @param maze - A 2D array representing the maze.
 * @param start - The starting point in the maze.
 * @param end - The ending point in the maze.
 * @returns An array of strings representing the path from the start to the end of the maze.
 */
function findPathBFS(maze: string[][], start: Point, end: Point): string[] {
  const queue: [Point, string[]][] = [[start, []]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [point, path] = queue.shift()!;
    const pointAsString = toString(point);

    if (point.x === end.x && point.y === end.y) {
      return [...path, pointAsString];
    }

    if (visited.has(pointAsString)) {
      continue;
    }

    visited.add(pointAsString);

    for (const [dx, dy] of directions) {
      const newX = point.x + dx;
      const newY = point.y + dy;

      if (
        newX >= 0 &&
        newX < maze[0].length &&
        newY >= 0 &&
        newY < maze.length &&
        maze[newY][newX] === "."
      ) {
        queue.push([{ x: newX, y: newY }, [...path, pointAsString]]);
      }
    }
  }

  return [];
}

/**
 * Finds the best path through a maze using a custom algorithm.
 * @param fallenBytes - a list of point that represents walls of maze.
 * @param width - The width of the maze.
 * @param height - The height of the maze.
 * @param maxIteration - The maximum number of iterations to process the maze data.
 * @returns The length of the best path from the start to the end of the maze.
 */
function findBestPath(
  fallenBytes: Point[],
  width: number,
  height: number,
  maxIteration: number
): number {
  const computedMaze = Array.from({ length: height + 1 }, () =>
    Array.from({ length: width + 1 }, () => ".")
  );

  for (let i = 0; i < maxIteration; i++) {
    const { x, y } = fallenBytes[i];
    computedMaze[y][x] = "#";
  }

  const start = { x: 0, y: 0 };
  const end = { x: width, y: height };

  const bestPath = findPathBFS(computedMaze, start, end);

  return bestPath.length - 1;
}

/**
 * Finds the first byte in the list of fallen bytes that makes it impossible to find a path through the maze.
 * @param fallenBytes - A list of points that represent walls of the maze.
 * @param width - The width of the maze.
 * @param height - The height of the maze.
 * @returns The string representation of the first point that makes the path impossible, or undefined if no such point is found.
 */
function findFirstImpossiblePathByte(
  fallenBytes: Point[],
  width: number,
  height: number
): string | undefined {
  let i = 0;

  while (i < fallenBytes.length) {
    if (findBestPath(fallenBytes, width, height, i) === -1) {
      return toString(fallenBytes[i - 1]);
    }
    i++;
  }

  return;
}

export default async function main() {
  const data = await loadFile(18);

  const width = Deno.env.get("WITH_EXAMPLE") === "true" ? 6 : 70;
  const height = Deno.env.get("WITH_EXAMPLE") === "true" ? 6 : 70;
  const maxIteration = Deno.env.get("WITH_EXAMPLE") === "true" ? 12 : 1024;

  const fallenBytes: Point[] = data.split("\n").map((l) => {
    const [x, y] = l.split(",");
    return { x: +x, y: +y };
  });

  console.log(
    `Best path: ${findBestPath(fallenBytes, width, height, maxIteration)}`
  );

  console.log(
    `First impossible path byte: ${findFirstImpossiblePathByte(
      fallenBytes,
      width,
      height
    )}`
  );

  console.log("⭐⭐");
}
