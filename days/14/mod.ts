import { loadFile } from "../tools.ts";

type Point = { x: number; y: number };
type Velocity = [number, number];
type Robot = {
  position: Point;
  velocity: Velocity;
};

/**
 * Parses robot data from a string into an array of Robot objects.
 *
 * Each robot is represented by its position and velocity extracted from the input string.
 *
 * @param {string} data - The raw string data containing robot information.
 * @returns {Robot[]} - An array of Robot objects with position and velocity.
 */
function parseRobots(data: string): Robot[] {
  const regex = /p=(\d+),(\d+) v=(-?\d+),(-?\d+)/;
  const robots = data.split("\n").map<Robot>((r) => {
    const match = r.match(regex)!;
    return {
      position: { x: +match[1], y: +match[2] },
      velocity: [+match[3], +match[4]],
    };
  });
  return robots;
}

/**
 * Increments the count in the appropriate quadrant based on the provided point.
 *
 * The quadrants are determined by dividing the width and height into two halves.
 *
 * @param {number} widthQuadrantLimit - The horizontal midpoint of the grid.
 * @param {number} heightQuadrantLimit - The vertical midpoint of the grid.
 * @param {Point} point - The point whose quadrant is to be determined.
 * @param {Map<string, number>} quadrantMap - A map that tracks the count of points in each quadrant.
 */
function incrementQuadrant(
  widthQuadrantLimit: number,
  heightQuadrantLimit: number,
  point: Point,
  quadrantMap: Map<string, number>,
) {
  if (point.x === widthQuadrantLimit || point.y === heightQuadrantLimit) {
    return;
  }

  const horizontalKey = point.x < widthQuadrantLimit ? "left" : "right";
  const verticalKey = point.y < heightQuadrantLimit ? "top" : "bottom";
  const key = verticalKey + horizontalKey;
  quadrantMap.set(key, (quadrantMap.get(key) || 0) + 1);
}

/**
 * Calculates the safety factor for robots based on their positions and velocities.
 *
 * The safety factor is calculated by simulating the final positions of robots after a certain number
 * of iterations and determining the distribution of robots across quadrants.
 *
 * @param {string} data - The raw string data containing robot information.
 * @returns {number} - The calculated safety factor.
 */
function calculateSafetyFactor(data: string): number {
  const maxIteration = 100;
  const robots = parseRobots(data);
  const width = Deno.env.get("WITH_EXAMPLE") === "true" ? 11 : 101;
  const height = Deno.env.get("WITH_EXAMPLE") === "true" ? 7 : 103;

  const widthQuadrantLimit = Math.floor(width / 2);
  const heightQuadrantLimit = Math.floor(height / 2);

  const quadrantMap = new Map<string, number>();

  for (const { position, velocity } of robots) {
    const finalPosition: Point = {
      x: (position.x + velocity[0] * maxIteration) % width,
      y: (position.y + velocity[1] * maxIteration) % height,
    };

    if (finalPosition.x < 0) {
      finalPosition.x += width;
    }
    if (finalPosition.y < 0) {
      finalPosition.y += height;
    }

    incrementQuadrant(widthQuadrantLimit, heightQuadrantLimit, finalPosition, quadrantMap);
  }

  return quadrantMap.values().reduce((acc, curr) => acc * curr, 1);
}

export default async function main() {
  const data = await loadFile(14);

  console.log(`Safety Factor: ${calculateSafetyFactor(data)}`);

  console.log("⭐⭐");
}
