import { loadFile } from "../tools.ts";

type Rules = Record<number, number[]>;
type RuleChecker = (page: number, index: number, arr: number[]) => boolean;

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
  const checker = checkRule(rules);
  return orders
    .filter((o) => o.every(checker))
    .reduce((acc, curr) => acc + curr[Math.round((curr.length - 1) / 2)], 0);
}

/**
 * Checks if an order satisfies the given rules.
 *
 * @param {number[]} order - The order to check.
 * @param {Rules} rules - The rules to check against.
 * @returns {boolean} True if the order satisfies the rules, false otherwise.
 */
function checkRule(rules: Rules): RuleChecker {
  return (page: number, index: number, arr: number[]) => {
    if (!rules[page]) {
      return true;
    }
    return !rules[page].some((i) => arr.slice(0, index).includes(i));
  };
}

/**
 * Moves an element in an array from one position to another.
 *
 * @param {number[]} array - The array to modify.
 * @param {number} from - The index of the element to move.
 * @param {number} to - The index to move the element to.
 */
function move(array: number[], from: number, to: number) {
  const item = array[from];
  array.splice(from, 1);
  array.splice(to, 0, item);
}

/**
 * Fixes an order to satisfy the given rules by moving elements within the order.
 *
 * @param {number[]} order - The order to fix.
 * @param {RuleChecker} checker - The function to check if an element satisfies the rules.
 * @returns {number[]} The fixed order that satisfies the rules.
 */
function fixOrder(order: number[], checker: RuleChecker): number[] {
  const fixedOrder = [...order];
  for (const page of order) {
    while (!checker(page, fixedOrder.indexOf(page), fixedOrder)) {
      move(fixedOrder, fixedOrder.indexOf(page), fixedOrder.indexOf(page) - 1);
    }
  }
  return fixedOrder;
}

/**
 * Sums the middle elements of orders that do not initially satisfy the given rules,
 * after fixing them to satisfy the rules.
 *
 * @param {string} data - The input data containing rules and orders.
 * @returns {number} The sum of the middle elements of fixed orders that satisfy the rules.
 */
function sumMiddleFixedOrders(data: string): number {
  const [rules, orders] = parse(data);
  const checker = checkRule(rules);
  return orders
    .filter((o) => !o.every(checker))
    .map((o) => fixOrder(o, checker))
    .reduce((acc, curr) => acc + curr[Math.round((curr.length - 1) / 2)], 0);
}

export default async function main() {
  const data = await loadFile(5);
  console.log(`Total of ok orders middle page: ${sumMiddleOkOrders(data)}`);
  console.log(
    `Total of fixed orders middle page: ${sumMiddleFixedOrders(data)}`
  );
  console.log("⭐⭐");
}
