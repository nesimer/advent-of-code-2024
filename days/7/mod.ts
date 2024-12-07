import { loadFile } from "../tools.ts";

/**
 * Evaluates an expression given an array of numbers and corresponding operators.
 * 
 * @param numbers - An array of numbers that make up the terms of the expression
 * @param operators - An array of operators ('+' or '*' or '||') to be applied between the numbers
 * @returns The result of evaluating the expression from left to right
 */
function evaluate(numbers: number[], operators: string[]): number {
  return operators.reduce((acc, value, index) => {
    if (value === "+") {
      return acc + numbers[index + 1];
    } else if (value === "*") {
      return acc * numbers[index + 1];
    } else if (value === "||") {
      return +`${acc}${numbers[index + 1]}`;
    } else {
      return acc;
    }
  }, numbers[0]);
}

/**
 * Generates all possible combinations of operators passed in params for a given length.
 * 
 * @param length - The number of operators to include in each combination
 * @param operators - The list of wanted operators for combination
 * @returns An array of arrays, where each inner array is a combination of operators
 */
function generateOperatorCombinations(length: number, operators: string[]): string[][] {
  return Array.from({ length }).reduce<string[][]>(
    (acc) => acc.flatMap((combinations) => operators.map((op) => [...combinations, op])),
    [[]]
  );
}

/**
 * Counts the total of valid equations from a string input, 
 * where each line contains a target value and 
 * a list of numbers to be combined using operators to match the target.
 * 
 * Default attempted operators are: ["+", "*"]
 * 
 * @param data - A string that contains data
 * @returns The sum of all target values for which a valid operator combination exists
 */
function countValidEquation(data: string, operators = ['+', '*']): number {
  let total = 0;

  for (const line of data.split("\n")) {
    const splittedLine = line.split(':');
    const expected = +splittedLine[0].trim();
    const numbers = splittedLine[1].trim().split(' ').map(Number)

    const operatorCombinations = generateOperatorCombinations(numbers.length - 1, operators);
    if (operatorCombinations.some((attemptCombination) => evaluate(numbers, attemptCombination) === expected)) {
      total += expected;
    }
  }

  return total;
}

/**
* Counts the total of valid equations from a string input, 
* where each line contains a target value and 
* a list of numbers to be combined using operators to match the target.
* 
* For this case, attempted operators are: ["+", "*", "||"]
* 
* @param data - A string that contains data
* @returns The sum of all target values for which a valid operator combination exists
*/
function countValidEquationWithConcatenation(data: string) {
  return countValidEquation(data, ["+", "*", "||"]);
}

export default async function main() {
  const data = await loadFile(7);
  console.log(`Total of valid equations: ${countValidEquation(data)}`);
  console.log(`Total of valid equations with concatenation operator ||: ${countValidEquationWithConcatenation(data)}`);
  console.log("⭐⭐");
}