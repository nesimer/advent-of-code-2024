import { loadFile } from "../tools.ts";

type Point = [number, number];

/**
 * Converts the input data into a 2D grid of numbers.
 *
 * @param {string} data - The input data containing the topographic map.
 * @returns {number[][]} The parsed topographic map as a 2D array.
 */
function toMap(data: string): number[][] {
  return data.split("\n").map((i) => i.split("").map(Number));
}

/**
 * Retrieves all trailheads with height 0 from the grid.
 *
 * @param {number[][]} grid - The topographic map as a 2D array.
 * @returns {Point[]} An array of trailhead positions.
 */
function retrieveTrailheads(map: number[][]): Point[] {
  const trailheads: Point[] = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[0].length; col++) {
      if (map[row][col] === 0) {
        trailheads.push([row, col]);
      }
    }
  }
  return trailheads;
}

/**
 * Checks if a point is within the bounds of the grid.
 *
 * @param {Point} point - The point to check.
 * @param {number} rowLimit - The row limit of the grid.
 * @param {number} colLimit - The column limit of the grid.
 * @returns {boolean} True if the point is within bounds, false otherwise.
 */
function isWithinBounds(
  point: Point,
  rowLimit: number,
  colLimit: number
): boolean {
  return (
    point[0] >= 0 && point[0] < rowLimit && point[1] >= 0 && point[1] < colLimit
  );
}

const directions = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

/**
 * Performs a recursive depth-first search (DFS) to find all hiking trails from a given trailhead.
 *
 * @param {number[][]} grid - The topographic map as a 2D array.
 * @param {Point} point - The current point in the map.
 * @param {number} height - The current height value.
 * @param {Set<string>} fullTrails - A set of unique 9-height positions reachable from the trailhead.
 */
function searchHikingTrail(
  map: number[][],
  point: Point,
  height: number,
  fullTrails: Set<string>
) {
  if (height === 9) {
    fullTrails.add(`${point[0]},${point[1]}`);
    return;
  }

  for (const [dx, dy] of directions) {
    const row = point[0] + dx;
    const col = point[1] + dy;
    const expectedHeight = height + 1;

    if (
      isWithinBounds([row, col], map.length, map[0].length) &&
      map[row][col] === expectedHeight
    ) {
      searchHikingTrail(map, [row, col], expectedHeight, fullTrails);
    }
  }
}

/**
 * Calculates the total score of all trailheads that have complete hiking trails in the topographic map.
 *
 * @param {string} data - The input data containing the topographic map.
 * @returns {number} The total score of all trailheads.
 */
function getTrailheadsScore(data: string): number {
  const map = toMap(data);
  const trailheads = retrieveTrailheads(map);

  let score = 0;

  for (const [row, col] of trailheads) {
    const fullTrails = new Set<string>();
    searchHikingTrail(map, [row, col], 0, fullTrails);
    score += fullTrails.size;
  }

  return score;
}

export default async function main() {
  const data = await loadFile(10);

  console.log(`Trailhead score: ${getTrailheadsScore(data)}`);
  console.log("⭐");
}
