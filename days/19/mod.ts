import { loadFile } from "../tools.ts";

/**
 * Parses the input data to extract towel patterns and designs.
 *
 * @param data - The input data as a string.
 * @returns A tuple containing a set of towel patterns and an array of designs.
 */
function parse(data: string): [Set<string>, string[]] {
  const [rawTowels, rawDesigns] = data.split("\n\n");
  const towels = new Set(rawTowels.split(", "));
  const designs = rawDesigns.split("\n");

  return [towels, designs];
}

/**
 * Performs a depth-first search to count the number of ways to construct the remaining design.
 *
 * @param remaining - The remaining part of the design to be constructed.
 * @param towels - A set of available towel patterns.
 * @param memo - A memoization map to store previously computed results.
 * @returns The number of ways to construct the remaining design.
 */
function dfs(
  remaining: string,
  towels: Set<string>,
  memo: Map<string, number>
): number {
  if (remaining === "") return 1;
  if (memo.has(remaining)) return memo.get(remaining)!;

  let totalWays = 0;

  for (const towel of towels) {
    if (remaining.startsWith(towel)) {
      totalWays += dfs(remaining.slice(towel.length), towels, memo);
    }
  }

  memo.set(remaining, totalWays);
  return totalWays;
}

/**
 * Counts the total number of ways to construct all designs and the number of possible designs.
 *
 * @param data - The input data as a string.
 * @returns A tuple containing the number of possible designs and the total number of ways to construct all designs.
 */
function countTotalWaysAndPossibleDesigns(data: string): [number, number] {
  const [towels, designs] = parse(data);

  let totalWays = 0;
  let totalPossibleDesigns = 0;

  for (const design of designs) {
    const memo = new Map<string, number>();
    const ways = dfs(design, towels, memo);
    totalWays += ways;
    totalPossibleDesigns += ways > 0 ? 1 : 0;
  }

  return [totalPossibleDesigns, totalWays];
}

export default async function main() {
  const data = await loadFile(19);

  const [possibleDesigns, ways] = countTotalWaysAndPossibleDesigns(data);

  console.log(`Total possible designs: ${possibleDesigns}`);
  console.log(`Total ways to construct design: ${ways}`);

  console.log("⭐⭐");
}
