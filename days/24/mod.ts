import { loadFile } from "../tools.ts";

interface WireValues {
  [key: string]: number;
}

type Operator = "AND" | "OR" | "XOR";

interface Gate {
  input1: string;
  input2: string;
  operation: Operator;
  output: string;
}

/**
 * Parses the input string into wire values and gate definitions.
 *
 * @param input - The input string containing wire values and gate definitions, separated by two newline characters.
 * @returns An object containing:
 *  - `wireValues`: A mapping of wire names to their integer values.
 *  - `gates`: An array of gate definitions including input wires, operation, and output wire.
 */
function parseInput(input: string): { wireValues: WireValues; gates: Gate[] } {
  const [wireSection, gateSection] = input.split("\n\n");

  const wireValues: WireValues = {};
  wireSection.split("\n").forEach((line) => {
    const [wire, value] = line.split(": ");
    wireValues[wire] = parseInt(value, 10);
  });

  const gates: Gate[] = [];
  gateSection.split("\n").forEach((line) => {
    const [left, output] = line.split(" -> ");
    const [input1, operation, input2] = left.split(" ");
    gates.push({ input1, input2, operation: operation as Gate["operation"], output });
  });

  return { wireValues, gates };
}

/**
 * Simulates the logic gates to resolve wire values based on initial inputs and gate definitions.
 *
 * @param wireValues - The initial wire values.
 * @param gates - The array of gate definitions.
 * @returns The updated wire values after resolving all gates.
 */
function simulateGates(wireValues: WireValues, gates: Gate[]): WireValues {
  const unresolvedGates = new Set(gates);

  while (unresolvedGates.size > 0) {
    for (const gate of Array.from(unresolvedGates)) {
      const { input1, input2, operation, output } = gate;

      if (wireValues[input1] !== undefined && wireValues[input2] !== undefined) {
        switch (operation) {
          case "AND":
            wireValues[output] = wireValues[input1] & wireValues[input2];
            break;
          case "OR":
            wireValues[output] = wireValues[input1] | wireValues[input2];
            break;
          case "XOR":
            wireValues[output] = wireValues[input1] ^ wireValues[input2];
            break;
        }
        unresolvedGates.delete(gate);
      }
    }
  }

  return wireValues;
}

/**
 * Computes a binary number from wire values with a specific prefix.
 *
 * @param wireValues - The resolved wire values.
 * @param prefix - The prefix to filter wire names.
 * @returns The binary number derived from the sorted and concatenated wire values with the given prefix.
 */
function computeBinaryNumber(wireValues: WireValues, prefix: string): number {
  const wires = Object.keys(wireValues)
    .filter((key) => key.startsWith(prefix))
    .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));

  const binaryString = wires.map((wire) => wireValues[wire]).reverse().join("");
  return parseInt(binaryString, 2);
}

/**
 * Finds a gate by its input wires and operator type.
 *
 * @param input1 - The first input wire name.
 * @param input2 - The second input wire name.
 * @param operator - The operation of the gate (e.g., "AND", "OR", "XOR").
 * @param gateDefinitions - The list of gate definitions to search.
 * @returns The name of the output wire of the matching gate, or undefined if no match is found.
 */
function findGateByInputs(
  input1: string,
  input2: string,
  operator: Operator,
  gateDefinitions: Gate[],
): string | undefined {
  for (const gate of gateDefinitions) {
    if (gate.operation !== operator) continue;

    const matchesInputs = (gate.input1 === input1 && gate.input2 === input2) ||
      (gate.input1 === input2 && gate.input2 === input1);

    if (matchesInputs) return gate.output;
  }
  return undefined;
}

/**
 * Identifies swapped wires in gate definitions.
 *
 * @param gateDefinitions - The list of gate definitions to analyze.
 * @returns An array of swapped wire names sorted in ascending order.
 */
function findSwappedWires(gateDefinitions: Gate[]): string[] {
  const swappedWires: string[] = [];
  let carryIn: string | null = null;

  for (let pos = 0; pos < 45; pos++) {
    const bitIndex = pos.toString().padStart(2, "0");

    const components = {
      xorGate: findGateByInputs(
        `x${bitIndex}`,
        `y${bitIndex}`,
        "XOR",
        gateDefinitions,
      ),
      andGate: findGateByInputs(
        `x${bitIndex}`,
        `y${bitIndex}`,
        "AND",
        gateDefinitions,
      ),
      carryAndGate: undefined as string | undefined,
      sumBit: undefined as string | undefined,
      carryOut: undefined as string | undefined,
    };

    if (!components.xorGate || !components.andGate) continue;

    if (carryIn) {
      components.carryAndGate = findGateByInputs(
        carryIn,
        components.xorGate,
        "AND",
        gateDefinitions,
      );

      if (!components.carryAndGate) {
        [components.andGate, components.xorGate] = [
          components.xorGate,
          components.andGate,
        ];
        swappedWires.push(components.xorGate, components.andGate);
        components.carryAndGate = findGateByInputs(
          carryIn,
          components.xorGate,
          "AND",
          gateDefinitions,
        );
      }

      components.sumBit = findGateByInputs(
        carryIn,
        components.xorGate,
        "XOR",
        gateDefinitions,
      );

      if (!components.sumBit || !components.carryAndGate) continue;

      if (components.xorGate.startsWith("z")) {
        [components.xorGate, components.sumBit] = [
          components.sumBit,
          components.xorGate,
        ];
        swappedWires.push(components.xorGate, components.sumBit);
      }
      if (components.andGate.startsWith("z")) {
        [components.andGate, components.sumBit] = [
          components.sumBit,
          components.andGate,
        ];
        swappedWires.push(components.andGate, components.sumBit);
      }
      if (components.carryAndGate.startsWith("z")) {
        [components.carryAndGate, components.sumBit] = [
          components.sumBit,
          components.carryAndGate,
        ];
        swappedWires.push(components.carryAndGate, components.sumBit);
      }

      components.carryOut = findGateByInputs(
        components.carryAndGate,
        components.andGate,
        "OR",
        gateDefinitions,
      );
      if (!components.carryOut) continue;

      if (
        components.carryOut.startsWith("z") && components.carryOut !== "z45"
      ) {
        [components.carryOut, components.sumBit] = [
          components.sumBit,
          components.carryOut,
        ];
        swappedWires.push(components.carryOut, components.sumBit);
      }
    }

    carryIn = components.carryOut ?? components.andGate;
  }

  return [...new Set(swappedWires)].sort();
}

export default async function main() {
  const data = await loadFile(24);

  const { wireValues, gates } = parseInput(data);
  const finalWireValues = simulateGates(wireValues, gates);

  const swappedWires = findSwappedWires(gates);

  console.log(`Total computed from "z" wires: ${computeBinaryNumber(finalWireValues, "z")}`);
  console.log(`8 wires involved in four swapped output pairs: ${swappedWires.join(",")}`);

  console.log("⭐⭐");
}
