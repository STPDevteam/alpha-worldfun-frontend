"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, generateVestingSchedule } from "@/libs/utils";
import { FormattedTokenAmount } from "@bangbu/react-intl-formatted-token";
import { PaginationBar } from "../common/pagination";
import { useEffect, useState } from "react";
interface VestingSchedulePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unlockAtTGE: number;
  vestingDuration: number;
  vestingStartDate: string;
  tgeDate: string;
  targetFundraise?: number;
  previewMonths?: number;
  symbol?: string;
}

export const VestingSchedulePreviewDialog = ({
  isOpen,
  onClose,
  unlockAtTGE,
  vestingDuration,
  vestingStartDate,
  tgeDate,
  targetFundraise = 100000000,
  symbol = "",
}: VestingSchedulePreviewDialogProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  const safeSetPage = (newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(clampedPage);
  };

  const vestingSchedule = generateVestingSchedule({
    targetFundraise,
    unlockAtTGE,
    vestingDuration,
    tgeDate: new Date(tgeDate),
    vestingStartDate: new Date(vestingStartDate),
  });

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(vestingSchedule.length / pageSize));
    setTotalPages(newTotalPages);
  }, [vestingSchedule, pageSize]);

  useEffect(() => {
    if (totalPages > 0) {
      const safePage = Math.min(page, totalPages);
      if (safePage !== page) {
        setPage(safePage);
      }
    }
  }, [vestingSchedule, totalPages, page]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const previewSchedule = vestingSchedule.slice(startIndex, endIndex);

  const title = "Vesting Schedule Preview";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black-500 backdrop-blur-sm" />
      <DialogTitle></DialogTitle>
      <DialogContent
        showCloseButton={true}
        title={title}
        className={cn(
          "bg-[#0D0D0E]",
          "border-2 border-[#1F1F22] rounded-2xl sm:rounded-2xl",
          "p-0",
          "shadow-[0px_0px_32px_0px_rgba(11,5,16,0.2)]",
          "w-[calc(100dvw-32px)] md:min-w-[610px] md:w-full",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col items-center gap-6 p-6 sm:gap-6 sm:p-6 overflow-hidden">
          <Text variant="xl" weight="medium" className="text-white">
            {title}
          </Text>
            <div className="w-full overflow-x-auto overflow-y-hidden max-w-full">
              <Table className="">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-10 flex justify-center items-center">
                      <Text className="text-grey-200">-</Text>
                    </TableHead>
                    <TableHead className="min-w-[170px]">
                      <Text className="text-grey-200">Time</Text>
                    </TableHead>
                    <TableHead className="min-w-[123px]">
                      <Text className="text-grey-200 flex items-center justify-end">
                        Percentage
                      </Text>
                    </TableHead>
                    <TableHead className="min-w-[210px]">
                      <Text className="text-grey-200 flex items-center justify-end">
                        Vesting Amount
                      </Text>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody className="max-h-[50vh] overflow-y-auto">
                {previewSchedule.map((item) => (
                  <TableRow key={item.order}>
                    <TableCell className="min-w-10">
                      <div className="flex justify-center">
                        <Text className="text-light">
                          {item.order === 0 ? "TGE" : item.order}
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[170px]">
                      <Text className="text-light whitespace-nowrap">
                        {item.date.toLocaleDateString()}
                      </Text>
                    </TableCell>
                    <TableCell className="min-w-[123px]">
                      <div className="flex items-center justify-end">
                        <Text className="text-light whitespace-nowrap">
                          <FormattedTokenAmount value={item.percentage} />%
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[210px]">
                      <div className="flex items-center justify-end gap-2">
                        <Text className="text-light whitespace-nowrap">
                          <FormattedTokenAmount value={item.vestingAmount} />
                        </Text>
                        <span className="text-grey-200 whitespace-nowrap">
                          {symbol}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              goToPage={safeSetPage}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
