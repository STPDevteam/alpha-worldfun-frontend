import {
  decodeEventLog,
  type Hash,
  type PublicClient,
  type TransactionReceipt,
} from "viem";

export const extractEvent = async <T extends string>(
  publicClient: PublicClient,
  abi: any,
  receipt: TransactionReceipt | Hash,
  eventName: string
) => {
  // Get receipt if hash was provided
  let transactionReceipt: TransactionReceipt;
  if (typeof receipt === "string") {
    transactionReceipt = await publicClient.waitForTransactionReceipt({
      hash: receipt as `0x${string}`,
    });
  } else {
    transactionReceipt = receipt;
  }

  // Decode and find the specified event
  return transactionReceipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi,
          data: log.data,
          topics: log.topics,
        }) as any;
      } catch (error) {
        return null;
      }
    })
    .find((log) => {
      return log?.eventName === eventName;
    });
};
