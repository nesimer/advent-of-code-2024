import { loadFile } from "../tools.ts";

type Point = { x: number; y: number };

const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

/**
 * Parses the input data to extract the map, start, and end points.
 *
 * @param data - The input data as a string.
 * @returns An object containing the map as a 2D array of strings, the start point, and the end point.
 */
function parse(data: string): {
  map: string[][];
  start: Point;
  end: Point;
} {
  let end: Point = { x: -1, y: -1 };
  let start: Point = { x: -1, y: -1 };
  const map = data
    .trim()
    .split("\n")
    .map((line) => line.split(""));
  map.forEach((line, y) => {
    line.forEach((cell, x) => {
      if (cell === "S") {
        start = { x, y };
      }
      if (cell === "E") {
        end = { x, y };
      }
    });
  });

  return { map, start, end };
}

/**
 * Performs a breadth-first search (BFS) to find the shortest path from the start point to the end point.
 *
 * @param map - The map as a 2D array of strings.
 * @param start - The starting point.
 * @param end - The ending point.
 * @returns The number of iteration in the shortest path, or Infinity if no path is found.
 */
function bfs(map: string[][], start: Point, end: Point): number {
  const queue: [Point, number][] = [[start, 0]];
  const visited = new Set<string>();

  const height = map.length;
  const width = map[0].length;

  const isWithinBounds = ({ x, y }: Point) =>
    x >= 0 && y >= 0 && y < height && x < width && map[y][x] !== "#";

  const distance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);

  if (distance > 200) return Infinity;

  while (queue.length) {
    const [currentPosition, iteration] = queue.shift()!;

    if (currentPosition.x === end.x && currentPosition.y === end.y) {
      return iteration;
    }

    const key = `${currentPosition.x},${currentPosition.y}`;

    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    for (const [dx, dy] of directions) {
      const newPoint = { x: currentPosition.x + dx, y: currentPosition.y + dy };
      const newKey = `${newPoint.x},${newPoint.y}`;
      if (isWithinBounds(newPoint) && !visited.has(newKey)) {
        queue.push([newPoint, iteration + 1]);
      }
    }
  }

  return Infinity;
}

/**
 * Gets the path score (shortest path length) between two points on the map.
 *
 * @param from - The starting point.
 * @param to - The ending point.
 * @param map - The map as a 2D array of strings.
 * @param checkedPaths - A map to cache previously computed path scores.
 * @returns The path score between the two points.
 */
function getPathScore(
  from: Point,
  to: Point,
  map: string[][],
  checkedPaths: Map<string, number>
): number {
  const key = `${from.x},${from.y}->${to.x},${to.y}`;
  if (!checkedPaths.has(key)) {
    checkedPaths.set(key, bfs(map, from, to));
  }
  return checkedPaths.get(key)!;
}

function countCheats(
  data: string,
  maxCheats: number,
  minimumTimeSaved: number
): number {
  let totalSavings = 0;

  const { map, start, end } = parse(data);
  const height = map.length;
  const width = map[0].length;

  const withoutCheat = bfs(map, start, end);

  const checkedPaths = new Map<string, number>();

  for (let y1 = 0; y1 < height; y1++) {
    for (let x1 = 0; x1 < width; x1++) {
      if (map[y1][x1] === "#") continue;

      const toCheatStart = getPathScore(
        start,
        { x: x1, y: y1 },
        map,
        checkedPaths
      );

      if (toCheatStart === Infinity) continue;

      for (
        let y2 = Math.max(0, y1 - maxCheats);
        y2 <= Math.min(height - 1, y1 + maxCheats);
        y2++
      ) {
        for (
          let x2 = Math.max(0, x1 - maxCheats);
          x2 <= Math.min(width - 1, x1 + maxCheats);
          x2++
        ) {
          if (map[y2][x2] === "#") continue;

          const cheatLength = Math.abs(x2 - x1) + Math.abs(y2 - y1);
          if (cheatLength > maxCheats) continue;
          const fromCheatEnd = getPathScore(
            { x: x2, y: y2 },
            end,
            map,
            checkedPaths
          );

          if (fromCheatEnd === Infinity) continue;

          const timeSaved =
            withoutCheat - (toCheatStart + cheatLength + fromCheatEnd);
          if (timeSaved >= minimumTimeSaved) {
            totalSavings++;
          }
        }
      }
    }
  }

  return totalSavings;
}

export default async function main() {
  const data = await loadFile(20);

  console.log(
    `Number of cheats that save 100 picoseconds (max 2 cheats): ${countCheats(
      data,
      2,
      100
    )}`
  );
  console.log(
    `Number of cheats that save 100 picoseconds (max 20 cheats): ${countCheats(
      data,
      20,
      100
    )}`
  );

  console.log("⭐⭐");
}
