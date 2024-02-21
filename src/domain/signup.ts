import { validateCpf } from "./validateCpf";

export interface SignUpInput {
  accountId?: string,
  name: string;
  email: string;
  cpf: string;
  carPlate?: string | null;
  isPassenger?: boolean;
  isDriver?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export async function validateSignUpInput(input: SignUpInput): Promise<ValidationResult> {
  if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/)) {
    return { valid: false, message: "Invalid name" };
  }
  if (!input.email.match(/^(.+)@(.+)$/)) {
    return { valid: false, message: "Invalid email" };
  }
  if (!validateCpf(input.cpf)) {
    return { valid: false, message: "Invalid cpf" };
  }
  if (input.isDriver && !input.carPlate?.match(/[A-Z]{3}[0-9]{4}/)) {
    return { valid: false, message: "Invalid car plate" };
  }
  return { valid: true };
}
