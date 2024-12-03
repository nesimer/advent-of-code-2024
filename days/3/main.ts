/**
 * Reads a file containing two lists of numbers separated by spaces,
 * parses the file, and returns the two lists as arrays of numbers.
 *
 * @returns {Promise<string>} A promise that resolves to a tuple containing two arrays of numbers.
 */
function loadListsFile() {
  try {
    return Deno.readTextFile("./days/3/input.txt");
  } catch (e) {
    console.error("Error reading the file:", e);
    throw e;
  }
}

/**
 * A tuple representing a captured multiplication operation.
 * The first and second elements are the captured numbers.
 * The third element is the full match string,
 */
type CapturedMul = [number, number, string];

/**
 * Parses the input data to extract all multiplication operations.
 *
 * @param {string} data - The input data containing multiplication operations.
 * @returns {CapturedMul[]} An array of captured multiplication operations.
 */
function parseData(data: string): CapturedMul[] {
  const regex = /mul\((\d+),(\d+)\)/gm;
  return data
    .matchAll(regex)
    .toArray()
    .map(([captured, firstGroup, secondGroup]) => [
      +firstGroup,
      +secondGroup,
      captured,
    ]);
}

/**
 * Computes the sum of all multiplication operations in the input data.
 *
 * @param {string} data - The input data containing multiplication operations.
 * @returns {number} The sum of all multiplications.
 */
function computeSumMul(data: string): number {
  return parseData(data).reduce(
    (acc, [first, second]) => acc + first * second,
    0
  );
}

export default async function main() {
  const corruptedData = await loadListsFile();
  console.log(
    `The sum of all the multiplications is: ${computeSumMul(corruptedData)}`
  );
  console.log("⭐");
}
