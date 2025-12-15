import { formatUnits } from "viem";
import {
  ContributionHistoryResponse,
} from "@/libs/types/subgraph.types";
import {
  FundraiseParticipantTableData,
  FundraiseParticipant,
} from "@/libs/types/world-card";

/**
 * Transform SubgraphContributionHistory data to FundraiseParticipantTableData
 * for display in the FundraiseParticipantsTable component
 */
export const transformContributionHistoryToParticipants = (
  contributionData: ContributionHistoryResponse | undefined
): FundraiseParticipantTableData => {
  if (!contributionData || !contributionData.data || contributionData.data.length === 0) {
    return {
      participants: [],
      totalAmount: 0,
      totalParticipants: 0,
      currency: "AWE",
    };
  }

  // Filter for actual contributions only (not refunds or trading)
  const contributions = contributionData.data.filter(
    (item) => item.contributionType === "CONTRIBUTION"
  );

  // Calculate total amount contributed
  const totalAmountBigInt = contributions.reduce(
    (sum, contribution) => sum + BigInt(contribution.amount),
    BigInt(0)
  );

  const totalAmountNumber = Number(formatUnits(totalAmountBigInt, 18));

  // Transform each contribution into a participant row (preserve duplicates)
  const participants: FundraiseParticipant[] = contributions
    .map((contribution, index) => {
      const contributionAmount = BigInt(contribution.amount);
      const amountNumber = Number(formatUnits(contributionAmount, 18));
      const percentage = totalAmountNumber > 0 ? (amountNumber / totalAmountNumber) * 100 : 0;

      return {
        id: `participant-${index + 1}`,
        walletAddress: contribution.contributorAddress,
        amount: amountNumber,
        percentage,
        timestamp: new Date(parseInt(contribution.timestamp) * 1000), // Convert from Unix timestamp
        tokenAmount: undefined, // Could be calculated based on token economics if needed
        txHash: contribution.transactionHash,
        isPending: false,
      };
    })
    // Sort by amount contributed (descending)
    .sort((a, b) => b.amount - a.amount);

  return {
    participants,
    totalAmount: totalAmountNumber,
    totalParticipants: participants.length,
    currency: "AWE",
  };
};

/**
 * Get recent contributors for a specific DAO from contribution history
 * @param contributionData The contribution history response
 * @param limit Maximum number of recent contributors to return
 */
export const getRecentContributors = (
  contributionData: ContributionHistoryResponse | undefined,
  limit: number = 10
): FundraiseParticipant[] => {
  if (!contributionData || !contributionData.data || contributionData.data.length === 0) {
    return [];
  }

  // Filter and sort by timestamp (most recent first)
  const recentContributions = contributionData.data
    .filter((item) => item.contributionType === "CONTRIBUTION")
    .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
    .slice(0, limit);

  return recentContributions.map((contribution, index) => {
    const amountNumber = Number(formatUnits(BigInt(contribution.amount), 18));
    
    return {
      id: `recent-${index + 1}`,
      walletAddress: contribution.contributorAddress,
      amount: amountNumber,
      percentage: 0, // Would need total fundraising data to calculate
      timestamp: new Date(parseInt(contribution.timestamp) * 1000),
      tokenAmount: undefined,
      txHash: contribution.transactionHash,
      isPending: false,
    };
  });
};

/**
 * Calculate participant statistics from contribution history
 */
export const calculateParticipantStats = (
  contributionData: ContributionHistoryResponse | undefined
) => {
  if (!contributionData || !contributionData.data || contributionData.data.length === 0) {
    return {
      totalContributions: 0,
      totalRefunds: 0,
      uniqueParticipants: 0,
      totalAmountRaised: 0,
      averageContribution: 0,
    };
  }

  const contributions = contributionData.data.filter(
    (item) => item.contributionType === "CONTRIBUTION"
  );
  
  const refunds = contributionData.data.filter(
    (item) => item.contributionType === "REFUND"
  );

  const uniqueParticipants = new Set(
    contributions.map((c) => c.contributorAddress)
  ).size;

  const totalAmountRaised = contributions.reduce(
    (sum, contribution) => sum + Number(formatUnits(BigInt(contribution.amount), 18)),
    0
  );

  const averageContribution = contributions.length > 0 
    ? totalAmountRaised / contributions.length 
    : 0;

  return {
    totalContributions: contributions.length,
    totalRefunds: refunds.length,
    uniqueParticipants,
    totalAmountRaised,
    averageContribution,
  };
};
