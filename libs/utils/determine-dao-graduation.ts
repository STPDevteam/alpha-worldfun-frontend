import { FundraisingType, TokenStatus } from "@/libs/types";

export interface DetermineDaoGraduationParams {
  fundraisingType?: FundraisingType | null;
  status?: TokenStatus | null;
}

export const determineDaoGraduation = ({
  fundraisingType,
  status,
}: DetermineDaoGraduationParams): boolean => {
  if (!status || status !== TokenStatus.LIVE) {
    return false;
  }

  if (!fundraisingType) {
    return true;
  }

  return (
    fundraisingType === FundraisingType.FIXED_PRICE ||
    fundraisingType === FundraisingType.BONDING_CURVE
  );
};
