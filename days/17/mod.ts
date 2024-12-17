import { loadFile } from "../tools.ts";

type Registers = { A: bigint; B: bigint; C: bigint };
type Program = bigint[];

enum Opcode {
  ADV = 0,
  BXL = 1,
  BST = 2,
  JNZ = 3,
  BXC = 4,
  OUT = 5,
  BDV = 6,
  CDV = 7,
}

/**
 * Parses the input data to extract the initial state of the registers and the program.
 * @param data - The input data as a string.
 * @returns A tuple containing the initial state of the registers and the program.
 */
function parse(data: string): [Registers, Program] {
  const [rawRegisters, rawProgram] = data.split("\n\n");

  const rawRegistersSplitted = rawRegisters.split("\n");
  const registers: Registers = {
    A: BigInt(rawRegistersSplitted[0].split(": ")[1]),
    B: BigInt(rawRegistersSplitted[1].split(": ")[1]),
    C: BigInt(rawRegistersSplitted[2].split(": ")[1]),
  };

  const program: Program = rawProgram.split(": ")[1].split(",").map(BigInt);

  return [registers, program];
}

/**
 * Gets the value of a combo operand.
 * @param operand - The operand to evaluate.
 * @param registers - The current state of the registers.
 * @returns The value of the combo operand.
 */
function getComboOperandValue(operand: bigint, registers: Registers): bigint {
  if (operand <= 3n) return BigInt(operand);
  if (operand === 4n) return registers.A;
  if (operand === 5n) return registers.B;
  if (operand === 6n) return registers.C;
  throw new Error("Invalid combo operand");
}

/**
 * Performs a division operation for the ADV, BDV, and CDV instructions.
 * @param operand - The operand for the division.
 * @param registers - The current state of the registers.
 * @returns The result of the division.
 */
function division(operand: bigint, registers: Registers): bigint {
  return registers.A / BigInt(2) ** getComboOperandValue(operand, registers);
}

/**
 * A record of operations indexed by opcode.
 * Each operation is a function that takes an operand, the current state of the registers, and an output array.
 */
const operationByOpcode: Record<
  Opcode,
  (operand: bigint, registers: Registers, output: bigint[]) => void
> = {
  /**
   * ADV (opcode 0): Performs division and stores the result in register A.
   * @param operand - The operand for the division.
   * @param registers - The current state of the registers.
   */
  [Opcode.ADV]: (operand: bigint, registers: Registers) => {
    registers.A = division(operand, registers);
  },
  /**
   * BDV (opcode 6): Performs division and stores the result in register B.
   * @param operand - The operand for the division.
   * @param registers - The current state of the registers.
   */
  [Opcode.BDV]: (operand: bigint, registers: Registers) => {
    registers.B = division(operand, registers);
  },
  /**
   * CDV (opcode 7): Performs division and stores the result in register C.
   * @param operand - The operand for the division.
   * @param registers - The current state of the registers.
   */
  [Opcode.CDV]: (operand: bigint, registers: Registers) => {
    registers.C = division(operand, registers);
  },
  /**
   * BXL (opcode 1): Calculates the bitwise XOR of register B and the operand, then stores the result in register B.
   * @param operand - The operand for the XOR operation.
   * @param registers - The current state of the registers.
   */
  [Opcode.BXL]: (operand: bigint, registers: Registers) => {
    registers.B ^= BigInt(operand);
  },
  /**
   * BST (opcode 2): Calculates the value of the operand modulo 8 and stores the result in register B.
   * @param operand - The operand for the modulo operation.
   * @param registers - The current state of the registers.
   */
  [Opcode.BST]: (operand: bigint, registers: Registers) => {
    registers.B = getComboOperandValue(operand, registers) % 8n;
  },
  /**
   * BXC (opcode 4): Calculates the bitwise XOR of register B and register C, then stores the result in register B.
   * @param _operand - The operand (ignored).
   * @param registers - The current state of the registers.
   */
  [Opcode.BXC]: (_operand: bigint, registers: Registers) => {
    registers.B ^= registers.C;
  },
  /**
   * OUT (opcode 5): Calculates the value of the operand modulo 8 and outputs that value.
   * @param operand - The operand for the modulo operation.
   * @param registers - The current state of the registers.
   * @param output - The output array to store the result.
   * @throws Will throw an error if the operand is invalid.
   */
  [Opcode.OUT]: (operand: bigint, registers: Registers, output: bigint[]) => {
    if (operand < 7) {
      output.push(getComboOperandValue(operand, registers) % 8n);
    } else {
      throw new Error("Invalid operand for OUT instruction");
    }
  },
  /**
   * JNZ (opcode 3): nothink to do.
   */
  [Opcode.JNZ]: () => {},
};

/**
 * Executes the program and returns the output as an array of bigints.
 * @param registers - The initial state of the registers.
 * @param program - The program to execute.
 * @returns The output produced by the program.
 */
function executeProgram(registers: Registers, program: Program): bigint[] {
  let instruction = 0;
  const output: bigint[] = [];

  while (instruction < program.length) {
    const opcode: Opcode = Number(program[instruction]);
    const operand = program[instruction + 1];
    if (opcode === Opcode.JNZ && registers.A !== 0n) {
      instruction = Number(operand);
    } else {
      operationByOpcode[opcode](operand, registers, output);
      instruction += 2;
    }
  }

  return output;
}

/**
 * Finds the lowest positive initial value for register A that causes the program to output a copy of itself.
 * @param value - The initial value to start the search from.
 * @param iteration - The current iteration of the search.
 * @param program - The program to execute.
 * @param registerB - The initial value of register B.
 * @param registerC - The initial value of register C.
 * @returns The lowest positive initial value for register A.
 */
function findLowestInitialValueForA(
  value: bigint,
  iteration: number,
  program: Program,
  registerB: bigint,
  registerC: bigint
): bigint {
  if (iteration < 0) {
    return value;
  }
  for (let a = value * 8n; a < value * 8n + 8n; a++) {
    const result = executeProgram(
      { A: a, B: registerB, C: registerC },
      program
    );
    if (result[0] === program[iteration]) {
      const result = findLowestInitialValueForA(
        a,
        iteration - 1,
        program,
        registerB,
        registerC
      );
      if (result >= 0) {
        return result;
      }
    }
  }
  return -1n;
}

export default async function main() {
  const data = await loadFile(17);
  const [registers, program] = parse(data);

  const programOutput = executeProgram({ ...registers }, program).join(",");
  const lowestInitialValueForA = findLowestInitialValueForA(
    0n,
    program.length - 1,
    program,
    registers.B,
    registers.C
  );
  console.log(`Output of the program: ${programOutput}`);
  console.log(
    `Lowest positive initial value for register A: ${lowestInitialValueForA}`
  );

  console.log("⭐⭐");
}
