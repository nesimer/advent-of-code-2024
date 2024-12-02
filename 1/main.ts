/**
 * Reads a file containing two lists of numbers separated by spaces,
 * parses the file, and returns the two lists as arrays of numbers.
 *
 * @returns {Promise<[number[], number[]]>} A promise that resolves to a tuple containing two arrays of numbers.
 */
async function loadListsFile() {
  try {
    const data = await Deno.readTextFile("./1/input.txt");
    const lines = data.split("\n").map((line) => line.trim());
    return lines.reduce(
      (acc, line) => {
        const [first, second] = line.split(/\s+/);
        acc[0].push(+first);
        acc[1].push(+second);
        return acc;
      },
      [[], []] as [number[], number[]]
    );
  } catch (e) {
    console.error("Error reading the file:", e);
    throw e;
  }
}

/**
 * Computes the distance between two lists of numbers.
 * The distance is defined as the sum of the absolute differences
 * between corresponding elements in the sorted versions of the two lists.
 *
 * @param {number[]} firstList - The first list of numbers.
 * @param {number[]} secondList - The second list of numbers.
 * @returns {number} The computed distance.
 */
function computeDistance(firstList: number[], secondList: number[]): number {
  const firstListSorted = firstList.sort();
  const secondListSorted = secondList.sort();
  return firstListSorted.reduce(
    (acc, item, i) => acc + Math.abs(item - secondListSorted[i]),
    0
  );
}

/**
 * Computes the similarity between two lists of numbers.
 * The similarity is defined as the sum of the products of each number in the first list
 * and the number of times it appears in the second list.
 *
 * @param {number[]} firstList - The first list of numbers.
 * @param {number[]} secondList - The second list of numbers.
 * @returns {number} The computed similarity.
 */
function computeSimilarity(firstList: number[], secondList: number[]): number {
  return firstList.reduce(
    (acc, item) => acc + item * secondList.filter((x) => x === item).length,
    0
  );
}

export default async function main() {
  const [firstList, secondList] = await loadListsFile();
  const distance = computeDistance(firstList, secondList);
  const similarity = computeSimilarity(firstList, secondList);
  console.log(`distance: ${distance}`);
  console.log(`similarity: ${similarity}`);
}
