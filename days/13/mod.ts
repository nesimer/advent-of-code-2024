import { loadFile } from "../tools.ts";

type Machine = {
  A: { x: bigint; y: bigint; cost: bigint };
  B: { x: bigint; y: bigint; cost: bigint };
  prize: { x: bigint; y: bigint };
};

/**
 * Parses the input data and converts it into an array of Machine objects.
 *
 * @param {string} data - The input data containing the machine configurations.
 * @returns {Machine[]} An array of Machine objects.
 */
function toMachines(data: string): Machine[] {
  const buttonRegex = /Button [AB]: X\+(\d+), Y\+(\d+)/;
  const prizeRegex = /Prize: X=(\d+), Y=(\d+)/;
  return data.split("\n\n").map((m) => {
    const [AData, BData, prizeData] = m.split("\n");
    const a = AData.match(buttonRegex)!;
    const b = BData.match(buttonRegex)!;
    const p = prizeData.match(prizeRegex)!;
    return {
      A: { x: BigInt(a[1]), y: BigInt(a[2]), cost: 3n },
      B: { x: BigInt(b[1]), y: BigInt(b[2]), cost: 1n },
      prize: { x: BigInt(p[1]), y: BigInt(p[2]) },
    };
  });
}

// /**
//  * Computes the cost of reaching the prize using the first method with 100 max iterations.
//  *
//  * @param {Machine} machine - The machine to compute the cost for.
//  * @returns {bigint | null} The computed cost or null if the cost cannot be computed.
//  */
// function computeCostOld(machine: Machine): bigint | null {
//   const maxIteration = 100;
//   const { A, B, prize } = machine;

//   let minCost = BigInt(1e18);

//   for (let attemptA = 0n; attemptA < maxIteration; attemptA++) {
//     for (let attemptB = 0n; attemptB < maxIteration; attemptB++) {
//       const x = attemptA * A.x + attemptB * B.x;
//       const y = attemptA * A.y + attemptB * B.y;

//       if (x === prize.x && y === prize.y) {
//         minCost =
//           minCost > attemptA * A.cost + attemptB * B.cost
//             ? attemptA * A.cost + attemptB * B.cost
//             : minCost;
//       }
//     }
//   }

//   return minCost === BigInt(1e18) ? null : minCost;
// }

/**
 * Computes the token cost for a claw machine.
 *
 * This function calculates the cost based on the coordinates
 * and costs of two points (A and B) and a prize point.
 * It uses linear equations to determine the coefficients
 * and checks if the calculations are valid before
 * computing the total cost.
 *
 * @param {Machine} machine - The machine to compute the cost for.
 * @returns {bigint | null} The computed cost as a bigint, or null if the cost cannot be computed.
 */
function computeCost({ A, B, prize }: Machine): bigint | null {
  const nominator = prize.y * B.x - prize.x * B.y;
  const denominator = A.y * B.x - A.x * B.y;
  const coefficientA = nominator / denominator;
  const coefficientB = prize.x - coefficientA * A.x;

  if (nominator % denominator !== 0n || coefficientB % B.x !== 0n) {
    return null;
  }

  return A.cost * coefficientA + B.cost * (coefficientB / B.x);
}

/**
 * Computes the total cost for all machines using the compute function.
 *
 * @param {Machine[]} machines - The list of machines to compute the cost for.
 * @returns {bigint} The total cost for all machines.
 */
function computeAllCost(machines: Machine[]): bigint {
  let totalCost = 0n;
  for (const machine of machines) {
    const cost = computeCost(machine);
    if (cost) {
      totalCost += cost;
    }
  }
  return totalCost;
}

export default async function main() {
  const data = await loadFile(13);
  const machines = toMachines(data);
  const fixedIncrement = BigInt(1e13);
  const fixedMachines = machines.map((m) => ({
    ...m,
    prize: {
      x: m.prize.x + fixedIncrement,
      y: m.prize.y + fixedIncrement,
    },
  }));

  console.log(`Token cost: ${computeAllCost(machines)}`);
  console.log(`Token cost with fixed prizes: ${computeAllCost(fixedMachines)}`);

  console.log("⭐⭐");
}
