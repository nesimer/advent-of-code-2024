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
 * @param {Point} point - The point whose quadrant is to be determined.
 * @param {Map<string, number>} quadrantMap - A map that tracks the count of points in each quadrant.
 * @param {number} widthQuadrantLimit - The horizontal midpoint of the grid.
 * @param {number} heightQuadrantLimit - The vertical midpoint of the grid.
 */
function incrementQuadrant(
  point: Point,
  quadrantMap: Map<string, number>,
  widthQuadrantLimit: number,
  heightQuadrantLimit: number,
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
 * Computes the position of a point after moving with a given velocity for a specified number of seconds.
 *
 * The position wraps around if it exceeds the grid boundaries.
 *
 * @param {Point} start - The starting position of the point.
 * @param {Velocity} velocity - The velocity of the point as [dx, dy].
 * @param {number} seconds - The number of seconds to simulate.
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 * @returns {Point} - The computed position after the specified time.
 */
function computePosition(start: Point, velocity: Velocity, seconds: number, width: number, height: number): Point {
  const position: Point = {
    x: (start.x + velocity[0] * seconds) % width,
    y: (start.y + velocity[1] * seconds) % height,
  };

  if (position.x < 0) {
    position.x += width;
  }
  if (position.y < 0) {
    position.y += height;
  }

  return position;
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
    const finalPosition = computePosition(position, velocity, maxIteration, width, height);

    incrementQuadrant(finalPosition, quadrantMap, widthQuadrantLimit, heightQuadrantLimit);
  }

  return quadrantMap.values().reduce((acc, curr) => acc * curr, 1);
}

/**
 * Checks for a Christmas tree pattern in a grid generated from points.
 *
 * The function creates a grid of the given dimensions, maps the points onto it,
 * and checks if any row contains a contiguous block of `#` characters.
 *
 * @param {Point[]} points - An array of points to map onto the grid.
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 * @returns {boolean} - True if a Christmas tree pattern is found, otherwise false.
 */
function maybeChristmasTree(points: Point[], width: number, height: number) {
  const array = Array.from({ length: height }, () => Array.from({ length: width }, () => " "));
  points.forEach(({ x, y }) => {
    array[y][x] = "#";
  });

  const isChristmasTree = array.some((row) => row.join("").includes("############"));

  if (isChristmasTree) {
    console.log(array.map((i) => i.join("")).join("\n"));
  }

  return isChristmasTree;
}

/**
 * Determines potential durations where a Christmas tree pattern appears in the grid.
 *
 * The function simulates the positions of robots over a range of time and checks for the pattern.
 *
 * @param {string} data - The raw string data containing robot information.
 * @returns {number[]} - An array of durations where the pattern appears.
 */
function checkChristmasTree(data: string) {
  const robots = parseRobots(data);
  const width = Deno.env.get("WITH_EXAMPLE") === "true" ? 11 : 101;
  const height = Deno.env.get("WITH_EXAMPLE") === "true" ? 7 : 103;

  const potentialDurations = [];
  let seconds = 0;

  while (seconds < 10_000) {
    const positions = robots.map((r) => computePosition(r.position, r.velocity, seconds, width, height));

    if (maybeChristmasTree(positions, width, height)) {
      potentialDurations.push(seconds);
    }

    seconds += 1;
  }

  return potentialDurations;
}

export default async function main() {
  const data = await loadFile(14);

  console.log(`Safety factor: ${calculateSafetyFactor(data)}`);
  console.log(`Durations for safety factor as christmas tree: ${checkChristmasTree(data)}`);

  console.log("⭐⭐");
}
