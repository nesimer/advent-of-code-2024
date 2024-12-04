import { loadFile } from "../tools.ts";

/**
 * A tuple representing a captured multiplication operation.
 * The first and second elements are the captured numbers,
 * The third element is the full match string,
 */
type CapturedMul = [number, number, string];

function parse(data: string, regex: RegExp): IteratorObject<CapturedMul> {
  return data.matchAll(regex).map((m) => [+m[1], +m[2], m[0]] as CapturedMul);
}

/**
 * Computes the sum of all parsed multiplication operations in the input data.
 *
 * @param {string} data - The input data containing multiplication operations.
 * @returns {number} The sum of all multiplications.
 */
function computeSumMul(data: string): number {
  const regex = /mul\((\d+),(\d+)\)/g;
  return parse(data, regex).reduce((a, [gr1, gr2]) => (a || 0) + gr1 * gr2, 0);
}

/**
 * Computes the sum of all parsed multiplication operations in the input data depending on do/don't rules.
 *
 * @param {string} data - The input data containing multiplication operations.
 * @returns {number} The sum of all multiplications.
 */
function computeWantedSumMul(data: string): number {
  const regex = /mul\((\d+),(\d+)\)|(do\(\)|don\'t\(\))/g;
  let active = true;
  return parse(data, regex).reduce((a, [gr1, gr2, captured]) => {
    switch (captured) {
      case "do()": {
        active = true;
        return a;
      }
      case "don't()": {
        active = false;
        return a;
      }
      default: {
        return active ? a + gr1 * gr2 : a;
      }
    }
  }, 0);
}

export default async function main() {
  const corruptedData = await loadFile(3);
  console.log(
    `The sum of all the multiplications is: ${computeSumMul(corruptedData)}`
  );
  console.log(
    `The sum of all the wanted multiplications is: ${computeWantedSumMul(
      corruptedData
    )}`
  );
  console.log("⭐⭐");
}
