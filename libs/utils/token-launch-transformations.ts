import { FormDataType } from "@/components/launch-token/form/form-data-type";
import { CreateDaoPoolParams, VestingSchedule } from "@/libs/types";

export function transformToContractParams(
  formData: FormDataType
): CreateDaoPoolParams {
  // Validate required fields
  validateFormData(formData);

  return {
    name: formData.name,
    symbol: formData.symbol.toUpperCase(),
    agentId: formData.agentId,
  };
}

/**
 * Validate form data before transformation
 */
function validateFormData(formData: FormDataType): void {
  if (!formData.name?.trim()) {
    throw new Error("Token name is required");
  }

  if (!formData.symbol?.trim()) {
    throw new Error("Token symbol is required");
  }
}

export function prepareContractCall(formData: FormDataType): readonly [
  string, // name
  string // symbol
] {
  const params = transformToContractParams(formData);

  return [params.name, params.symbol] as const;
}
