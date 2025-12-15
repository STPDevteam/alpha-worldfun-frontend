import {
  useWriteContract,
  UseWriteContractParameters,
  UseWriteContractReturnType,
} from "wagmi";

export const useWriteContractStrict = (
  parameters?: UseWriteContractParameters
): UseWriteContractReturnType => {
  return useWriteContract({
    ...parameters,
    mutation: {
      ...parameters?.mutation,
      retry: false,
    },
  });
};
