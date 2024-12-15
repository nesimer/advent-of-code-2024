import { loadFile } from "../tools.ts";

type Map = string[][];
enum Direction {
  UP = "^",
  DOWN = "v",
  RIGHT = ">",
  LEFT = "<",
}
type Coords = [number, number];

/**
 * Converts a direction enum value to its corresponding coordinate change.
 */
const directionToCoords: Record<Direction, Coords> = {
  [Direction.UP]: [0, -1],
  [Direction.DOWN]: [0, 1],
  [Direction.RIGHT]: [1, 0],
  [Direction.LEFT]: [-1, 0],
};

/**
 * Parses a map and a list of directions from the provided data string.
 *
 * @param {string} data - The raw data string containing the map and directions.
 * @param {boolean} [isResized=false] - Whether to resize the map symbols.
 * @returns {[Map, Coords[]]} - A tuple containing the parsed map and direction coordinates.
 */
function parseMapAndDirections(data: string, isResized = false): [Map, Coords[]] {
  const [rawMap, rawDirections] = data.split("\n\n");

  const map = (
    isResized
      ? rawMap.replace(/#/g, "##")
        .replace(/O/g, "[]")
        .replace(/\./g, "..")
        .replace(/@/g, "@.")
      : rawMap
  ).split("\n").map((i) => i.split(""));
  const directions = rawDirections.replaceAll("\n", "").split("") as Direction[];

  return [map, directions.map((d) => directionToCoords[d])];
}

/**
 * Moves an element in the specified direction, handling collisions with walls and boxes.
 *
 * @param {Coords} element - The current coordinates of the element to move.
 * @param {Coords} direction - The direction to move the element.
 * @param {Coords[]} walls - An array of coordinates representing walls.
 * @param {Coords[]} boxes - An array of coordinates representing boxes.
 * @returns {boolean} - Whether the move was successful.
 */
function move(element: Coords, direction: Coords, walls: Coords[], boxes: Coords[]): boolean {
  const position: Coords = [element[0] + direction[1], element[1] + direction[0]];
  if (walls.some((w) => w[0] === position[0] && w[1] === position[1])) {
    return false;
  }
  const boxIndex = boxes.findIndex((b) => b[0] === position[0] && b[1] === position[1]);
  if (boxIndex > -1) {
    const doesMove = move(boxes[boxIndex], direction, walls, boxes);
    if (doesMove) {
      boxes[boxIndex] = [boxes[boxIndex][0] + direction[1], boxes[boxIndex][1] + direction[0]];
    }
    return doesMove;
  }
  return true;
}

/**
 * Computes the GPS coordinates by simulating movements based on the parsed map and directions.
 *
 * @param {string} data - The raw data string containing the map and directions.
 * @returns {number} - The calculated GPS coordinate value.
 */
function computeGPSCoords(data: string): number {
  const [map, directions] = parseMapAndDirections(data);
  const boxes: Coords[] = [];
  const walls: Coords[] = [];
  let robot: Coords = [0, 0];

  const maxRow = map.length;
  const maxCol = map[0].length;
  for (let row = 0; row < maxRow; row++) {
    for (let col = 0; col < maxCol; col++) {
      const char = map[row][col];
      if (char === "@") {
        robot = [row, col];
      } else if (char === "O") {
        boxes.push([row, col]);
      } else if (char === "#") {
        walls.push([row, col]);
      }
    }
  }

  for (const direction of directions) {
    if (move(robot, direction, walls, boxes)) {
      robot = [robot[0] + direction[1], robot[1] + direction[0]];
    }
  }

  return boxes.reduce((acc, curr) => (acc + (curr[0] * 100 + curr[1])), 0);
}

export default async function main() {
  const data = await loadFile(15);

  console.log(`GPS coords: ${computeGPSCoords(data)}`);

  console.log("⭐⭐");
}
