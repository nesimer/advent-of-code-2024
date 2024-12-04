import { loadFile } from "../tools.ts";

/**
 * Reads a file containing two lists of numbers separated by spaces,
 * parses the file, and returns the two lists as arrays of numbers.
 *
 * @returns {Promise<number[][]>} A promise that resolves to a tuple containing two arrays of numbers.
 */
function parse(data: string) {
  const lines = data.split("\n").map((line) => line.trim());
  return lines.reduce((acc, line) => {
    const reportsData = line.split(/\s+/).map((x) => +x);
    return [...acc, reportsData];
  }, [] as number[][]);
}

/**
 * Determines if a report is safe.
 *
 * A report is considered safe
 * if
 * all distances between consecutive elements are between 1 and 3 (inclusive)
 * and
 * all distances have the same sign (either all positive or all negative).
 *
 * @param {number[]} report - The list of numbers to check.
 * @returns {boolean} True if the report is safe, false otherwise.
 */
function isSafe(report: number[]): boolean {
  const direction = Math.sign(report[0] - report[1]);
  const stepState = report.map((item, index, array) => {
    // handle last element properly
    if (index === array.length - 1) {
      return undefined;
    }
    const difference = item - array[index + 1];
    return (
      Math.abs(difference) >= 1 &&
      Math.abs(difference) <= 3 &&
      Math.sign(difference) === direction
    );
  });
  return stepState.filter(Boolean).length === report.length - 1;
}

/**
 * Counts the number of safe reports.
 *
 * @param {number[][]} reports - A list of reports, each containing a list of numbers.
 * @returns {number} The number of safe reports.
 */
function countSafeReports(reports: number[][]): number {
  return reports.filter(isSafe).length;
}

/**
 * Counts the number of dampened safe reports.
 *
 * A report is considered dampened safe
 * if
 * it is either safe
 * or
 * can become safe by removing one element.
 *
 * @param {number[][]} reports - A list of reports, each containing a list of numbers.
 * @returns {number} The number of dampened safe reports.
 */
function countDampenedSafeReports(reports: number[][]): number {
  return reports.filter(
    (item) =>
      isSafe(item) ||
      item.map((_, index, array) => array.toSpliced(index, 1)).some(isSafe) // remove one element and check if it's safe
  ).length;
}

export default async function main() {
  const data = await loadFile(2);
  const reports = await parse(data);
  console.log(`Total safe reports: ${countSafeReports(reports)}`);
  console.log(
    `Total dampened safe reports: ${countDampenedSafeReports(reports)}`
  );
  console.log("⭐⭐");
}
