import { loadFile } from "../tools.ts";

const MAX_HEIGHT = 5;

type Type = "key" | "lock";
type Grid = string[][];

function parse(data: string): { locks: Grid[]; keys: Grid[] } {
  const schematics = data.split("\n\n");

  const locks: Grid[] = [];
  const keys: Grid[] = [];
  for (const schematic of schematics) {
    const lines = schematic.split("\n");
    const chars = lines.map((l) => l.split(""));
    if (lines[0] === "#####" && lines[lines.length - 1] === ".....") {
      locks.push(chars);
    }
    if (lines[0] === "....." && lines[lines.length - 1] === "#####") {
      keys.push(chars);
    }
  }

  return { locks, keys };
}

function getHeights(schematic: string[][]): number[] {
  const heights = [];
  const numColumns = schematic[0].length;

  for (let col = 0; col < numColumns; col++) {
    let height = 0;
    for (let row = 0; row < schematic.length; row++) {
      if (schematic[row][col] === "#") {
        height++;
      }
    }
    heights.push(height);
  }

  return heights;
}

function fits(lockHeights: number[], keyHeights: number[]): boolean {
  for (let i = 0; i < lockHeights.length; i++) {
    if (lockHeights[i] + keyHeights[i] > 6) {
      return false;
    }
  }
  return true;
}

function retrieveHeights(data: string): { lockHeights: number[][]; keyHeights: number[][] } {
  const lockHeights: number[][] = [];
  const keyHeights: number[][] = [];

  const { locks, keys } = parse(data);

  for (const lock of locks) {
    const [_, ...lockData] = lock;
    lockHeights.push(getHeights(lockData));
  }

  for (const key of keys) {
    const [_, ...keyData] = key;
    keyHeights.push(getHeights(keyData));
  }

  return { lockHeights, keyHeights };
}

function countUniqueFittingPairs(data: string) {
  const { lockHeights, keyHeights } = retrieveHeights(data);

  let count = 0;

  for (const lockHeight of lockHeights) {
    for (const keyHeight of keyHeights) {
      if (fits(lockHeight, keyHeight)) {
        count++;
      }
    }
  }

  return count;
}

export default async function main() {
  const data = await loadFile(25);

  console.log(`Unique lock/key pairs fit together: ${countUniqueFittingPairs(data)}`);

  console.log("⭐⭐");
}
