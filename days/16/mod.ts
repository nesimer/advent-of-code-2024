import { loadFile } from "../tools.ts";

type Point = { x: number; y: number };
type PointValue = Point & { value: string };
type StackItem = {
  score: number;
  position: Point;
  direction: Direction;
  visited: Map<string, number>;
};

enum Direction {
  UP,
  DOWN,
  RIGHT,
  LEFT,
}

const directionVectors: Record<Direction, { x: number; y: number }> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.RIGHT]: { x: 1, y: 0 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.DOWN]: { x: 0, y: 1 },
};

/**
 * Converts a Point to a string representation.
 * @param point - The point to convert.
 * @returns The string representation of the point.
 */
function pointToString(point: Point) {
  return point.x + "," + point.y;
}

/**
 * Converts maze data to an array of PointValue objects.
 * @param data - The maze data as a string.
 * @returns An array of PointValue objects.
 */
function getMazeAsPoints(data: string): PointValue[] {
  return data
    .split("\n")
    .flatMap((row, y) => row.split("").map((value, x) => ({ x, y, value })));
}

/**
 * Gets the opposite directions for a given direction.
 * @param dir - The current direction.
 * @returns An array of opposite directions.
 */
function getOppositeDirections(dir: Direction) {
  if (dir === Direction.RIGHT || dir === Direction.LEFT) {
    return [Direction.UP, Direction.DOWN];
  } else {
    return [Direction.RIGHT, Direction.LEFT];
  }
}

/**
 * Solves the maze and returns the score and number of seats.
 * @param start - The starting point of the maze.
 * @param end - The ending point of the maze.
 * @param lookup - A map of point strings to PointValue objects.
 * @returns An object containing the score and number of seats.
 */
function solveMaze(
  start: Point,
  end: Point,
  lookup: Map<string, PointValue>
): { score: number; seats: number } {
  const stack: StackItem[] = [
    {
      score: 0,
      position: start,
      direction: Direction.RIGHT,
      visited: new Map<string, number>(),
    },
  ];

  const seen = new Set<string>();
  let totalScore = 0;
  let seats = new Set<string>();

  while (stack.length) {
    const currentStackItem = stack.pop()!;
    const {
      score,
      position,
      direction,
      visited: initialVisited,
    } = currentStackItem;
    const visited = new Map(initialVisited);
    const posStr = pointToString(position);
    const state = `${posStr};${direction}`;

    visited.set(state, score);

    if (posStr === pointToString(end)) {
      if (!totalScore) {
        totalScore = score;
        seats = new Set(visited.keys());
      } else if (totalScore === score) {
        seats = new Set([...seats, ...visited.keys()]);
      } else {
        break;
      }
      continue;
    }

    if (seen.has(state)) {
      stack.forEach((item) => {
        if (item.visited.get(state) === score) {
          item.visited = new Map([...item.visited, ...visited]);
        }
      });
      continue;
    }
    seen.add(state);

    getOppositeDirections(direction).forEach((d) => {
      stack.push({
        score: score + 1000,
        position,
        direction: d,
        visited: new Map(visited),
      });
    });

    const directionVector = directionVectors[direction];
    const nextPosition: Point = {
      x: position.x + directionVector.x,
      y: position.y + directionVector.y,
    };
    const nextPosStr = pointToString(nextPosition);
    const itemAtPos = lookup.get(nextPosStr);

    if (itemAtPos && itemAtPos.value !== "#") {
      stack.push({
        score: score + 1,
        position: nextPosition,
        direction,
        visited,
      });
    }

    stack.sort((a, b) => b.score - a.score);
  }

  // to remove direction and have only position
  const finalSeats = new Set([...seats].map((v) => v.split(";")[0]));

  return { score: totalScore, seats: finalSeats.size };
}

export default async function main() {
  const data = await loadFile(16);

  const points = getMazeAsPoints(data);
  const start = points.find((p) => p.value === "S")!;
  const end = points.find((p) => p.value === "E")!;
  const lookup = new Map<string, PointValue>(
    points.map((p) => [pointToString(p), p])
  );

  const { score, seats } = solveMaze(start, end, lookup);

  console.log(`Lowest score to solve maze: ${score}`);
  console.log(`Number of seats: ${seats}`);

  console.log("⭐⭐");
}
