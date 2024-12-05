import { loadFile } from "../tools.ts";

type Rules = Record<number, number[]>;

/**
 * Parses the input data to extract rules and orders.
 *
 * @param {string} data - The input data containing rules and orders.
 * @returns {[Rules, number[][]]} A tuple containing the parsed rules and orders.
 */
function parse(data: string): [Rules, number[][]] {
  const [rules, orders] = data.split("\n\n");
  const parsedRules = rules.split("\n").reduce((acc, rule) => {
    const [min, max] = rule.split("|");
    return { ...acc, [+min]: [...(acc[+min] || []), +max] };
  }, {} as Rules);
  const parsedOrders = orders.split("\n").map((i) => i.split(",").map(Number));
  return [parsedRules, parsedOrders];
}

/**
 * Sums the middle elements of orders that satisfy the given rules.
 *
 * @param {string} data - The input data containing rules and orders.
 * @returns {number} The sum of the middle elements of orders that satisfy the rules.
 */
function sumMiddleOkOrders(data: string): number {
  const [rules, orders] = parse(data);
  return orders
    .filter((o) => checkRules(o, rules))
    .reduce((acc, curr) => acc + curr[Math.round((curr.length - 1) / 2)], 0);
}

/**
 * Checks if an order satisfies the given rules.
 *
 * @param {number[]} order - The order to check.
 * @param {Rules} rules - The rules to check against.
 * @returns {boolean} True if the order satisfies the rules, false otherwise.
 */
function checkRules(order: number[], rules: Rules) {
  return !order.some(
    (order, index, arr) =>
      !!rules[order] &&
      arr.slice(0, index).some((i) => rules[order].includes(+i))
  );
}

export default async function main() {
  const data = await loadFile(5);
  console.log(`Total of ok orders middle page: ${sumMiddleOkOrders(data)}`);
  console.log("⭐");
}
