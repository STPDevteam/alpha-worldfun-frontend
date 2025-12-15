/**
 * Vesting Schedule Utility
 * Generates month-based vesting schedule preview data
 */

export interface VestingScheduleItem {
  /** Order from TGE (0 = TGE, 1 = Month 1, 2 = Month 2, etc.) */
  order: number;
  /** Display time label (TGE, Month 1, Month 2, etc.) */
  timeLabel: string;
  /** Date of the vesting event */
  date: Date;
  /** Percentage of total tokens unlocked at this time */
  percentage: number;
  /** Amount of tokens unlocked at this time */
  vestingAmount: number;
  /** Cumulative percentage unlocked up to this point */
  cumulativePercentage: number;
  /** Cumulative amount unlocked up to this point */
  cumulativeAmount: number;
}

export interface VestingScheduleParams {
  /** Target fundraise amount (default: 100,000,000) */
  targetFundraise?: number;
  /** Percentage unlocked at TGE (0-100) */
  unlockAtTGE: number;
  /** Vesting duration in months */
  vestingDuration: number;
  /** TGE date */
  tgeDate: Date;
  /** Vesting start date (can be same as TGE or later) */
  vestingStartDate: Date;
}

/**
 * Calculates the correct vesting date for each month, handling edge cases
 * when the original day doesn't exist in the target month
 */
function calculateMonthlyVestingDate(startDate: Date, monthsToAdd: number): Date {
  const originalDay = startDate.getDate();
  const result = new Date(startDate);
  
  // Add months first
  result.setMonth(result.getMonth() + monthsToAdd);
  
  // Handle cases where the original day doesn't exist in the target month
  // For example: Jan 31 + 1 month should be Feb 28/29, not Mar 3
  if (result.getDate() !== originalDay) {
    // Go to the last day of the previous month
    result.setDate(0);
  }
  
  return result;
}

/**
 * Generates a month-based vesting schedule
 */
export function generateVestingSchedule(params: VestingScheduleParams): VestingScheduleItem[] {
  const {
    targetFundraise = 100_000_000,
    unlockAtTGE,
    vestingDuration,
    tgeDate,
    vestingStartDate,
  } = params;

  const schedule: VestingScheduleItem[] = [];
  
  const remainingPercentage = 100 - unlockAtTGE;
  
  const monthlyVestingPercentage = vestingDuration > 0 ? remainingPercentage / vestingDuration : 0;

  schedule.push({
    order: 0,
    timeLabel: 'TGE',
    date: new Date(tgeDate),
    percentage: unlockAtTGE,
    vestingAmount: (targetFundraise * unlockAtTGE) / 100,
    cumulativePercentage: unlockAtTGE,
    cumulativeAmount: (targetFundraise * unlockAtTGE) / 100,
  });

  // Add monthly vesting entries
  if (vestingDuration > 0 && monthlyVestingPercentage > 0) {
    for (let month = 1; month <= vestingDuration; month++) {
      const vestingDate = calculateMonthlyVestingDate(vestingStartDate, month);

      const cumulativePercentage = unlockAtTGE + (monthlyVestingPercentage * month);
      const cumulativeAmount = (targetFundraise * cumulativePercentage) / 100;

      schedule.push({
        order: month,
        timeLabel: `Month ${month}`,
        date: vestingDate,
        percentage: monthlyVestingPercentage,
        vestingAmount: (targetFundraise * monthlyVestingPercentage) / 100,
        cumulativePercentage,
        cumulativeAmount,
      });
    }
  }

  return schedule;
}

/**
 * Gets a preview of the vesting schedule (first few months)
 */
export function getVestingSchedulePreview(
  params: VestingScheduleParams,
  previewMonths: number = 6
): VestingScheduleItem[] {
  const fullSchedule = generateVestingSchedule(params);
  return fullSchedule.slice(0, Math.min(previewMonths + 1, fullSchedule.length)); // +1 to include TGE
}

/**
 * Validates vesting schedule parameters
 */
export function validateVestingParams(params: Partial<VestingScheduleParams>): string[] {
  const errors: string[] = [];

  if (params.unlockAtTGE !== undefined) {
    if (params.unlockAtTGE < 0 || params.unlockAtTGE > 100) {
      errors.push('Unlock at TGE must be between 0 and 100 percent');
    }
  }

  if (params.vestingDuration !== undefined && params.vestingDuration < 0) {
    errors.push('Vesting duration must be non-negative');
  }

  if (params.targetFundraise !== undefined && params.targetFundraise <= 0) {
    errors.push('Target fundraise must be greater than 0');
  }

  if (params.tgeDate && params.vestingStartDate) {
    if (params.vestingStartDate < params.tgeDate) {
      errors.push('Vesting start date cannot be before TGE date');
    }
  }

  return errors;
}

