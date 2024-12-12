import { loadFile } from "../tools.ts";

type Point = [number, number];
const directions = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

/**
 * Parses the input map into a 2D array.
 *
 * @param {string} data - The input data containing the map.
 * @returns {string[][]} The parsed map as a 2D array.
 */
function parseMap(data: string): string[][] {
  return data.split("\n").map((line) => line.split(""));
}

/**
 * Checks if a point is within the bounds of the map.
 *
 * @param {Point} point - The point to check.
 * @param {number} rowLimit - The row limit of the map.
 * @param {number} colLimit - The column limit of the map.
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

/**
 * Counts the number of sides of a region from a given point.
 *
 * @param {string[][]} map - The map as a 2D array.
 * @param {Point} point - The point to start counting sides from.
 * @param {string} plantType - The type of plant in the region.
 * @returns {number} The number of sides of the region from the given point.
 */
function countPointSides(
  map: string[][],
  [x, y]: Point,
  plantType: string
): number {
  let sides = 0;
  if (
    map[x]?.[y - 1] !== plantType &&
    !(map[x - 1]?.[y] === plantType && map[x - 1]?.[y - 1] !== plantType)
  )
    sides += 1;
  if (
    map[x]?.[y + 1] !== plantType &&
    !(map[x - 1]?.[y] === plantType && map[x - 1]?.[y + 1] !== plantType)
  )
    sides += 1;
  if (
    map[x - 1]?.[y] !== plantType &&
    !(map[x]?.[y - 1] === plantType && map[x - 1]?.[y - 1] !== plantType)
  )
    sides += 1;
  if (
    map[x + 1]?.[y] !== plantType &&
    !(map[x]?.[y - 1] === plantType && map[x + 1]?.[y - 1] !== plantType)
  )
    sides += 1;
  return sides;
}

/**
 * Performs a depth-first search (DFS) to calculate the area, perimeter, and number of sides of a region.
 *
 * @param {string[][]} map - The map as a 2D array.
 * @param {Point} start - The starting point of the region.
 * @param {string} plantType - The type of plant in the region.
 * @param {Set<string>} visited - A set of visited positions.
 * @returns {[number, number, number]} The area, perimeter, and number of sides of the region.
 */
function calculateAreaPerimeterSides(
  map: string[][],
  start: Point,
  plantType: string,
  visited: Set<string>
): [number, number, number] {
  const stack: Point[] = [start];
  let area = 0;
  let perimeter = 0;
  let sides = 0;

  while (stack.length > 0) {
    const [row, col] = stack.pop()!;
    if (visited.has(`${row},${col}`)) continue;
    visited.add(`${row},${col}`);
    area++;
    sides += countPointSides(map, [row, col], plantType);

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      const newPoint: Point = [newRow, newCol];

      if (
        isWithinBounds(newPoint, map.length, map[0].length) &&
        map[newRow][newCol] === plantType
      ) {
        stack.push(newPoint);
      } else {
        perimeter++;
      }
    }
  }

  return [area, perimeter, sides];
}

/**
 * Calculates total prices of fencing all regions on the map.
 *
 * @param {string} data - The input data containing the map.
 * @returns {[number, number]} - Total prices of fencing all regions. [by area and perimeter, by area and sides]
 */
function getFencingRegionsPrices(data: string): [number, number] {
  const map = parseMap(data);
  const visited = new Set<string>();
  let totalAreaPerimeter = 0;
  let totalAreaSides = 0;

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[0].length; col++) {
      const plantType = map[row][col];
      if (!visited.has(`${row},${col}`)) {
        const [area, perimeter, sides] = calculateAreaPerimeterSides(
          map,
          [row, col],
          plantType,
          visited
        );
        totalAreaPerimeter += area * perimeter;
        totalAreaSides += area * sides;
      }
    }
  }

  return [totalAreaPerimeter, totalAreaSides];
}

export default async function main() {
  const data = await loadFile(12);
  const [totalAreaPerimeter, totalAreaSides] = getFencingRegionsPrices(data);

  console.log(`Price of fencing all regions: ${totalAreaPerimeter}`);
  console.log(`New price of fencing all regions: ${totalAreaSides}`);

  console.log("⭐⭐");
}
