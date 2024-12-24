import { loadFile } from "../tools.ts";

type Point = [number, number];

/**
 * Initializes the movement cost map for a given keyboard layout.
 * @param layout - The keyboard layout to initialize the costs for.
 * @returns A map of movement costs between all possible key transitions.
 */
function initMovements(layout: Map<string, Point>): Map<string, number> {
  const keys = Array.from(layout.keys());
  const costs = new Map<string, number>();
  keys.forEach((startKey) => {
    keys.forEach((endKey) => {
      costs.set(`0,${startKey},${endKey}`, 1);
    });
  });
  return costs;
}

/**
 * Creates a movement sequence based on the distance to move.
 * @param distance - The number of steps to move (positive or negative).
 * @param positiveChar - The character representing positive movement.
 * @param negativeChar - The character representing negative movement.
 * @returns A string representing the sequence of movements.
 */
function createMoveSequence(distance: number, positiveChar: string, negativeChar: string): string {
  return Array(Math.abs(distance))
    .fill(distance > 0 ? positiveChar : negativeChar)
    .join("");
}

/**
 * Checks if a path is blocked by the space key.
 * @param x - The x-coordinate to check.
 * @param y - The y-coordinate to check.
 * @param spacePos - The position of the space key.
 * @returns True if the path is blocked, false otherwise.
 */
function isBlockedPath(x: number, y: number, spacePos: Point): boolean {
  return spacePos[0] === x && spacePos[1] === y;
}

/**
 * Calculates the total number of key presses needed for a given sequence on a specific layer.
 * @param layer - The keyboard layer to calculate presses for.
 * @param sequence - The sequence of keys to press.
 * @param movementCosts - A map of movement costs between key transitions.
 * @returns The total number of key presses required to complete the sequence.
 */
function countTotalPresses(layer: number, sequence: string, movementCosts: Map<string, number>): number {
  let totalPresses = 0;
  const fullSequence = "A" + sequence;

  for (let i = 0; i < sequence.length; i++) {
    const keyTransition = `${layer},${fullSequence[i]},${sequence[i]}`;
    const pressCost = movementCosts.get(keyTransition);
    if (pressCost) {
      totalPresses += pressCost;
    }
  }

  return totalPresses;
}

/**
 * Computes the minimal number of key presses required to input a sequence across multiple layers.
 * @param sequence - The sequence of keys to input.
 * @param layers - The number of keyboard layers available.
 * @returns The minimal number of key presses required to input the sequence.
 */
function countMinimalKeyPresses(sequence: string, layers: number): number {
  const [arrows, numerics] = createKeyboards();
  let keyboard: Map<string, Point> = arrows;
  const movementCosts: Map<string, number> = initMovements(keyboard);

  for (let layer = 1; layer <= layers; layer++) {
    if (layer === layers) {
      keyboard = numerics;
    }

    for (const [startKey, [startX, startY]] of keyboard) {
      for (const [endKey, [endX, endY]] of keyboard) {
        const horizontalDist = endX - startX;
        const verticalDist = endY - startY;

        const horizontalMoves = createMoveSequence(horizontalDist, ">", "<");
        const verticalMoves = createMoveSequence(verticalDist, "v", "^");

        const spacePosition = keyboard.get(" ")!;
        let horizontalFirstCost = Infinity;
        let verticalFirstCost = Infinity;

        if (!isBlockedPath(endX, startY, spacePosition)) {
          horizontalFirstCost = countTotalPresses(layer - 1, horizontalMoves + verticalMoves + "A", movementCosts);
        }

        if (!isBlockedPath(startX, endY, spacePosition)) {
          verticalFirstCost = countTotalPresses(layer - 1, verticalMoves + horizontalMoves + "A", movementCosts);
        }

        movementCosts.set(`${layer},${startKey},${endKey}`, Math.min(horizontalFirstCost, verticalFirstCost));
      }
    }
  }

  return countTotalPresses(layers, sequence, movementCosts);
}

/**
 * Creates the arrow and numeric keyboard layouts.
 * @returns A tuple containing the arrow keyboard layout and the numeric keyboard layout.
 */
function createKeyboards(): [Map<string, Point>, Map<string, Point>] {
  const arrowKeyboard = [" ^A", "<v>"].flatMap((row, y) => [...row].map((key, x): [string, Point] => [key, [x, y]]));
  const numericKeyboard = ["789", "456", "123", " 0A"].flatMap((row, y) =>
    [...row].map((key, x): [string, Point] => [key, [x, y]])
  );

  return [new Map(arrowKeyboard), new Map(numericKeyboard)];
}

export default async function main() {
  const data = await loadFile(21);

  const codes = data.split("\n").filter((line) => line.length > 0);

  const complexities = codes
    .reduce((total, sequence) => total + (countMinimalKeyPresses(sequence, 3) * +sequence.slice(0, -1)), 0);

  const involvedComplexities = codes
    .reduce((total, sequence) => total + (countMinimalKeyPresses(sequence, 26) * +sequence.slice(0, -1)), 0);

  console.log(`Sum of complexities: ${complexities}`);
  console.log(`Sum of involved complexities: ${involvedComplexities}`);

  console.log("⭐⭐");
}
